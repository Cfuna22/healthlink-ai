import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const healthLogs = pgTable("health_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // symptoms, medication, vitals, exercise, mood
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  severity: integer("severity"), // 1-10 scale
  metadata: jsonb("metadata"), // additional structured data
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  messages: jsonb("messages").notNull(), // array of message objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const symptomAnalyses = pgTable("symptom_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  symptoms: text("symptoms").notNull(),
  age: integer("age"),
  gender: text("gender"),
  duration: text("duration"),
  analysis: jsonb("analysis").notNull(), // AI analysis results
  createdAt: timestamp("created_at").defaultNow(),
});

export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  type: text("type").notNull(), // general, urgent, specialist, hospital, pharmacy
  rating: integer("rating"), // 1-5 scale
  hours: text("hours"),
  phone: text("phone"),
  website: text("website"),
});

// AI Brain System Tables
export const aiProviders = pgTable("ai_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // openai, gemini, perplexity, meta, etc.
  apiKey: text("api_key"),
  endpoint: text("endpoint"),
  isActive: integer("is_active").default(1), // 1 = active, 0 = inactive
  priority: integer("priority").default(1), // higher number = higher priority
  rateLimit: integer("rate_limit").default(100), // requests per minute
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiModels = pgTable("ai_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => aiProviders.id),
  name: text("name").notNull(), // gpt-4, gemini-pro, etc.
  modelType: text("model_type").notNull(), // chat, vision, embedding, etc.
  specialization: text("specialization").notNull(), // nutrition, mental_health, fitness, medical, emotion, education, prediction
  capabilities: jsonb("capabilities"), // supported features
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  providerId: varchar("provider_id").references(() => aiProviders.id),
  modelId: varchar("model_id").references(() => aiModels.id),
  requestType: text("request_type").notNull(), // chat, analysis, prediction, education
  input: jsonb("input").notNull(),
  output: jsonb("output").notNull(),
  responseTime: integer("response_time"), // milliseconds
  tokensUsed: integer("tokens_used"),
  cost: text("cost"), // cost in cents
  createdAt: timestamp("created_at").defaultNow(),
});

// Specialized Health Analysis Tables
export const nutritionAnalyses = pgTable("nutrition_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  foodItems: jsonb("food_items").notNull(),
  nutritionalBreakdown: jsonb("nutritional_breakdown").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  healthGoals: text("health_goals"),
  restrictions: text("restrictions"), // allergies, dietary preferences
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentalHealthAssessments = pgTable("mental_health_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  assessmentType: text("assessment_type").notNull(), // mood, anxiety, depression, stress
  responses: jsonb("responses").notNull(),
  score: integer("score"),
  riskLevel: text("risk_level"), // low, medium, high
  recommendations: jsonb("recommendations").notNull(),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fitnessPlans = pgTable("fitness_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  fitnessLevel: text("fitness_level"), // beginner, intermediate, advanced
  goals: jsonb("goals").notNull(), // weight_loss, muscle_gain, endurance
  workoutPlan: jsonb("workout_plan").notNull(),
  nutritionPlan: jsonb("nutrition_plan"),
  progressTracking: jsonb("progress_tracking"),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Disease Prediction and Trends
export const diseasePredictions = pgTable("disease_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diseaseType: text("disease_type").notNull(),
  region: text("region"),
  riskFactors: jsonb("risk_factors").notNull(),
  predictedOutbreak: timestamp("predicted_outbreak"),
  confidence: integer("confidence"), // 1-100
  affectedPopulation: integer("affected_population"),
  preventiveMeasures: jsonb("preventive_measures").notNull(),
  sources: jsonb("sources"), // data sources used for prediction
  createdAt: timestamp("created_at").defaultNow(),
});

export const trendAnalyses = pgTable("trend_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trendType: text("trend_type").notNull(), // disease, treatment, lifestyle
  timeframe: text("timeframe").notNull(), // monthly, quarterly, yearly
  dataPoints: jsonb("data_points").notNull(),
  insights: jsonb("insights").notNull(),
  predictions: jsonb("predictions"),
  reliability: integer("reliability"), // 1-100
  createdAt: timestamp("created_at").defaultNow(),
});

// Educational System
export const educationalContent = pgTable("educational_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(), // anatomy, diseases, medications, treatments
  subcategory: text("subcategory"),
  content: text("content").notNull(),
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  tags: text("tags").array(),
  multimedia: jsonb("multimedia"), // images, videos, interactive content
  quiz: jsonb("quiz"), // questions and answers
  prerequisites: text("prerequisites").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  contentId: varchar("content_id").references(() => educationalContent.id),
  progress: integer("progress").default(0), // 0-100
  quizScores: jsonb("quiz_scores"),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emotion Analysis
export const emotionAnalyses = pgTable("emotion_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  inputType: text("input_type").notNull(), // text, voice, facial, physiological
  inputData: jsonb("input_data").notNull(),
  emotions: jsonb("emotions").notNull(), // detected emotions with confidence
  overallMood: text("overall_mood"),
  stressLevel: integer("stress_level"), // 1-10
  recommendations: jsonb("recommendations").notNull(),
  triggersIdentified: jsonb("triggers_identified"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Media Integration
export const socialMediaIntegrations = pgTable("social_media_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  platform: text("platform").notNull(), // facebook, twitter, instagram, youtube, linkedin
  platformUserId: text("platform_user_id"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  permissions: text("permissions").array(),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialMediaPosts = pgTable("social_media_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  integrationId: varchar("integration_id").references(() => socialMediaIntegrations.id),
  contentType: text("content_type").notNull(), // health_tip, achievement, progress
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(),
  postId: text("post_id"), // platform-specific post ID
  engagement: jsonb("engagement"), // likes, shares, comments
  scheduledAt: timestamp("scheduled_at"),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHealthLogSchema = createInsertSchema(healthLogs).pick({
  type: true,
  date: true,
  description: true,
  severity: true,
  metadata: true,
}).extend({
  userId: z.string().optional(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  messages: true,
}).extend({
  userId: z.string().optional(),
});

export const insertSymptomAnalysisSchema = createInsertSchema(symptomAnalyses).pick({
  symptoms: true,
  age: true,
  gender: true,
  duration: true,
}).extend({
  userId: z.string().optional(),
});

export const insertClinicSchema = createInsertSchema(clinics).pick({
  name: true,
  address: true,
  latitude: true,
  longitude: true,
  type: true,
  rating: true,
  hours: true,
  phone: true,
  website: true,
});

// AI Brain System Insert Schemas
export const insertAiProviderSchema = createInsertSchema(aiProviders).pick({
  name: true,
  endpoint: true,
  isActive: true,
  priority: true,
  rateLimit: true,
});

export const insertAiModelSchema = createInsertSchema(aiModels).pick({
  providerId: true,
  name: true,
  modelType: true,
  specialization: true,
  capabilities: true,
  isActive: true,
});

export const insertNutritionAnalysisSchema = createInsertSchema(nutritionAnalyses).pick({
  foodItems: true,
  nutritionalBreakdown: true,
  recommendations: true,
  healthGoals: true,
  restrictions: true,
}).extend({
  userId: z.string().optional(),
});

export const insertMentalHealthAssessmentSchema = createInsertSchema(mentalHealthAssessments).pick({
  assessmentType: true,
  responses: true,
  score: true,
  riskLevel: true,
  recommendations: true,
  followUpDate: true,
}).extend({
  userId: z.string().optional(),
});

export const insertFitnessPlanSchema = createInsertSchema(fitnessPlans).pick({
  fitnessLevel: true,
  goals: true,
  workoutPlan: true,
  nutritionPlan: true,
  progressTracking: true,
  isActive: true,
}).extend({
  userId: z.string().optional(),
});

export const insertDiseasePredictionSchema = createInsertSchema(diseasePredictions).pick({
  diseaseType: true,
  region: true,
  riskFactors: true,
  predictedOutbreak: true,
  confidence: true,
  affectedPopulation: true,
  preventiveMeasures: true,
  sources: true,
});

export const insertEducationalContentSchema = createInsertSchema(educationalContent).pick({
  title: true,
  category: true,
  subcategory: true,
  content: true,
  difficulty: true,
  tags: true,
  multimedia: true,
  quiz: true,
  prerequisites: true,
});

export const insertEmotionAnalysisSchema = createInsertSchema(emotionAnalyses).pick({
  inputType: true,
  inputData: true,
  emotions: true,
  overallMood: true,
  stressLevel: true,
  recommendations: true,
  triggersIdentified: true,
}).extend({
  userId: z.string().optional(),
});

export const insertSocialMediaIntegrationSchema = createInsertSchema(socialMediaIntegrations).pick({
  platform: true,
  platformUserId: true,
  permissions: true,
  isActive: true,
}).extend({
  userId: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHealthLog = z.infer<typeof insertHealthLogSchema>;
export type HealthLog = typeof healthLogs.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertSymptomAnalysis = z.infer<typeof insertSymptomAnalysisSchema>;
export type SymptomAnalysis = typeof symptomAnalyses.$inferSelect;
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinics.$inferSelect;

// AI Brain System Types
export type InsertAiProvider = z.infer<typeof insertAiProviderSchema>;
export type AiProvider = typeof aiProviders.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;
export type AiModel = typeof aiModels.$inferSelect;
export type AiInteraction = typeof aiInteractions.$inferSelect;

// Specialized Health Types
export type InsertNutritionAnalysis = z.infer<typeof insertNutritionAnalysisSchema>;
export type NutritionAnalysis = typeof nutritionAnalyses.$inferSelect;
export type InsertMentalHealthAssessment = z.infer<typeof insertMentalHealthAssessmentSchema>;
export type MentalHealthAssessment = typeof mentalHealthAssessments.$inferSelect;
export type InsertFitnessPlan = z.infer<typeof insertFitnessPlanSchema>;
export type FitnessPlan = typeof fitnessPlans.$inferSelect;

// Disease Prediction Types
export type InsertDiseasePrediction = z.infer<typeof insertDiseasePredictionSchema>;
export type DiseasePrediction = typeof diseasePredictions.$inferSelect;
export type TrendAnalysis = typeof trendAnalyses.$inferSelect;

// Educational Types
export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;
export type EducationalContent = typeof educationalContent.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;

// Emotion Analysis Types
export type InsertEmotionAnalysis = z.infer<typeof insertEmotionAnalysisSchema>;
export type EmotionAnalysis = typeof emotionAnalyses.$inferSelect;

// Social Media Types
export type InsertSocialMediaIntegration = z.infer<typeof insertSocialMediaIntegrationSchema>;
export type SocialMediaIntegration = typeof socialMediaIntegrations.$inferSelect;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;

// Additional types for API responses
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type SymptomAnalysisResult = {
  condition: string;
  confidence: number;
  description: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
};

export type ClinicSearchResult = {
  clinic: Clinic;
  distance: number;
};
