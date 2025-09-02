import express from "express";
import { z } from "zod";
import { insertFitnessPlanSchema, type InsertFitnessPlan } from "@shared/schema";
import { aiBrain } from "../services/aiBrain";

const router = express.Router();

// Get user's fitness plans
router.get("/", async (req, res) => {
  try {
    // For now, return mock data since we don't have user authentication
    // In production, this would filter by user ID
    res.json([]);
  } catch (error) {
    console.error("Error fetching fitness plans:", error);
    res.status(500).json({ error: "Failed to fetch fitness plans" });
  }
});

// Create new fitness plan
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    
    // Determine fitness level based on user profile
    let fitnessLevel = "beginner";
    if (data.userProfile?.experience) {
      fitnessLevel = data.userProfile.experience;
    } else if (data.userProfile?.activityLevel) {
      const activityLevel = data.userProfile.activityLevel;
      if (activityLevel === "very_active" || activityLevel === "extremely_active") {
        fitnessLevel = "advanced";
      } else if (activityLevel === "moderately_active") {
        fitnessLevel = "intermediate";
      }
    }
    
    // Validate input
    const validatedData = insertFitnessPlanSchema.parse({
      fitnessLevel,
      goals: data.goals,
      workoutPlan: {},
      nutritionPlan: {},
      progressTracking: {},
      isActive: 1,
    });

    // Use AI Brain to create fitness plan
    const planResult = await aiBrain.createFitnessPlan(
      data.userProfile,
      data.goals
    );

    if (!planResult.success) {
      return res.status(500).json({ error: planResult.error || "Fitness plan creation failed" });
    }

    // Create fitness plan record
    const fitnessPlan = {
      ...validatedData,
      workoutPlan: planResult.data.workoutPlan || planResult.data.personalizedPlan || {},
      nutritionPlan: planResult.data.nutritionPlan || planResult.data.nutritionSync || {},
      progressTracking: planResult.data.progressTracking || planResult.data.progressMetrics || {},
    };

    // For now, just return the plan without storing to database
    // In production, this would be stored with user ID
    res.json({
      id: crypto.randomUUID(),
      ...fitnessPlan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error creating fitness plan:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create fitness plan" });
  }
});

export default router;