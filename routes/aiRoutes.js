const express = require("express");
const router = express.Router();

// Initialize OpenAI only if API key is available
let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    const OpenAI = require("openai");
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn("OpenAI not initialized - API key not configured");
}

// POST /api/ai/generate
router.post("/generate", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: "AI service not available - OpenAI API key not configured" 
      });
    }

    const { testType } = req.body;

    let prompt = "";
    if (testType === "MCQ") {
      prompt = "Generate 1 MCQ question with 4 options and indicate correct option (A/B/C/D). Return as JSON: {question, options: [], correctOption}.";
    } else if (testType === "Long") {
      prompt = "Generate 1 long answer question. Return as JSON: {question, marks}.";
    } else if (testType === "Coding") {
      prompt = "Generate 1 coding question with expected output. Return as JSON: {question, expectedOutput}.";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let aiData = {};
    try {
      aiData = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.json(aiData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router; // ✅ CommonJS export
