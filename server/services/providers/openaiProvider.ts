import OpenAI from "openai";
import { type IAIProvider } from "../aiBrain";

export class OpenAIProvider implements IAIProvider {
  name = "openai";
  isActive = true;
  priority = 10;
  rateLimit = 100;
  
  private client: OpenAI;

  constructor() {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    this.client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || "default_key" 
    });
  }

  async chat(messages: any[], options: any = {}): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || "gpt-5",
        messages: messages.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        ...(options.responseFormat && { response_format: options.responseFormat })
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response.";
    } catch (error) {
      throw new Error(`OpenAI chat error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyze(input: any, type: string, options: any = {}): Promise<any> {
    try {
      let systemPrompt = "";
      let userPrompt = "";
      let responseFormat = { type: "json_object" as const };

      switch (type) {
        case 'symptoms':
          systemPrompt = `You are an advanced medical AI assistant specialized in symptom analysis. Analyze symptoms and provide structured medical insights following evidence-based medicine principles.`;
          userPrompt = `Analyze the following symptoms and provide a comprehensive assessment:

Patient Information:
- Symptoms: ${input.symptoms}
- Age: ${input.patientInfo?.age || 'Not provided'}
- Gender: ${input.patientInfo?.gender || 'Not provided'}
- Duration: ${input.patientInfo?.duration || 'Not provided'}
- Medical History: ${input.patientInfo?.history || 'Not provided'}

Provide your analysis in JSON format with the following structure:
{
  "condition": "Most likely condition name",
  "confidence": 85,
  "description": "Detailed medical explanation",
  "recommendations": ["Specific actionable recommendations"],
  "urgency": "low/medium/high",
  "differentialDiagnosis": ["Alternative conditions to consider"],
  "redFlags": ["Warning signs requiring immediate attention"],
  "followUp": "Recommended follow-up timeframe"
}`;
          break;

        case 'nutrition':
          systemPrompt = `You are a certified nutritionist AI specialized in personalized nutrition analysis and meal planning.`;
          userPrompt = `Analyze the following nutritional data and provide comprehensive guidance:

Food Data: ${JSON.stringify(input.foodData)}
Health Goals: ${JSON.stringify(input.goals)}

Provide analysis in JSON format:
{
  "nutritionalBreakdown": {
    "calories": 0,
    "macronutrients": {"protein": 0, "carbs": 0, "fats": 0},
    "micronutrients": {},
    "deficiencies": []
  },
  "recommendations": {
    "mealPlan": [],
    "supplements": [],
    "lifestyle": []
  },
  "healthImpact": "Assessment of current nutrition on health goals",
  "improvements": "Specific areas for improvement"
}`;
          break;

        case 'mental_health':
          systemPrompt = `You are a mental health AI specialist trained in evidence-based psychological assessment and intervention strategies.`;
          userPrompt = `Assess the following mental health data:

Assessment Type: ${input.assessmentType}
Responses: ${JSON.stringify(input.responses)}

Provide assessment in JSON format:
{
  "score": 0,
  "riskLevel": "low/medium/high",
  "primaryConcerns": [],
  "strengths": [],
  "recommendations": {
    "immediate": [],
    "shortTerm": [],
    "longTerm": [],
    "professionalSupport": "When to seek professional help"
  },
  "copingStrategies": [],
  "monitoringPlan": "How to track progress"
}`;
          break;

        case 'fitness':
          systemPrompt = `You are an expert fitness and exercise physiologist AI creating personalized fitness programs.`;
          userPrompt = `Create a comprehensive fitness plan:

User Profile: ${JSON.stringify(input.userProfile)}
Goals: ${JSON.stringify(input.goals)}

Provide plan in JSON format:
{
  "fitnessLevel": "beginner/intermediate/advanced",
  "workoutPlan": {
    "schedule": {},
    "exercises": [],
    "progression": {}
  },
  "nutritionGuidelines": {},
  "recoveryPlan": {},
  "progressMetrics": [],
  "safetyConsiderations": []
}`;
          break;

        default:
          throw new Error(`Unsupported analysis type: ${type}`);
      }

      const response = await this.client.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: responseFormat,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      throw new Error(`OpenAI analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async predict(data: any, options: any = {}): Promise<any> {
    try {
      const systemPrompt = `You are an advanced predictive analytics AI specialized in healthcare epidemiology and disease pattern analysis.`;
      const userPrompt = `Analyze the following data for disease prediction and trends:

Data: ${JSON.stringify(data)}
Region: ${data.region || 'Global'}

Provide prediction in JSON format:
{
  "predictions": [
    {
      "diseaseType": "Disease name",
      "probability": 0.75,
      "timeframe": "3-6 months",
      "riskFactors": [],
      "affectedDemographics": [],
      "preventiveMeasures": []
    }
  ],
  "trendAnalysis": {
    "currentTrends": [],
    "emergingPatterns": [],
    "seasonalFactors": []
  },
  "recommendations": {
    "publicHealth": [],
    "individual": [],
    "healthcare": []
  },
  "confidence": "High/Medium/Low",
  "dataQuality": "Assessment of input data reliability"
}`;

      const response = await this.client.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`OpenAI prediction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async educate(query: string, options: any = {}): Promise<any> {
    try {
      const level = options.level || 'intermediate';
      const systemPrompt = `You are an expert medical educator AI creating comprehensive, accurate, and engaging health education content.`;
      const userPrompt = `Create educational content for the following query:

Query: ${query}
Education Level: ${level}

Provide educational content in JSON format:
{
  "title": "Clear, descriptive title",
  "overview": "Brief overview of the topic",
  "keyPoints": [
    {
      "point": "Main concept",
      "explanation": "Detailed explanation",
      "examples": []
    }
  ],
  "practicalApplications": [],
  "commonMisconceptions": [],
  "furtherReading": [],
  "quiz": {
    "questions": [
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "Why this is correct"
      }
    ]
  },
  "difficulty": "${level}",
  "estimatedReadTime": 5
}`;

      const response = await this.client.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`OpenAI education error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processEmotion(input: any, inputType: string, options: any = {}): Promise<any> {
    try {
      const systemPrompt = `You are an expert emotion AI specialized in detecting, analyzing, and providing therapeutic guidance for emotional states.`;
      
      let analysisPrompt = "";
      switch (inputType) {
        case 'text':
          analysisPrompt = `Analyze the emotional content of this text: "${input}"`;
          break;
        case 'voice':
          analysisPrompt = `Analyze the emotional patterns in this voice data: ${JSON.stringify(input)}`;
          break;
        case 'facial':
          analysisPrompt = `Analyze the emotional expressions in this facial data: ${JSON.stringify(input)}`;
          break;
        default:
          analysisPrompt = `Analyze the emotional state from this data: ${JSON.stringify(input)}`;
      }

      const userPrompt = `${analysisPrompt}

Provide emotion analysis in JSON format:
{
  "primaryEmotions": [
    {
      "emotion": "emotion name",
      "intensity": 0.85,
      "confidence": 0.92
    }
  ],
  "overallMood": "positive/negative/neutral",
  "stressLevel": 7,
  "emotionalState": {
    "valence": "positive/negative",
    "arousal": "high/medium/low",
    "dominance": "controlled/uncontrolled"
  },
  "insights": {
    "triggers": [],
    "patterns": [],
    "concerns": []
  },
  "recommendations": {
    "immediate": [],
    "coping": [],
    "professional": "When to seek help"
  },
  "monitoring": {
    "trackMetrics": [],
    "checkInFrequency": "Daily/Weekly"
  }
}`;

      const response = await this.client.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`OpenAI emotion analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}