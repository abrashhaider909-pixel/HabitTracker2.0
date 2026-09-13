import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client utility
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI 5D Life Judgement & Routine Score API
app.post("/api/ai/evaluate", async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const {
      date,
      habits,
      metrics,
      financialSummary,
      careerProgress,
      userNotes,
    } = req.body;

    if (!ai) {
      // Fallback deterministic evaluation if API key is not configured yet
      const completedCount = habits?.filter((h: any) => h.completed)?.length || 0;
      const totalCount = habits?.length || 1;
      const completionRate = Math.round((completedCount / Math.max(1, totalCount)) * 100);
      const score = Math.min(100, Math.max(20, completionRate));

      return res.json({
        success: true,
        data: {
          overallScore: score,
          grade: score >= 90 ? "S" : score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D",
          verdict: `You completed ${completedCount} of ${totalCount} daily targets today (${completionRate}% execution). ${
            score >= 75
              ? "Strong consistency and disciplined execution across your main objectives."
              : "Moderate routine delivery today. Refocus on high-friction habits early tomorrow."
          }`,
          dimensions: [
            {
              name: "Education",
              score: Math.min(100, Math.max(30, (metrics?.education || 60))),
              feedback: "Solid cognitive output. Continue dedicating uninterrupted 90-minute deep work blocks.",
              status: metrics?.education >= 70 ? "optimal" : "needs_attention",
            },
            {
              name: "Religion",
              score: Math.min(100, Math.max(30, (metrics?.religion || 70))),
              feedback: "Consistent spiritual groundedness and mental calmness observed.",
              status: "optimal",
            },
            {
              name: "Health",
              score: Math.min(100, Math.max(30, (metrics?.health || 55))),
              feedback: "Keep prioritizing sleep hygiene, hydration, and at least 30 minutes of cardiovascular exertion.",
              status: metrics?.health >= 70 ? "optimal" : "needs_attention",
            },
            {
              name: "Social",
              score: Math.min(100, Math.max(30, (metrics?.social || 50))),
              feedback: "Maintain meaningful connections with family and close network without letting distractions take over.",
              status: "neutral",
            },
            {
              name: "Career",
              score: Math.min(100, Math.max(30, (metrics?.career || 65))),
              feedback: "Clear progress toward technical mastery and professional delivery.",
              status: metrics?.career >= 70 ? "optimal" : "needs_attention",
            },
          ],
          actionItems: [
            "Complete your highest cognitive task (DSA or Architecture) in the first 2 hours of waking.",
            "Protect 30 minutes for physical recovery and balanced nutrition.",
            "Review your weekly budget and maintain intentional spending habits.",
          ],
          stoicQuote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
          aiGenerated: false,
          note: "Generated via local heuristic engine. Add GEMINI_API_KEY in Secrets for live Gemini 3.8 deep analysis.",
        },
      });
    }

    const prompt = `You are an elite Life Operating System strategist and executive habit judge for "HabitPulse SaaS".
Analyze this user's daily performance across 5 life dimensions (Education, Religion, Health, Social, Career) plus their financial & engineering career context.

USER DATA FOR DATE: ${date || new Date().toISOString().split("T")[0]}
Habits/Tasks completed: ${JSON.stringify(habits || [])}
Calculated category metrics: ${JSON.stringify(metrics || {})}
Financial summary: ${JSON.stringify(financialSummary || {})}
Engineering Career Status: ${JSON.stringify(careerProgress || {})}
User reflections: "${userNotes || "None provided"}"

Provide an honest, constructive, analytical evaluation in strict JSON format.
Your JSON must strictly match this schema:
{
  "overallScore": number (0-100),
  "grade": "S" | "A+" | "A" | "B" | "C" | "D",
  "verdict": "string (2-3 punchy, insightful, direct sentences about today's execution)",
  "dimensions": [
    {
      "name": "Education",
      "score": number (0-100),
      "feedback": "string (1-2 sentences on their learning, study, reading, DSA)",
      "status": "optimal" | "needs_attention" | "warning"
    },
    {
      "name": "Religion",
      "score": number (0-100),
      "feedback": "string (1-2 sentences on spirituality, prayers, reflection, mindfulness)",
      "status": "optimal" | "needs_attention" | "warning"
    },
    {
      "name": "Health",
      "score": number (0-100),
      "feedback": "string (1-2 sentences on workout, steps, sleep, nutrition)",
      "status": "optimal" | "needs_attention" | "warning"
    },
    {
      "name": "Social",
      "score": number (0-100),
      "feedback": "string (1-2 sentences on relationships, family, community)",
      "status": "optimal" | "needs_attention" | "warning"
    },
    {
      "name": "Career",
      "score": number (0-100),
      "feedback": "string (1-2 sentences on engineering growth, coding, system design)",
      "status": "optimal" | "needs_attention" | "warning"
    }
  ],
  "actionItems": ["string (Tomorrow Action 1)", "string (Tomorrow Action 2)", "string (Tomorrow Action 3)"],
  "stoicQuote": "string (A sharp, timeless quote or principle to live by)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const responseText = response.text?.trim() || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fence
      const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: {
        ...parsedData,
        aiGenerated: true,
      },
    });
  } catch (err: any) {
    console.error("AI Evaluation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to generate AI evaluation",
    });
  }
});

// AI Software Engineering & Life Coach Chat Endpoint
app.post("/api/ai/coach", async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const { question, userContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!ai) {
      return res.json({
        reply: `AI Coach is ready. To enable live Gemini responses, ensure your GEMINI_API_KEY is available in the environment secrets. In the meantime, focus on your top 3 habits and complete your daily DSA/System Design block!`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are the HabitPulse Principal Engineering & Life OS Coach. 
You advise ambitious software engineers on balancing intense career growth (DSA, System Design, Full-Stack, Cloud) with holistic life excellence (Religion/Mindfulness, Physical Health, Relationships, Education, and Personal Finance).
Keep your answer direct, highly actionable, encouraging, and structured with concise bullet points.

Context: ${JSON.stringify(userContext || {})}
Question from user: "${question}"`,
    });

    return res.json({
      reply: response.text || "No response generated.",
    });
  } catch (err: any) {
    console.error("AI Coach error:", err);
    return res.status(500).json({
      error: err.message || "Failed to get coach reply",
    });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
