import { type AiProvider, type AiModel } from "@shared/schema";

// Core AI Brain Interface
export interface AIBrainRequest {
  userId?: string;
  requestType: 'chat' | 'analysis' | 'prediction' | 'education' | 'emotion' | 'nutrition' | 'fitness' | 'mental_health';
  specialization: string;
  input: any;
  priority?: number;
  fallback?: boolean;
}

export interface AIBrainResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: string;
  model: string;
  responseTime: number;
  tokensUsed?: number;
  cost?: string;
}

// AI Provider Interface
export interface IAIProvider {
  name: string;
  isActive: boolean;
  priority: number;
  rateLimit: number;
  
  chat(messages: any[], options?: any): Promise<string>;
  analyze(input: any, type: string, options?: any): Promise<any>;
  predict(data: any, options?: any): Promise<any>;
  educate(query: string, options?: any): Promise<any>;
  processEmotion(input: any, inputType: string, options?: any): Promise<any>;
}

// Core AI Brain Class
export class AIBrain {
  private providers: Map<string, IAIProvider> = new Map();
  private models: Map<string, AiModel> = new Map();
  private providerConfigs: Map<string, AiProvider> = new Map();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Initialize all AI providers
    await this.loadProviders();
    await this.loadModels();
    this.registerProviders();
  }

  private async loadProviders() {
    // Load provider configurations from database
    // This will be implemented with the storage system
  }

  private async loadModels() {
    // Load model configurations from database
    // This will be implemented with the storage system
  }

  public registerProvider(name: string, provider: IAIProvider) {
    this.providers.set(name, provider);
  }

  private registerProviders() {
    // Import and register all available providers
    import('./providers/openaiProvider').then(({ OpenAIProvider }) => {
      this.registerProvider('openai', new OpenAIProvider());
    }).catch(() => {
      console.log('OpenAI provider not available');
    });

    import('./providers/geminiProvider').then(({ GeminiProvider }) => {
      this.registerProvider('gemini', new GeminiProvider());
    }).catch(() => {
      console.log('Gemini provider not available');
    });

    import('./providers/perplexityProvider').then(({ PerplexityProvider }) => {
      this.registerProvider('perplexity', new PerplexityProvider());
    }).catch(() => {
      console.log('Perplexity provider not available');
    });
  }

  public async process(request: AIBrainRequest): Promise<AIBrainResponse> {
    const startTime = Date.now();
    
    try {
      // Get the best provider for this request
      const provider = await this.selectProvider(request);
      if (!provider) {
        throw new Error('No suitable AI provider available');
      }

      let result;
      
      switch (request.requestType) {
        case 'chat':
          result = await provider.chat(request.input.messages, request.input.options);
          break;
        case 'analysis':
          result = await provider.analyze(request.input, request.specialization);
          break;
        case 'prediction':
          result = await provider.predict(request.input);
          break;
        case 'education':
          result = await provider.educate(request.input.query);
          break;
        case 'emotion':
          result = await provider.processEmotion(request.input.data, request.input.type);
          break;
        default:
          throw new Error(`Unsupported request type: ${request.requestType}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        provider: provider.name,
        model: 'default', // This will be enhanced based on the provider
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'unknown',
        model: 'unknown',
        responseTime,
      };
    }
  }

  private async selectProvider(request: AIBrainRequest): Promise<IAIProvider | null> {
    // Get providers that support the requested specialization
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.isActive)
      .sort((a, b) => b.priority - a.priority);

    // Return the highest priority provider
    return availableProviders[0] || null;
  }

  // Health-specific methods
  public async analyzeSymptoms(symptoms: string, patientInfo: any): Promise<any> {
    return this.process({
      requestType: 'analysis',
      specialization: 'symptoms',
      input: { symptoms, patientInfo }
    });
  }

  public async analyzeNutrition(foodData: any, goals: any): Promise<any> {
    return this.process({
      requestType: 'analysis',
      specialization: 'nutrition',
      input: { foodData, goals }
    });
  }

  public async assessMentalHealth(responses: any, assessmentType: string): Promise<any> {
    return this.process({
      requestType: 'analysis',
      specialization: 'mental_health',
      input: { responses, assessmentType }
    });
  }

  public async createFitnessPlan(userProfile: any, goals: any): Promise<any> {
    return this.process({
      requestType: 'analysis',
      specialization: 'fitness',
      input: { userProfile, goals }
    });
  }

  public async predictDiseaseTrends(data: any, region?: string): Promise<any> {
    return this.process({
      requestType: 'prediction',
      specialization: 'disease_trends',
      input: { data, region }
    });
  }

  public async analyzeEmotions(inputData: any, inputType: string): Promise<any> {
    return this.process({
      requestType: 'emotion',
      specialization: 'emotion_detection',
      input: { data: inputData, type: inputType }
    });
  }

  public async educationalQuery(query: string, level: string): Promise<any> {
    return this.process({
      requestType: 'education',
      specialization: 'health_education',
      input: { query, level }
    });
  }
}

// Global AI Brain instance
export const aiBrain = new AIBrain();