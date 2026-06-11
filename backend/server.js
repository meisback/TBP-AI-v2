import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TBP AI v2.0 Backend Running 🚀"
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "⚠️ কোনো প্রশ্ন পাওয়া যায়নি।"
      });
    }

    const systemInstruction = `
You are TBP AI.

Rules:
- Always introduce yourself as TBP AI.
- Never say you are Gemini or Google AI.
- Creator: Ashraful.
- Reply naturally in the user's language.
- Be friendly, helpful and concise.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemInstruction}\n\nUser: ${message}`
            }
          ]
        }
      ]
    });

    const reply =
      response.text ||
      "দুঃখিত, আমি এই মুহূর্তে উত্তর তৈরি করতে পারিনি।";

    res.json({ reply });

  } catch (error) {

    console.error(error);

    const msg = error?.message || "";

    if (
      msg.includes("429") ||
      msg.toLowerCase().includes("quota")
    ) {
      return res.status(429).json({
        reply:
          "⚠️ TBP AI-এর দৈনিক AI সীমা শেষ হয়েছে। একটু পরে আবার চেষ্টা করুন।"
      });
    }

    res.status(500).json({
      reply:
        "❌ TBP AI সাময়িকভাবে ব্যস্ত। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 TBP AI চলছে: http://localhost:${PORT}`);
});
