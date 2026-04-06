import axios from 'axios'

async function test() {
  const API_URL = 'https://cuboic-884m.onrender.com'
  const userId = 'owner01'
  const password = 'password123'

  try {
    console.log(`📡 Connecting to: ${API_URL}`)
    const loginRes = await axios.post(`${API_URL}/auth/login`, { userId, password })
    const { access_token, user } = loginRes.data
    console.log(`✅ Login Success! ID: ${user.id}, Restaurant: ${user.restaurantId}`)
    
    const tablesRes = await axios.get(`${API_URL}/restaurants/${user.restaurantId}/tables`, {
      headers: { Authorization: `Bearer ${access_token}` }
    })
    console.log(`✅ Tables Request Success! Found: ${tablesRes.data.length}`)
    console.log(JSON.stringify(tablesRes.data, null, 2))
    
    // Check if any of these tables have active orders
    const ordersRes = await axios.get(`${API_URL}/orders?restaurantId=${user.restaurantId}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    })
    console.log(`✅ Orders Found: ${ordersRes.data.length}`)
  } catch (e: any) {
    console.error('❌ Test Failed:', e.response?.data || e.message)
  }
}

test()
