import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'https://cuboic-884m.onrender.com',
    timeout: 10_000,
});

export default api;
