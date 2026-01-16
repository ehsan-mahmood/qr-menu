import api from '@/utils/api'
import { TEST_MODE } from '@/config'

export const authService = {
  // Login
  async login({ email, password, rememberMe }) {
    if (TEST_MODE) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        data: {
          messageId: 'LOGIN_SUCCESS',
          receivingId: 'test-session-' + Date.now(),
          token: 'test-token-' + Date.now(),
          user: {
            id: 'user-001',
            name: 'Test Merchant',
            email: email,
            merchantId: 'merchant-001',
          },
        }
      }
    }
    
    const response = await api.post('/auth/login', {
      email,
      password,
      rememberMe,
    })
    return response
  },

  // Sign up
  async signUp({ name, email, phone, password }) {
    if (TEST_MODE) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      return {
        data: {
          messageId: 'SIGNUP_SUCCESS',
          receivingId: 'test-user-' + Date.now(),
          token: 'test-token-' + Date.now(),
          user: {
            id: 'user-' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            merchantId: 'merchant-' + Date.now(),
          },
        }
      }
    }
    
    const response = await api.post('/auth/signup', {
      name,
      email,
      phone,
      password,
    })
    return response
  },

  // Verify token
  async verify() {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return {
        data: {
          messageId: 'VERIFY_SUCCESS',
          receivingId: 'verify-' + Date.now(),
          user: {
            id: 'user-001',
            name: 'Test Merchant',
            email: 'test@example.com',
            merchantId: 'merchant-001',
          },
        }
      }
    }
    
    const response = await api.get('/auth/verify')
    return response
  },
}

export default authService

