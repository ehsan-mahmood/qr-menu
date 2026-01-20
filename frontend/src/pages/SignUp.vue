<template>
  <div class="signup-page">
    <div class="signup-container">
      <!-- Logo/Brand -->
      <div class="signup-header">
        <h1 class="signup-title">QR Menu</h1>
        <p class="signup-subtitle">Create Your Merchant Account</p>
      </div>

      <!-- Sign Up Card -->
      <div class="signup-card">
        <h2 class="card-title">Get Started</h2>

        <!-- Test Mode Banner -->
        <div v-if="testMode" class="test-banner">
          <p>
            Test Mode: Sign up will proceed to onboarding
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Sign Up Form -->
        <form @submit.prevent="handleSignUp" class="signup-form">
          <div>
            <label for="name" class="input-label">
              Full Name <span class="required">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="input-field"
              placeholder="John Doe"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="email" class="input-label">
              Email <span class="required">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="input-field"
              placeholder="your@email.com"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="phone" class="input-label">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="input-field"
              placeholder="+1 (555) 123-4567"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password" class="input-label">
              Password <span class="required">*</span>
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="8"
              class="input-field"
              placeholder="••••••••"
              :disabled="loading"
            />
            <p class="input-hint">At least 8 characters</p>
          </div>

          <div>
            <label for="confirmPassword" class="input-label">
              Confirm Password <span class="required">*</span>
            </label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>

          <div class="terms-group">
            <input
              id="terms"
              v-model="formData.agreeToTerms"
              type="checkbox"
              required
              class="checkbox-input"
              :disabled="loading"
            />
            <label for="terms" class="terms-label">
              I agree to the <button type="button" class="link-button">Terms of Service</button> 
              and <button type="button" class="link-button">Privacy Policy</button>
            </label>
          </div>

          <button
            type="submit"
            class="btn-primary btn-full"
            :disabled="!isFormValid || loading"
          >
            <span v-if="loading">Creating Account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <div class="divider-line"></div>
          <div class="divider-text">
            <span>Already have an account?</span>
          </div>
        </div>

        <!-- Login Link -->
        <button
          @click="goToLogin"
          class="btn-secondary btn-full"
        >
          Log In
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { TEST_MODE } from '@/config'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
})

const loading = ref(false)
const errorMessage = ref('')
const testMode = TEST_MODE

const isFormValid = computed(() => {
  const checks = {
    hasName: !!formData.value.name,
    hasEmail: !!formData.value.email,
    hasPassword: !!formData.value.password,
    passwordLength: formData.value.password.length >= 8,
    passwordsMatch: formData.value.password === formData.value.confirmPassword,
    termsAgreed: formData.value.agreeToTerms === true,
  }
  
  const isValid = Object.values(checks).every(v => v === true)
  
  console.log('Form validation checks:', checks, 'isValid:', isValid)
  
  return isValid
})

const handleSignUp = async () => {
  console.log('handleSignUp called')
  console.log('Form data:', formData.value)
  errorMessage.value = ''

  // Validate passwords match
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    await authStore.signUp({
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      password: formData.value.password,
    })

    // Redirect to onboarding after successful signup
    router.push('/onboarding')
  } catch (error) {
    console.error('Sign up error:', error)
    errorMessage.value = error.message || 'Sign up failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
/* Light Theme - Updated Design Handoff */
.signup-page {
  min-height: 100vh;
  background-color: #F8F8F7;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.signup-container {
  max-width: 400px;
  width: 100%;
}

.signup-header {
  text-align: center;
  margin-bottom: 32px;
}

.signup-title {
  font-size: 32px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 8px 0;
}

.signup-subtitle {
  font-size: 15px;
  color: #737373;
  margin: 0;
}

.signup-card {
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

.signup-form {
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

.required {
  color: #DC2626;
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

.input-hint {
  font-size: 13px;
  color: #737373;
  margin: 8px 0 0 0;
}

.terms-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
}

.terms-label {
  font-size: 14px;
  font-weight: 400;
  color: #737373;
  line-height: 1.5;
  cursor: pointer;
}

.link-button {
  background: none;
  border: none;
  color: #4A1A28;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  transition: all 120ms ease-out;
}

.link-button:hover {
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
</style>

