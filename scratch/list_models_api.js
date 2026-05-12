const axios = require('axios');
require('dotenv').config();

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log('🔍 Listing Gemini Models...');

  try {
    const response = await axios.get(url);
    console.log('✅ Success!');
    console.log('Models found:', response.data.models.map(m => m.name).join(', '));
  } catch (error) {
    console.error('❌ Error listing models');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

listGeminiModels();
