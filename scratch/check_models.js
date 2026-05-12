const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no listModels in the SDK directly usually, but let's try a simpler model name
    const models = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-pro-latest'];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("test");
        console.log(`✅ Model ${m} works!`);
        return m;
      } catch (e) {
        console.log(`❌ Model ${m} failed: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
