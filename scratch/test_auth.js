const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  const email = `test_user_${Date.now()}@example.com`;
  const password = 'password123';

  console.log('--- Phase 1: Registration ---');
  try {
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      full_name: 'Test User'
    });
    console.log('✅ Registration successful:', regRes.data.status);
    
    console.log('\n--- Phase 2: Login ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    console.log('✅ Login successful:', loginRes.data.status);
    console.log('Token received:', loginRes.data.accessToken.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Auth Test Failed!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

testAuth();
