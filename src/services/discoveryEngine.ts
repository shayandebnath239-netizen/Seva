import cron from 'node-cron';
import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db/index.ts';
import { services } from '../db/schema.ts';

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "" });
const parser = new Parser();

// This engine simulates connecting to government RSS feeds (e.g., Press Information Bureau)
// and using AI to parse unstructured announcements into structured schema records.
export async function runDiscovery() {
  console.log("Running Automatic Scheme Discovery...");
  
  try {
    // 1. Fetch from a standard news source / RSS feed
    // Note: For production in India, we might track PIB (Press Information Bureau) or similar.
    // For this prototype, we'll simulate an incoming feed with some mocked recent texts
    // since live government RSS links often block scrapers without valid headers.
    
    const recentAnnouncements = [
      {
        title: "Cabinet approves PM Vidyalaxmi Scheme",
        content: "The Cabinet has approved the PM Vidyalaxmi scheme to provide financial support to meritorious students for higher education. Students with an annual family income of up to Rs 8 lakh will be eligible for a 3% interest subvention on education loans up to Rs 10 lakh. This scheme aims to ensure no student is deprived of higher education due to financial constraints. It is a Central government initiative."
      },
      {
        title: "Maharashtra launches Ladki Bahin Yojana",
        content: "The Maharashtra state government announced the Mukhyamantri Majhi Ladki Bahin Yojana. Under this scheme, eligible women aged between 21 and 60 years will receive a monthly financial assistance of Rs 1,500. The family's annual income should not exceed Rs 2.5 lakh."
      }
    ];

    for (const item of recentAnnouncements) {
      console.log(`Processing announcement: ${item.title}`);
      
      const prompt = `You are a data extraction assistant for SEVA, an Indian citizen services platform.
Extract the government scheme details from the following news/press release text.
Return ONLY a raw JSON object (without markdown code blocks) matching this exact schema:
{
  "name": "Name of the scheme",
  "description": "Clear description of benefits and purpose",
  "jurisdiction": "CENTRAL" or "STATE",
  "category": "Education", "Agriculture", "Healthcare", "Housing", "Business", "Pension", or "General"
}

Text: ${item.content}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      let jsonStr = response.text || "{}";
      
      try {
        const parsed = JSON.parse(jsonStr);
        
        // Find category ID mapping (simplified for demo, assumes category IDs exist)
        // In a real app we'd map "Education" to categoryId. We will use a default if missing.
        
        // 2. Insert as UNPUBLISHED / NEEDS_REVIEW to enforce Data Trust Rule
        await db.insert(services).values({
          name: parsed.name,
          description: parsed.description,
          jurisdiction: parsed.jurisdiction === 'STATE' ? 'STATE' : 'CENTRAL',
          verificationStatus: 'UNPUBLISHED',
          categoryId: 1 // Default category
        });
        
        console.log(`Successfully ingested scheme: ${parsed.name} as UNPUBLISHED.`);
      } catch (parseError) {
        console.error("Failed to parse Gemini output into JSON:", jsonStr);
      }
    }
  } catch (error) {
    console.error("Error running scheme discovery:", error);
  }
}

// Start the cron job
export function initDiscoveryCron() {
  // Run automatically every night at 2:00 AM
  cron.schedule('0 2 * * *', () => {
    runDiscovery();
  });
  console.log("Scheme Discovery Engine initialized. Listening for new government announcements.");
}
