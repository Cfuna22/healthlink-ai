import { type IAIProvider } from "../aiBrain";

export class PerplexityProvider implements IAIProvider {
  name = "perplexity";
  isActive = true;
  priority = 8;
  rateLimit = 50;
  
  private apiKey: string;
  private baseUrl = "https://api.perplexity.ai/chat/completions";

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || "default_key";
  }

  async chat(messages: any[], options: any = {}): Promise<string> {
    try {
      const response = await this.makeRequest({
        model: options.model || "llama-3.1-sonar-small-128k-online",
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: options.temperature || 0.2,
        max_tokens: options.maxTokens || 1000,
        top_p: 0.9,
        search_recency_filter: "month",
        return_citations: true,
        return_related_questions: false
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response.";
    } catch (error) {
      throw new Error(`Perplexity chat error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyze(input: any, type: string, options: any = {}): Promise<any> {
    try {
      let systemPrompt = "";
      let userPrompt = "";

      switch (type) {
        case 'symptoms':
          systemPrompt = `You are a medical research AI with access to the latest medical literature and clinical guidelines. Provide evidence-based symptom analysis with current research backing.`;
          userPrompt = `Analyze these symptoms using the latest medical research and clinical guidelines:

Patient Information:
- Symptoms: ${input.symptoms}
- Age: ${input.patientInfo?.age || 'Not provided'}
- Gender: ${input.patientInfo?.gender || 'Not provided'}
- Duration: ${input.patientInfo?.duration || 'Not provided'}

Please provide analysis with current medical evidence and cite recent research. Format as JSON:
{
  "condition": "Most likely condition based on current research",
  "confidence": 85,
  "evidenceBased": "Research citations and evidence",
  "recentFindings": "Latest medical research relevant to symptoms",
  "clinicalGuidelines": "Current clinical practice recommendations",
  "recommendations": ["Evidence-based recommendations"],
  "urgency": "low/medium/high",
  "citations": ["Research papers and sources"],
  "differentialDiagnosis": ["Other possibilities from recent literature"]
}`;
          break;

        case 'disease_trends':
          systemPrompt = `You are a real-time epidemiological AI with access to current disease surveillance data and health trends worldwide.`;
          userPrompt = `Analyze current disease trends and outbreaks:

Region: ${input.region || 'Global'}
Disease Focus: ${input.diseaseType || 'General health trends'}

Provide real-time trend analysis in JSON format:
{
  "currentOutbreaks": [
    {
      "disease": "Disease name",
      "region": "Affected area",
      "severity": "Current outbreak status",
      "trend": "increasing/stable/decreasing",
      "lastUpdated": "Recent data timestamp"
    }
  ],
  "emergingThreats": [],
  "seasonalPatterns": {},
  "globalHealth": {
    "alerts": [],
    "recommendations": [],
    "vaccination": "Current vaccination guidance"
  },
  "dataSource": "WHO, CDC, local health authorities",
  "reliability": "High - real-time data",
  "lastUpdate": "Current timestamp"
}`;
          break;

        case 'research_updates':
          systemPrompt = `You are a medical research AI providing the latest findings and breakthroughs in healthcare and medical science.`;
          userPrompt = `Find the latest medical research on: ${input.query}

Provide comprehensive research update in JSON format:
{
  "latestFindings": [
    {
      "title": "Research title",
      "summary": "Key findings",
      "implications": "Clinical significance",
      "date": "Publication date",
      "journal": "Source publication",
      "reliability": "peer-reviewed/preprint/clinical trial"
    }
  ],
  "breakthroughs": [],
  "clinicalTrials": "Ongoing relevant trials",
  "futureDirections": "Where research is heading",
  "practicalApplications": "How this affects patient care",
  "limitations": "Study limitations and considerations"
}`;
          break;

        default:
          throw new Error(`Unsupported analysis type: ${type}`);
      }

      const response = await this.makeRequest({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        search_recency_filter: "week",
        return_citations: true,
        return_related_questions: false
      });

      // Parse JSON response if possible
      try {
        return JSON.parse(response.choices[0].message.content || '{}');
      } catch {
        // If not valid JSON, return structured response
        return {
          analysis: response.choices[0].message.content,
          citations: response.citations || [],
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      throw new Error(`Perplexity analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async predict(data: any, options: any = {}): Promise<any> {
    try {
      const systemPrompt = `You are a real-time epidemiological forecasting AI with access to current global health data and outbreak surveillance systems.`;
      const userPrompt = `Analyze current data for disease prediction and health trends:

Data: ${JSON.stringify(data)}
Region: ${data.region || 'Global'}
Focus: Disease outbreak prediction and health trend analysis

Provide real-time prediction based on current global health data in JSON format:
{
  "realTimePredictions": [
    {
      "diseaseType": "Disease name",
      "probability": 0.75,
      "timeframe": "2-6 weeks",
      "currentIndicators": ["Early warning signs"],
      "dataSource": "Global health surveillance",
      "confidence": "High - based on current data"
    }
  ],
  "globalTrends": {
    "emerging": ["New health concerns"],
    "declining": ["Improving health metrics"],
    "seasonal": ["Expected seasonal patterns"]
  },
  "riskFactors": {
    "environmental": [],
    "social": [],
    "economic": []
  },
  "recommendations": {
    "immediate": ["Actions for next 2 weeks"],
    "surveillance": ["Monitoring recommendations"],
    "preparation": ["Preparedness measures"]
  },
  "dataReliability": "Assessment of current data quality",
  "lastUpdated": "Current timestamp"
}`;

      const response = await this.makeRequest({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        search_recency_filter: "day",
        return_citations: true
      });

      try {
        return JSON.parse(response.choices[0].message.content || '{}');
      } catch {
        return {
          prediction: response.choices[0].message.content,
          citations: response.citations || [],
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      throw new Error(`Perplexity prediction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async educate(query: string, options: any = {}): Promise<any> {
    try {
      const level = options.level || 'intermediate';
      const systemPrompt = `You are a medical education AI with access to the latest medical literature, clinical guidelines, and educational resources.`;
      const userPrompt = `Create comprehensive, evidence-based educational content about: ${query}

Education Level: ${level}
Include the latest research findings and current clinical practice.

Provide educational content in JSON format:
{
  "title": "Current and accurate title",
  "overview": "Up-to-date overview with latest understanding",
  "currentResearch": "Latest findings and research",
  "evidenceBase": "Quality of current evidence",
  "keyPoints": [
    {
      "point": "Main concept",
      "explanation": "Current understanding",
      "research": "Supporting research",
      "clinicalEvidence": "Evidence level"
    }
  ],
  "practicalApplications": "How this applies in current practice",
  "controversies": "Current debates or uncertainties",
  "futureDirections": "Where research is heading",
  "clinicalGuidelines": "Current professional recommendations",
  "resources": {
    "latestPapers": [],
    "guidelines": [],
    "educationalMaterials": []
  },
  "lastUpdated": "Current timestamp"
}`;

      const response = await this.makeRequest({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        search_recency_filter: "month",
        return_citations: true
      });

      try {
        return JSON.parse(response.choices[0].message.content || '{}');
      } catch {
        return {
          educational_content: response.choices[0].message.content,
          citations: response.citations || [],
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      throw new Error(`Perplexity education error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processEmotion(input: any, inputType: string, options: any = {}): Promise<any> {
    try {
      const systemPrompt = `You are a mental health AI with access to the latest research in psychology, psychiatry, and emotional wellness.`;
      const userPrompt = `Analyze emotional state using current mental health research and evidence-based approaches:

Input Type: ${inputType}
Data: ${JSON.stringify(input)}

Provide evidence-based emotional analysis in JSON format:
{
  "emotionalAssessment": {
    "primaryEmotions": [],
    "intensity": 0.8,
    "stability": "stable/fluctuating"
  },
  "researchBased": {
    "therapeuticApproaches": ["Evidence-based interventions"],
    "currentBestPractices": ["Latest treatment recommendations"],
    "emergingTreatments": ["New therapeutic options"]
  },
  "riskAssessment": {
    "level": "low/medium/high",
    "evidenceBase": "Research supporting assessment"
  },
  "recommendations": {
    "evidenceBased": ["Research-backed recommendations"],
    "resources": ["Current therapeutic resources"],
    "monitoring": ["Evidence-based tracking methods"]
  },
  "citations": ["Supporting research"],
  "lastUpdated": "Current timestamp"
}`;

      const response = await this.makeRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        search_recency_filter: "month",
        return_citations: true
      });

      try {
        return JSON.parse(response.choices[0].message.content || '{}');
      } catch {
        return {
          emotion_analysis: response.choices[0].message.content,
          citations: response.citations || [],
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      throw new Error(`Perplexity emotion analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async makeRequest(data: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Real-time health monitoring specific to Perplexity
  async getCurrentHealthTrends(region?: string): Promise<any> {
    try {
      const response = await this.makeRequest({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [{
          role: "user",
          content: `What are the current health trends, disease outbreaks, and health alerts ${region ? `in ${region}` : 'globally'}? Include vaccination updates, seasonal health concerns, and any emerging health threats.`
        }],
        search_recency_filter: "day",
        return_citations: true,
        return_related_questions: true
      });

      return {
        trends: response.choices[0].message.content,
        citations: response.citations || [],
        related_questions: response.related_questions || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Perplexity health trends error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}