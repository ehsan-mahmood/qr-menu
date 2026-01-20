<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo/Brand -->
      <div class="login-header">
        <h1 class="login-title">QR Menu</h1>
        <p class="login-subtitle">Merchant Login</p>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <h2 class="card-title">Welcome Back</h2>

        <!-- Test Mode Banner -->
        <div v-if="testMode" class="test-banner">
          <p>
            Test Mode: Use any credentials to login
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div>
            <label for="email" class="input-label">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input-field"
              placeholder="your@email.com"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password" class="input-label">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>

          <div class="form-options">
            <label class="checkbox-group">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-label">Remember me</span>
            </label>
            <button
              type="button"
              class="btn-link"
              @click="showForgotPassword"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            class="btn-primary btn-full"
            :disabled="loading"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Log In</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <div class="divider-line"></div>
          <div class="divider-text">
            <span>New to QR Menu?</span>
          </div>
        </div>

        <!-- Sign Up Link -->
        <button
          @click="goToSignUp"
          class="btn-secondary btn-full"
        >
          Create an Account
        </button>
      </div>

      <!-- Customer Access -->
      <div class="customer-access">
        <p class="customer-text">Customer?</p>
        <button
          @click="goToCustomerDemo"
          class="btn-link"
        >
          View Demo Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useQRStore } from '@/stores/qrStore'
import { useMenuStore } from '@/stores/menuStore'
import { TEST_MODE } from '@/config'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const qrStore = useQRStore()
const menuStore = useMenuStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const testMode = TEST_MODE

// Handle QR code URL parameter (e.g., /?qr=token-xxx)
onMounted(async () => {
  const qrToken = route.query.qr
  if (qrToken && typeof qrToken === 'string') {
    try {
      // Fetch QR data
      await qrStore.fetchQRData(qrToken)
      
      // Fetch menu if menuId is available
      if (qrStore.menuId) {
        await menuStore.fetchMenuById(qrStore.menuId)
        await menuStore.fetchMenuConfig(qrStore.menuId)
        // Redirect to menu page
        router.push(`/menu/${qrStore.menuId}`)
        return
      }
    } catch (err) {
      console.error('Failed to load QR code data:', err)
      // If QR code fails, show error but stay on login page
      errorMessage.value = 'Invalid QR code. Please scan a valid QR code or login to continue.'
    }
  }
})

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    })

    // Redirect to dashboard after successful login
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

const goToSignUp = () => {
  console.log('goToSignUp called')
  console.log('Router:', router)
  router.push('/signup')
}

const goToCustomerDemo = () => {
  router.push('/menu/test-menu-001')
}

const showForgotPassword = () => {
  alert('Password reset functionality coming soon!')
}
</script>

<style scoped>
/* Light Theme - Updated Design Handoff */
.login-page {
  min-height: 100vh;
  background-color: #F8F8F7;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-container {
  max-width: 400px;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 32px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 15px;
  color: #737373;
  margin: 0;
}

.login-card {
  background-color: #FEFEFE;
  border: 2px solid #E5E5E4;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 24px 0;
}

.test-banner {
  background-color: #FFF8E1;
  border: 1px solid #FFE082;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.test-banner p {
  font-size: 13px;
  font-weight: 400;
  color: #F57C00;
  margin: 0;
}

.error-banner {
  background-color: #FFEBEE;
  border: 1px solid #EF9A9A;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.error-banner p {
  font-size: 13px;
  color: #C62828;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0b0706;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  background-color: #FFFFFF;
  border: 1px solid #D4D4D3;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
  min-height: 48px;
  transition: all 120ms ease-out;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #0b0706;
}

.input-field::placeholder {
  color: #737373;
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  font-weight: 400;
  color: #737373;
  cursor: pointer;
}

.btn-link {
  background: none;
  border: none;
  color: #4A1A28;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: underline;
  transition: all 120ms ease-out;
}

.btn-link:hover {
  opacity: 0.7;
}

.btn-primary {
  background: linear-gradient(135deg, #4A1A28 0%, #5D1F33 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  transition: all 120ms ease-out;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 26, 40, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5D1F33 0%, #4A1A28 100%);
  box-shadow: 0 4px 12px rgba(74, 26, 40, 0.3);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #FFFFFF;
  color: #0b0706;
  border: 1px solid #D4D4D3;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  transition: all 120ms ease-out;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  border-color: #4A1A28;
  background-color: #FAFAF9;
}

.btn-full {
  width: 100%;
}

.divider {
  position: relative;
  margin: 24px 0;
}

.divider-line {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

.divider-line::before {
  content: '';
  width: 100%;
  border-top: 1px solid #E5E5E4;
}

.divider-text {
  position: relative;
  display: flex;
  justify-content: center;
  font-size: 14px;
}

.divider-text span {
  background-color: #FEFEFE;
  padding: 0 16px;
  color: #737373;
}

.customer-access {
  margin-top: 24px;
  text-align: center;
}

.customer-text {
  font-size: 14px;
  color: #737373;
  margin: 0 0 8px 0;
}
</style>

