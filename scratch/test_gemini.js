const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing API Key:', apiKey ? 'FOUND' : 'MISSING');
  
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, respond with JSON: { 'status': 'ok' }");
    console.log('✅ Success! Response:', result.response.text());
  } catch (error) {
    console.error('❌ Failed! Error:', error.message);
  }
}

testGemini();
