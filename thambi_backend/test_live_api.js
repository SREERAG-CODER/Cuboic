const axios = require('axios');

async function test() {
  const API_URL = 'https://cuboic-884m.onrender.com';
  const userId = 'owner01';
  const password = 'password123';

  try {
    console.log(`📡 Connecting to: ${API_URL}`);
    const loginRes = await axios.post(`${API_URL}/auth/login`, { userId, password });
    const { access_token, user } = loginRes.data;
    console.log(`✅ Login Success! ID: ${user.id}, Restaurant: ${user.restaurantId}`);
    
    // Check if the endpoint exists
    console.log(`📡 Fetching tables for restaurant: ${user.restaurantId}`);
    const tablesRes = await axios.get(`${API_URL}/restaurants/${user.restaurantId}/tables`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    console.log(`✅ Tables Request Success! Found: ${tablesRes.data.length}`);
    process.exit(0);
  } catch (e) {
    if (e.response) {
      console.error('❌ API Error:', e.response.status, e.response.data);
    } else {
      console.error('❌ Request Error:', e.message);
    }
    process.exit(1);
  }
}

test();
