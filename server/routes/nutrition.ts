import express from "express";
import { z } from "zod";
import { insertNutritionAnalysisSchema, type InsertNutritionAnalysis } from "@shared/schema";
import { aiBrain } from "../services/aiBrain";

const router = express.Router();

// Get user's nutrition analyses
router.get("/", async (req, res) => {
  try {
    // For now, return mock data since we don't have user authentication
    // In production, this would filter by user ID
    res.json([]);
  } catch (error) {
    console.error("Error fetching nutrition analyses:", error);
    res.status(500).json({ error: "Failed to fetch nutrition analyses" });
  }
});

// Create new nutrition analysis
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    
    // Validate input
    const validatedData = insertNutritionAnalysisSchema.parse({
      foodItems: data.foodItems,
      nutritionalBreakdown: {},
      recommendations: {},
      healthGoals: data.healthGoals || null,
      restrictions: data.restrictions || null,
    });

    // Use AI Brain to analyze nutrition
    const analysisResult = await aiBrain.analyzeNutrition(
      data.foodItems,
      {
        healthGoals: data.healthGoals,
        restrictions: data.restrictions,
        mealType: data.mealType
      }
    );

    if (!analysisResult.success) {
      return res.status(500).json({ error: analysisResult.error || "Nutrition analysis failed" });
    }

    // Create nutrition analysis record
    const nutritionAnalysis = {
      ...validatedData,
      nutritionalBreakdown: analysisResult.data.nutritionalBreakdown || {},
      recommendations: analysisResult.data.recommendations || {},
    };

    // For now, just return the analysis without storing to database
    // In production, this would be stored with user ID
    res.json({
      id: crypto.randomUUID(),
      ...nutritionAnalysis,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error creating nutrition analysis:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create nutrition analysis" });
  }
});

export default router;