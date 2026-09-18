import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { db } from "../db/index.ts";
import { services, categories, states } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const router = Router();

// Initialize the Gemini client using the environment variable required
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "" });

router.post("/ask", async (req, res) => {
  try {
    const { query, history } = req.body;

    if (!process.env.AI_API_KEY && !process.env.GEMINI_API_KEY) {
      console.warn("AI_API_KEY is not set.");
      return res.status(500).json({ error: "SEVA AI is temporarily unavailable." });
    }

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // In a real production app, we would use vector search to retrieve relevant schemes.
    // For this prototype, we'll fetch verified services to ground the response.
    // E.g. fetch some top services to include in the system prompt context.
    const verifiedServices = await db.select({
      name: services.name,
      description: services.description,
      state: states.name,
      category: categories.name,
      jurisdiction: services.jurisdiction,
    })
    .from(services)
    .leftJoin(states, eq(services.stateId, states.id))
    .leftJoin(categories, eq(services.categoryId, categories.id))
    .where(eq(services.verificationStatus, 'VERIFIED'))
    .limit(10); // Fetch top verified services for context grounding

    const contextContext = verifiedServices.map(s => 
      `- ${s.name} (${s.jurisdiction}${s.state ? ', ' + s.state : ''}): ${s.description}`
    ).join('\n');

    const systemInstruction = `
You are Ask SEVA, a grounded government-information assistant for India.
SEVA helps people discover relevant Indian government services and schemes.
SEVA is NOT an official Government of India application. Do not claim to be a government authority.

CRITICAL RULES:
1. Never invent a scheme.
2. Never invent a government website or URL.
3. Never invent a deadline.
4. Never invent eligibility requirements.
5. Never guarantee approval for any scheme.
6. Say when information cannot be verified.
7. Prioritize official sources.
8. Prefer current verified records from the provided context.

VERIFIED SEVA DATABASE RECORDS CONTEXT:
${contextContext || "No verified records available yet."}

Respond to the user's query thoughtfully, clearly, and concisely. If they are looking for a scheme, ask them clarifying questions like state, age, or education level if it helps narrow down the options.
    `;

    // Map history to Google GenAI format (only last 5 turns to save context)
    const formattedHistory = (history || []).slice(-5).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.1, // Low temperature for factual accuracy
      }
    });

    res.json({ reply: response.text });

  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "SEVA AI is temporarily unavailable. You can still browse verified government services and official links." });
  }
});

export default router;
