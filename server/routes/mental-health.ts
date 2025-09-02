import express from "express";
import { z } from "zod";
import { insertMentalHealthAssessmentSchema, type InsertMentalHealthAssessment } from "@shared/schema";
import { aiBrain } from "../services/aiBrain";

const router = express.Router();

// Get user's mental health assessments
router.get("/", async (req, res) => {
  try {
    // For now, return mock data since we don't have user authentication
    // In production, this would filter by user ID
    res.json([]);
  } catch (error) {
    console.error("Error fetching mental health assessments:", error);
    res.status(500).json({ error: "Failed to fetch mental health assessments" });
  }
});

// Create new mental health assessment
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    
    // Validate input
    const validatedData = insertMentalHealthAssessmentSchema.parse({
      assessmentType: data.assessmentType,
      responses: data.responses,
      score: 0,
      riskLevel: "low",
      recommendations: {},
      followUpDate: null,
    });

    // Use AI Brain to assess mental health
    const assessmentResult = await aiBrain.assessMentalHealth(
      data.responses,
      data.assessmentType
    );

    if (!assessmentResult.success) {
      return res.status(500).json({ error: assessmentResult.error || "Mental health assessment failed" });
    }

    // Create mental health assessment record
    const mentalHealthAssessment = {
      ...validatedData,
      score: assessmentResult.data.score || 0,
      riskLevel: assessmentResult.data.riskLevel || "low",
      recommendations: assessmentResult.data.recommendations || {},
      followUpDate: assessmentResult.data.followUpDate || null,
    };

    // For now, just return the assessment without storing to database
    // In production, this would be stored with user ID
    res.json({
      id: crypto.randomUUID(),
      ...mentalHealthAssessment,
      createdAt: new Date().toISOString(),
      followUpDate: assessmentResult.data.followUpDate ? new Date(assessmentResult.data.followUpDate).toISOString() : null
    });
  } catch (error) {
    console.error("Error creating mental health assessment:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create mental health assessment" });
  }
});

export default router;