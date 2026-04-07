import axios from 'axios'

const BASE_URL = 'https://cuboic-884m.onrender.com'

export const apiClient = axios.create({
    baseURL: BASE_URL,
})

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('thambi_admin_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
export default apiClient;
