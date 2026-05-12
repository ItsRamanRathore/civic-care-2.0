const axios = require('axios');
require('dotenv').config();

async function debugGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
  
  console.log('🔍 Debugging Gemini API...');
  console.log('URL:', url.replace(apiKey, 'REDACTED'));

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log('✅ Success! Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ API Error!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

debugGeminiAPI();
