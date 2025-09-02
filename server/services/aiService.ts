import OpenAI from "openai";
import { type SymptomAnalysisResult, type ChatMessage } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export class AIService {
  // Specialized symptom screening with medical focus
  async analyzeSymptoms(
    symptoms: string,
    age?: number,
    gender?: string,
    duration?: string
  ): Promise<SymptomAnalysisResult> {
    try {
      const prompt = `You are a medical AI assistant specialized in symptom analysis. Analyze the following symptoms and provide a structured assessment.

Patient Information:
- Symptoms: ${symptoms}
- Age: ${age || 'Not provided'}
- Gender: ${gender || 'Not provided'}
- Duration: ${duration || 'Not provided'}

Provide your analysis in JSON format with the following structure:
{
  "condition": "Most likely condition name",
  "confidence": 85,
  "description": "Detailed explanation of the condition",
  "recommendations": ["List", "of", "recommended", "actions"],
  "urgency": "low/medium/high"
}

Important guidelines:
- Be cautious and conservative in your assessment
- Always recommend consulting healthcare professionals for serious symptoms
- Consider multiple possibilities
- Provide actionable recommendations
- Set urgency based on symptom severity`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a specialized medical AI assistant focused on symptom analysis. Always provide conservative, helpful advice and emphasize the importance of professional medical consultation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent medical advice
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        condition: result.condition || "Unable to determine",
        confidence: Math.max(0, Math.min(100, result.confidence || 0)),
        description: result.description || "Unable to provide analysis",
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        urgency: ['low', 'medium', 'high'].includes(result.urgency) ? result.urgency : 'medium'
      };
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      throw new Error("Failed to analyze symptoms. Please try again later.");
    }
  }

  // General health consultation chat
  async getChatResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const systemPrompt = `You are HealthLink AI, a friendly and knowledgeable health assistant. Your role is to:

1. Provide general health information and guidance
2. Answer health-related questions with evidence-based information
3. Encourage users to seek professional medical care when appropriate
4. Be supportive and empathetic while maintaining professional boundaries
5. Never provide specific medical diagnoses or treatment recommendations
6. Always emphasize that you're not a replacement for professional medical advice

Guidelines:
- Be conversational but professional
- Ask follow-up questions to better understand the user's concerns
- Provide helpful, actionable advice when appropriate
- Redirect to healthcare professionals for serious symptoms or medical decisions
- Be encouraging and supportive of healthy lifestyle choices`;

      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "I apologize, but I'm having trouble processing your message right now. Please try again.";
    } catch (error) {
      console.error("Error getting chat response:", error);
      throw new Error("Failed to get AI response. Please try again later.");
    }
  }

  // Health data analysis for trends and insights
  async analyzeHealthTrends(logs: any[]): Promise<string> {
    try {
      const prompt = `Analyze the following health log data and provide insights about patterns and trends:

${JSON.stringify(logs, null, 2)}

Provide a brief analysis focusing on:
- Notable patterns or trends
- Potential correlations
- Suggestions for health improvement
- Areas that might need attention

Keep the response conversational and encouraging.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a health data analyst providing insights on personal health trends. Be positive, encouraging, and provide actionable suggestions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return response.choices[0].message.content || "Unable to analyze health trends at this time.";
    } catch (error) {
      console.error("Error analyzing health trends:", error);
      throw new Error("Failed to analyze health trends. Please try again later.");
    }
  }
}

export const aiService = new AIService();
