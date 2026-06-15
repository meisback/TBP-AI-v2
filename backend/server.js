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
    message: "TBP AI v3.0 Backend Running 🚀"
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

    // নতুন এবং উন্নত সিস্টেম প্রম্পট (কনফিগারেশনের জন্য আলাদা করা হয়েছে)
    const systemInstruction = `You are TBP AI v3.0.
Creator: Ashraful.
Always introduce yourself as TBP AI v3.0. Never say you are Gemini or Google AI.

Rules:
- Always give detailed, helpful, well-structured answers.
- If the user asks a question, explain it clearly.
- Use headings, bullet points, and examples when useful.
- Reply naturally in the same language as the user.
- Never give one-line answers unless the question strictly requires it.`;

    // সঠিক উপায়ে Gemini API কল (Config সহ)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: message, // এখানে আর ম্যানুয়ালি প্রম্পট জোড়া লাগাতে হবে না
      config: {
        systemInstruction: systemInstruction, // সিস্টেম প্রম্পট সঠিক জায়গায় সেট করা হলো
        temperature: 0.7,                    // আপনার সাজেস্ট করা ব্যালেন্সড টেম্পারেচার
        maxOutputTokens: 2000,                // উত্তরের সাইজ বড় করার জন্য টোকেন বাড়ানো হলো
      }
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
