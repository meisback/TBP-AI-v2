
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "TBP AI v2.0",
    message: "Backend Running 🚀"
  });
});

// Chat Route (Part 4C-এ সম্পূর্ণ করব)
app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "⚠️ কোনো মেসেজ পাওয়া যায়নি।"
      });
    }

    // এখানে Part 4C-এ AI কোড যোগ হবে

    res.json({
      reply: "✅ Backend Ready. AI Part 4C-এ যুক্ত হবে।"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "❌ Backend Error"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 TBP AI চলছে: http://localhost:${PORT}`);
});
