import { GoogleGenAI } from "@google/genai";
import { type IAIProvider } from "../aiBrain";

export class GeminiProvider implements IAIProvider {
  name = "gemini";
  isActive = true;
  priority = 9; // Slightly lower than OpenAI
  rateLimit = 60; // More conservative rate limit
  
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || "default_key" 
    });
  }

  async chat(messages: any[], options: any = {}): Promise<string> {
    try {
      const model = options.model || "gemini-2.5-flash";
      
      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const response = await this.client.models.generateContent({
        model,
        contents: geminiMessages,
        config: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
          ...(options.responseFormat && { responseMimeType: "application/json" })
        }
      });

      return response.text || "I apologize, but I couldn't generate a response.";
    } catch (error) {
      throw new Error(`Gemini chat error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyze(input: any, type: string, options: any = {}): Promise<any> {
    try {
      let systemPrompt = "";
      let userPrompt = "";

      switch (type) {
        case 'symptoms':
          systemPrompt = `You are an advanced medical AI assistant with multimodal capabilities, specialized in comprehensive symptom analysis using visual and textual data.`;
          userPrompt = `Analyze the following symptoms with enhanced multimodal understanding:

Patient Information:
- Symptoms: ${input.symptoms}
- Age: ${input.patientInfo?.age || 'Not provided'}
- Gender: ${input.patientInfo?.gender || 'Not provided'}
- Duration: ${input.patientInfo?.duration || 'Not provided'}
- Medical History: ${input.patientInfo?.history || 'Not provided'}
- Visual Data: ${input.images ? 'Images provided for analysis' : 'No visual data'}

Provide comprehensive analysis in JSON format:
{
  "condition": "Most likely condition",
  "confidence": 88,
  "description": "Detailed medical explanation with visual assessment if applicable",
  "recommendations": ["Specific actionable recommendations"],
  "urgency": "low/medium/high",
  "visualFindings": "Analysis of any provided images",
  "differentialDiagnosis": ["Alternative conditions"],
  "redFlags": ["Warning signs"],
  "followUp": "Recommended timeline",
  "additionalTests": ["Suggested diagnostic tests"]
}`;
          break;

        case 'nutrition':
          systemPrompt = `You are an expert nutritionist AI with advanced food recognition and nutritional analysis capabilities.`;
          userPrompt = `Provide comprehensive nutritional analysis:

Food Data: ${JSON.stringify(input.foodData)}
Health Goals: ${JSON.stringify(input.goals)}

Analysis in JSON format:
{
  "nutritionalBreakdown": {
    "calories": 0,
    "macronutrients": {"protein": 0, "carbs": 0, "fats": 0},
    "micronutrients": {},
    "fiber": 0,
    "sugar": 0,
    "sodium": 0
  },
  "healthScore": 85,
  "recommendations": {
    "mealOptimization": [],
    "portionAdjustments": [],
    "substitutions": [],
    "supplements": []
  },
  "goalAlignment": "How well this aligns with health goals",
  "culturalConsiderations": "Dietary preferences and restrictions",
  "sustainabilityScore": 7
}`;
          break;

        case 'mental_health':
          systemPrompt = `You are a compassionate mental health AI with advanced emotional intelligence and therapeutic insight capabilities.`;
          userPrompt = `Conduct thorough mental health assessment:

Assessment Type: ${input.assessmentType}
Responses: ${JSON.stringify(input.responses)}

Provide assessment in JSON format:
{
  "score": 0,
  "riskLevel": "low/medium/high",
  "emotionalState": {
    "primary": "dominant emotion",
    "secondary": "supporting emotions",
    "stability": "emotional stability assessment"
  },
  "strengthsIdentified": [],
  "concernAreas": [],
  "copingMechanisms": {
    "current": "existing coping strategies",
    "recommended": ["new strategies to try"]
  },
  "recommendations": {
    "immediate": ["urgent actions"],
    "therapeutic": ["therapy recommendations"],
    "lifestyle": ["daily life improvements"],
    "social": ["social support strategies"]
  },
  "progressMarkers": ["metrics to track improvement"],
  "crisisResources": "When and how to seek immediate help"
}`;
          break;

        case 'fitness':
          systemPrompt = `You are an expert fitness AI with advanced biomechanics understanding and personalized program design capabilities.`;
          userPrompt = `Create comprehensive fitness analysis and plan:

User Profile: ${JSON.stringify(input.userProfile)}
Goals: ${JSON.stringify(input.goals)}

Provide plan in JSON format:
{
  "currentAssessment": {
    "fitnessLevel": "beginner/intermediate/advanced",
    "limitations": [],
    "strengths": []
  },
  "personalizedPlan": {
    "schedule": {
      "frequency": "3-4 times per week",
      "duration": "45-60 minutes",
      "structure": {}
    },
    "exercises": {
      "strength": [],
      "cardio": [],
      "flexibility": [],
      "functional": []
    },
    "progression": {
      "weekly": "progression plan",
      "monthly": "milestone goals"
    }
  },
  "nutritionSync": "How nutrition supports fitness goals",
  "recoveryProtocol": {},
  "injuryPrevention": [],
  "motivationStrategies": []
}`;
          break;

        default:
          throw new Error(`Unsupported analysis type: ${type}`);
      }

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      throw new Error(`Gemini analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async predict(data: any, options: any = {}): Promise<any> {
    try {
      const systemPrompt = `You are an advanced predictive AI with superior pattern recognition capabilities for healthcare epidemiology and trend analysis.`;
      const userPrompt = `Analyze and predict healthcare trends:

Data: ${JSON.stringify(data)}
Region: ${data.region || 'Global'}

Provide enhanced prediction in JSON format:
{
  "predictions": [
    {
      "diseaseType": "Disease name",
      "probability": 0.78,
      "timeframe": "2-4 months",
      "riskFactors": [],
      "geographicSpread": [],
      "demographicImpact": {},
      "seasonalFactors": []
    }
  ],
  "emergingPatterns": {
    "newTrends": [],
    "acceleratingFactors": [],
    "mitigatingFactors": []
  },
  "recommendations": {
    "publicHealth": [],
    "healthcare": [],
    "individual": [],
    "policy": []
  },
  "confidenceMetrics": {
    "overall": "High/Medium/Low",
    "dataQuality": 0.85,
    "modelReliability": 0.92
  },
  "scenario_analysis": {
    "bestCase": {},
    "worstCase": {},
    "mostLikely": {}
  }
}`;

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      throw new Error(`Gemini prediction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async educate(query: string, options: any = {}): Promise<any> {
    try {
      const level = options.level || 'intermediate';
      const systemPrompt = `You are an expert medical educator AI with enhanced multimodal teaching capabilities and adaptive learning design.`;
      const userPrompt = `Create comprehensive educational content:

Query: ${query}
Education Level: ${level}

Provide enhanced educational content in JSON format:
{
  "title": "Engaging, clear title",
  "overview": "Comprehensive overview with key learning objectives",
  "content": {
    "introduction": "Hook and context setting",
    "keyPoints": [
      {
        "point": "Main concept",
        "explanation": "Detailed explanation",
        "examples": [],
        "realWorldApplications": [],
        "commonMisunderstandings": []
      }
    ],
    "visualAids": "Suggestions for helpful diagrams or images",
    "interactiveElements": []
  },
  "learningPath": {
    "prerequisites": [],
    "currentLevel": "${level}",
    "nextSteps": []
  },
  "assessment": {
    "quiz": {
      "questions": [
        {
          "question": "Question text",
          "type": "multiple_choice/true_false/short_answer",
          "options": ["A", "B", "C", "D"],
          "correct": 0,
          "explanation": "Detailed explanation",
          "difficulty": "easy/medium/hard"
        }
      ]
    },
    "practicalExercises": []
  },
  "resources": {
    "furtherReading": [],
    "videos": [],
    "interactiveSimulations": []
  },
  "metadata": {
    "difficulty": "${level}",
    "estimatedTime": 8,
    "topics": [],
    "learningObjectives": []
  }
}`;

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.4
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      throw new Error(`Gemini education error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processEmotion(input: any, inputType: string, options: any = {}): Promise<any> {
    try {
      const systemPrompt = `You are an advanced emotion AI with multimodal analysis capabilities, specialized in detecting subtle emotional patterns and providing therapeutic insights.`;
      
      let analysisPrompt = "";
      switch (inputType) {
        case 'text':
          analysisPrompt = `Analyze the emotional depth and nuance in this text: "${input}"`;
          break;
        case 'voice':
          analysisPrompt = `Analyze emotional patterns from voice characteristics: ${JSON.stringify(input)}`;
          break;
        case 'facial':
          analysisPrompt = `Analyze facial expressions and micro-expressions: ${JSON.stringify(input)}`;
          break;
        case 'multimodal':
          analysisPrompt = `Analyze combined emotional data from multiple sources: ${JSON.stringify(input)}`;
          break;
        default:
          analysisPrompt = `Analyze emotional state from this data: ${JSON.stringify(input)}`;
      }

      const userPrompt = `${analysisPrompt}

Provide comprehensive emotion analysis in JSON format:
{
  "primaryEmotions": [
    {
      "emotion": "emotion name",
      "intensity": 0.87,
      "confidence": 0.94,
      "duration": "sustained/fleeting",
      "triggers": []
    }
  ],
  "emotionalProfile": {
    "overallMood": "positive/negative/neutral",
    "stressLevel": 6,
    "energyLevel": "high/medium/low",
    "emotionalStability": 0.75,
    "resilience": 0.68
  },
  "psychologicalInsights": {
    "copingStyle": "adaptive/maladaptive",
    "emotionalRegulation": "good/moderate/poor",
    "socialEmotions": [],
    "hiddenEmotions": "emotions that may be suppressed"
  },
  "recommendations": {
    "immediate": ["urgent emotional needs"],
    "therapeutic": ["therapy techniques"],
    "selfCare": ["self-care strategies"],
    "social": ["social support recommendations"],
    "lifestyle": ["lifestyle adjustments"]
  },
  "riskAssessment": {
    "level": "low/medium/high",
    "factors": [],
    "protectiveFactors": [],
    "monitoringNeeded": true
  },
  "progressTracking": {
    "metrics": ["what to monitor"],
    "frequency": "daily/weekly",
    "tools": ["tracking methods"]
  }
}`;

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      throw new Error(`Gemini emotion analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Multimodal capabilities unique to Gemini
  async analyzeImage(imageData: string, analysisType: string): Promise<any> {
    try {
      const systemPrompt = `You are a medical AI with advanced visual analysis capabilities for healthcare applications.`;
      
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{
          role: "user",
          parts: [
            { text: `Analyze this medical image for ${analysisType}. Provide detailed medical insights in JSON format.` },
            {
              inlineData: {
                data: imageData,
                mimeType: "image/jpeg"
              }
            }
          ]
        }],
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      throw new Error(`Gemini image analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}