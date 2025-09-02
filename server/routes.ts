import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/aiService";
import { mapsService } from "./services/mapsService";
import { 
  insertHealthLogSchema, 
  insertChatSessionSchema, 
  insertSymptomAnalysisSchema,
  type ChatMessage 
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

// Import specialized route modules
import nutritionRoutes from "./routes/nutrition";
import mentalHealthRoutes from "./routes/mental-health";
import fitnessRoutes from "./routes/fitness";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register specialized health module routes
  app.use("/api/nutrition-analyses", nutritionRoutes);
  app.use("/api/mental-health-assessments", mentalHealthRoutes);
  app.use("/api/fitness-plans", fitnessRoutes);

  // Health log routes
  app.get("/api/health-logs", async (req, res) => {
    try {
      const { userId, type } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const logs = type 
        ? await storage.getHealthLogsByType(userId as string, type as string)
        : await storage.getHealthLogs(userId as string);

      res.json(logs);
    } catch (error) {
      console.error("Error fetching health logs:", error);
      res.status(500).json({ error: "Failed to fetch health logs" });
    }
  });

  app.post("/api/health-logs", async (req, res) => {
    try {
      const validatedData = insertHealthLogSchema.parse(req.body);
      const log = await storage.createHealthLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating health log:", error);
      res.status(500).json({ error: "Failed to create health log" });
    }
  });

  app.delete("/api/health-logs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteHealthLog(id);
      
      if (!success) {
        return res.status(404).json({ error: "Health log not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting health log:", error);
      res.status(500).json({ error: "Failed to delete health log" });
    }
  });

  // Symptom analysis routes
  app.post("/api/symptoms/analyze", async (req, res) => {
    try {
      const schema = insertSymptomAnalysisSchema.extend({
        symptoms: z.string().min(10, "Please provide more detailed symptoms"),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get AI analysis
      const analysis = await aiService.analyzeSymptoms(
        validatedData.symptoms,
        validatedData.age || undefined,
        validatedData.gender || undefined,
        validatedData.duration || undefined
      );

      // Save analysis to storage
      const savedAnalysis = await storage.createSymptomAnalysis({
        ...validatedData,
        analysis,
      });

      res.json({
        id: savedAnalysis.id,
        analysis,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error analyzing symptoms:", error);
      res.status(500).json({ error: "Failed to analyze symptoms" });
    }
  });

  app.get("/api/symptoms/history", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const analyses = await storage.getSymptomAnalyses(userId as string);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching symptom history:", error);
      res.status(500).json({ error: "Failed to fetch symptom history" });
    }
  });

  // Chat routes
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/sessions", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const sessions = await storage.getChatSessions(userId as string);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const schema = z.object({
        sessionId: z.string(),
        message: z.string().min(1, "Message cannot be empty"),
        messages: z.array(z.object({
          id: z.string(),
          role: z.enum(['user', 'assistant']),
          content: z.string(),
          timestamp: z.string(),
        })),
      });
      
      const { sessionId, message, messages } = schema.parse(req.body);

      // Add user message to conversation
      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      const conversationMessages = [...messages, userMessage];

      // Get AI response
      const aiResponse = await aiService.getChatResponse(conversationMessages);

      // Add AI response to conversation
      const aiMessage: ChatMessage = {
        id: randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...conversationMessages, aiMessage];

      // Update chat session
      await storage.updateChatSession(sessionId, updatedMessages);

      res.json({
        message: aiMessage,
        sessionId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error processing chat message:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Clinic routes
  app.get("/api/clinics", async (req, res) => {
    try {
      const clinics = await storage.getClinics();
      res.json(clinics);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      res.status(500).json({ error: "Failed to fetch clinics" });
    }
  });

  app.post("/api/clinics/search", async (req, res) => {
    try {
      const schema = z.object({
        location: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radius: z.number().default(10), // miles
        type: z.string().optional(),
        query: z.string().optional(),
      });
      
      const { location, latitude, longitude, radius, type, query } = schema.parse(req.body);

      let results = [];

      if (location && (!latitude || !longitude)) {
        // Geocode the location first
        const coords = await mapsService.geocodeAddress(location);
        if (coords) {
          results = await storage.getClinicsByLocation(coords.latitude, coords.longitude, radius);
        }
      } else if (latitude && longitude) {
        // Use provided coordinates
        results = await storage.getClinicsByLocation(latitude, longitude, radius);
      } else if (query) {
        // Text-based search
        const clinics = await storage.searchClinics(query, type);
        results = clinics.map(clinic => ({ clinic, distance: 0 }));
      } else {
        // Get all clinics
        const clinics = await storage.getClinics();
        results = clinics.map(clinic => ({ clinic, distance: 0 }));
      }

      // Filter by type if specified
      if (type) {
        results = results.filter(result => result.clinic.type === type);
      }

      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error searching clinics:", error);
      res.status(500).json({ error: "Failed to search clinics" });
    }
  });

  app.post("/api/clinics/nearby", async (req, res) => {
    try {
      const schema = z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().default(10000), // meters
        type: z.string().default('hospital'),
      });
      
      const { latitude, longitude, radius, type } = schema.parse(req.body);

      // Use Google Places API to find nearby healthcare facilities
      const googleClinics = await mapsService.searchNearbyHealthcare(latitude, longitude, radius, type);
      
      // Combine with local clinic data
      const localResults = await storage.getClinicsByLocation(latitude, longitude, radius / 1609.34); // convert meters to miles
      
      // Merge results (prioritize local data, supplement with Google data)
      const combinedResults = [
        ...localResults,
        ...googleClinics.map(clinic => ({ clinic, distance: 0 }))
      ];

      res.json(combinedResults);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error finding nearby clinics:", error);
      res.status(500).json({ error: "Failed to find nearby clinics" });
    }
  });

  // Health trends analysis
  app.get("/api/health/trends", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const logs = await storage.getHealthLogs(userId as string);
      const analysis = await aiService.analyzeHealthTrends(logs);

      res.json({ analysis, logCount: logs.length });
    } catch (error) {
      console.error("Error analyzing health trends:", error);
      res.status(500).json({ error: "Failed to analyze health trends" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
