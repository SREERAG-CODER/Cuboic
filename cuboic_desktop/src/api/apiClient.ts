import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const SOCKET_BASE = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_BASE,
})

// Intercept requests to attach the latest JWT token from Electron's secure storage
apiClient.interceptors.request.use(async (config) => {
  try {
    if (window.ipcRenderer) {
      const auth = await window.ipcRenderer.invoke('auth:get-token')
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`
        /* 
        // Temporarily disabled until backend allows X-Outlet-Id in CORS headers
        if (auth.outletId) {
            config.headers['X-Outlet-Id'] = auth.outletId
        }
        */
      }
    } else {
      // Dev mode: Fetch from localStorage
      const token = localStorage.getItem('token')
      const outletId = localStorage.getItem('outletId')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        /*
        if (outletId) {
          config.headers['X-Outlet-Id'] = outletId
        }
        */
      }
    }
  } catch (error) {
    console.warn("Failed to attach secure token to API request")
  }
  return config
})
