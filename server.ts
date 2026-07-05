import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import twilio from "twilio";
import { createServer as createViteServer } from "vite";

dotenv.config();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const app = express();
app.use(express.json());
const PORT = 3000;

// Lazy initialization of the Gemini AI Client to avoid startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it via the Secrets panel.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ============================================
// API ROUTES
// ============================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});
app.post("/api/send-whatsapp", async (req, res) => {
  try {
    const { phone, message } = req.body;

    const response = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      to: `whatsapp:${phone}`,
      body: message,
    });

    res.json({
      success: true,
      sid: response.sid,
    });
  } catch (err: any) {
    console.error("WhatsApp Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 1. AI Blood Demand Prediction Endpoint
app.post("/api/ai/predict-demand", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { history, currentStock } = req.body;

    const dataContextPrompt = `
      You are a healthcare analytics AI. Analyze the historical blood requests and stock state to forecast monthly demand and give inventory goals.
      Historical Blood Requests received: ${JSON.stringify(history || [])}
      Current Inventory Status: ${JSON.stringify(currentStock || [])}
      
      Generate a forecast detailing expected demand (in units) for each blood group (A+, A-, B+, B-, AB+, AB-, O+, O-) for the coming 30 days. Recommend minimum and target inventory stock levels.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: dataContextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedMonthlyDemand: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  blood_group: { type: Type.STRING },
                  units: { type: Type.INTEGER },
                  trend: { type: Type.STRING, description: "e.g., Upward, Steady, Downward" }
                },
                required: ["blood_group", "units", "trend"]
              }
            },
            recommendedInventory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  blood_group: { type: Type.STRING },
                  min_units: { type: Type.INTEGER },
                  target_units: { type: Type.INTEGER }
                },
                required: ["blood_group", "min_units", "target_units"]
              }
            },
            confidenceScore: { type: Type.NUMBER },
            commentary: { type: Type.STRING }
          },
          required: ["predictedMonthlyDemand", "recommendedInventory", "confidenceScore", "commentary"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response content from model");
    }

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("AI Demand Prediction Error:", error);
    res.status(500).json({ error: error.message || "Failed to estimate demand" });
  }
});

// 2. AI Blood Shortage Prediction Endpoint
app.post("/api/ai/predict-shortage", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { stockCounts, activeRequestCounts } = req.body;

    const summaryContext = `
      Evaluate blood stock status and active request queues to detect impending critical shortage risks.
      Current Blood Unit Stocks (ML / Unused): ${JSON.stringify(stockCounts || {})}
      Active Pending Requests (Units Needed): ${JSON.stringify(activeRequestCounts || {})}
      
      Calculate shortage probabilities and hazard risk categories ('Low', 'Medium', 'High') for each of the eight standard blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: summaryContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortageRisk: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  blood_group: { type: Type.STRING },
                  risk_level: { type: Type.STRING, description: "Low, Medium, or High" },
                  probability: { type: Type.NUMBER, description: "Value from 0 to 1.0" },
                  reasoning: { type: Type.STRING }
                },
                required: ["blood_group", "risk_level", "probability", "reasoning"]
              }
            }
          },
          required: ["shortageRisk"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response content from model");
    }

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("AI Shortage Prediction Error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate shortage risk" });
  }
});

// 3. AI Blood Expiry Prediction Endpoint
app.post("/api/ai/predict-expiry", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { inventoryItems } = req.body;

    const expiryContext = `
      You are an expert blood bank audit analyst. Check these medical inventory batches and calculate near-expiration timelines.
      Inventory Items: ${JSON.stringify(inventoryItems || [])}
      Today's Date is: ${new Date().toISOString().split('T')[0]}
      
      Identify near-expiry blood units (units expiring within 7 days, or expired). Output expected wastage volume, near-expiry alert summaries, and a recommended high-priority usage order of blood groups to prevent waste.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: expiryContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expectedWastageUnits: { type: Type.INTEGER },
            nearExpiryList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  inventory_id: { type: Type.STRING },
                  blood_group: { type: Type.STRING },
                  days_remaining: { type: Type.INTEGER },
                  recommendation: { type: Type.STRING, description: "Action to take e.g., Transfer to General Hospital, Prioritize for scheduled elective surgery" }
                },
                required: ["inventory_id", "blood_group", "days_remaining", "recommendation"]
              }
            },
            priorityUsageList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Optimal order of blood groups to deploy first to prevent expiry"
            }
          },
          required: ["expectedWastageUnits", "nearExpiryList", "priorityUsageList"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response content from model");
    }

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("AI Expiry Prediction Error:", error);
    res.status(500).json({ error: error.message || "Failed to verify unit expirations" });
  }
});

// 4. AI Smart Donor Recommendation Engine Endpoint
app.post("/api/ai/recommend-donors", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { requestGroup, requestCity, candidateDonors } = req.body;

    const recommendPrompt = `
      You are a smart clinical matching system. Match registered public donors with a specific emergency blood request.
      Emergency Demand Details:
      - Requested Blood Group: ${requestGroup}
      - Hospital Location: ${requestCity}
      
      Candidate Donors: ${JSON.stringify(candidateDonors || [])}
      Today's Date: ${new Date().toISOString().split('T')[0]}
      
      Rule Book:
      - A perfect match shares the same blood group and resides in the same city.
      - Compatibilities allowed if group does not match perfectly, but preference is for matching blood.
      - Donors are eligible only if (Age >= 18) and (Last Donation Date is empty OR > 90 days ago) and (Availability is true).
      - Compute compatibility, availability score (0-100), and reliability score (0-100) based on location match and donation status.
      - Output a ranked list of matched donors, providing recommendation commentary for each.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: recommendPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              donor_id: { type: Type.STRING },
              name: { type: Type.STRING },
              suitability_rank: { type: Type.INTEGER },
              compatibility_status: { type: Type.STRING }, // e.g., Perfect Match, Compatible Match, Ineligible
              reliability_score: { type: Type.INTEGER }, // 0 to 100
              availability_score: { type: Type.INTEGER }, // 0 to 100
              commentary: { type: Type.STRING }
            },
            required: ["donor_id", "name", "suitability_rank", "compatibility_status", "reliability_score", "availability_score", "commentary"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response content from model");
    }

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("AI Recommendation Error:", error);
    res.status(500).json({ error: error.message || "Failed to match recommendations" });
  }
});

// ============================================
// VITE DEV SERVER / PRODUCTION CONFIGURATION
// ============================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode configuration with Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build configuration serving static bundle files from dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BloodLink AI] Server running smoothly at http://0.0.0.0:${PORT}`);
  });
}

startServer();
