import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TEST_MODE } from '@/config'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const merchantId = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const currentUser = computed(() => user.value)
  const currentMerchantId = computed(() => merchantId.value)

  // Actions
  async function login({ email, password, rememberMe }) {
    loading.value = true
    error.value = null

    try {
      if (TEST_MODE) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock user data
        user.value = {
          id: 'user-001',
          name: 'Test Merchant',
          email: email,
          merchantId: 'merchant-001',
        }
        merchantId.value = 'merchant-001'
        isAuthenticated.value = true

        // Store in localStorage if remember me
        if (rememberMe) {
          localStorage.setItem('auth_user', JSON.stringify(user.value))
          localStorage.setItem('auth_token', 'test-token-' + Date.now())
        } else {
          sessionStorage.setItem('auth_user', JSON.stringify(user.value))
          sessionStorage.setItem('auth_token', 'test-token-' + Date.now())
        }

        return user.value
      }

      // Real API call
      const response = await authService.login({ email, password, rememberMe })
      const responseData = response.data
      
      user.value = responseData.user
      merchantId.value = responseData.user.merchantId
      isAuthenticated.value = true

      // Store token and user data
      if (rememberMe) {
        localStorage.setItem('auth_user', JSON.stringify(user.value))
        localStorage.setItem('auth_token', responseData.token)
      } else {
        sessionStorage.setItem('auth_user', JSON.stringify(user.value))
        sessionStorage.setItem('auth_token', responseData.token)
      }

      return user.value
      
    } catch (err) {
      // Extract error message from axios response or use default
      const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function signUp({ name, email, phone, password }) {
    loading.value = true
    error.value = null

    try {
      if (TEST_MODE) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock user data
        user.value = {
          id: 'user-' + Date.now(),
          name: name,
          email: email,
          phone: phone,
          merchantId: 'merchant-' + Date.now(),
        }
        merchantId.value = user.value.merchantId
        isAuthenticated.value = true

        // Store in session
        sessionStorage.setItem('auth_user', JSON.stringify(user.value))
        sessionStorage.setItem('auth_token', 'test-token-' + Date.now())

        return user.value
      }

      // Real API call
      const response = await authService.signUp({ name, email, phone, password })
      const responseData = response.data
      
      user.value = responseData.user
      merchantId.value = responseData.user.merchantId
      isAuthenticated.value = true

      // Store token and user data in session
      sessionStorage.setItem('auth_user', JSON.stringify(user.value))
      sessionStorage.setItem('auth_token', responseData.token)

      return user.value
      
    } catch (err) {
      // Extract error message from axios response or use default
      const errorMessage = err.response?.data?.error || err.message || 'Sign up failed. Please try again.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    user.value = null
    merchantId.value = null
    isAuthenticated.value = false
    
    // Clear storage
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
  }

  async function checkAuth() {
    // Check if user is stored in localStorage or sessionStorage
    const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser)
      merchantId.value = user.value.merchantId
      isAuthenticated.value = true
      return true
    }

    return false
  }

  function updateUserProfile(updates) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
      
      // Update storage
      const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage
      storage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  return {
    // State
    user,
    merchantId,
    isAuthenticated,
    loading,
    error,
    // Getters
    currentUser,
    currentMerchantId,
    // Actions
    login,
    signUp,
    logout,
    checkAuth,
    updateUserProfile,
  }
})

