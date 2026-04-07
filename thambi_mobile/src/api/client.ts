import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://cuboic-884m.onrender.com';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 40_000,
});

// Attach JWT token to every request
api.interceptors.request.use(async config => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
export { BASE_URL };
