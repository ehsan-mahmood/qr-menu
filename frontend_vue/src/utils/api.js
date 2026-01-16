import axios from 'axios'
import { API_BASE_URL } from '@/config'

// Create a shared axios instance with auth token interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Longer timeout for OCR requests
})

// Set up axios interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

