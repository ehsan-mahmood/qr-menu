<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-charcoal mb-2">QR Menu</h1>
        <p class="text-gray">Merchant Login</p>
      </div>

      <!-- Login Card -->
      <div class="card">
        <h2 class="text-2xl font-bold text-charcoal mb-6">Welcome Back</h2>

        <!-- Test Mode Banner -->
        <div v-if="testMode" class="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-yellow-800 text-sm text-center">
            🧪 Test Mode: Use any credentials to login
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-700 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-charcoal mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input"
              placeholder="your@email.com"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-charcoal mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="rounded border-warm-gray text-primary focus:ring-primary"
              />
              <span class="ml-2 text-gray">Remember me</span>
            </label>
            <button
              type="button"
              class="text-primary hover:underline"
              @click="showForgotPassword"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            class="w-full btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Log In</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-warm-gray"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray">New to QR Menu?</span>
          </div>
        </div>

        <!-- Sign Up Link -->
        <button
          @click="goToSignUp"
          class="w-full btn btn-secondary"
        >
          Create an Account
        </button>
      </div>

      <!-- Customer Access -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray mb-2">Customer?</p>
        <button
          @click="goToCustomerDemo"
          class="text-primary hover:underline text-sm font-medium"
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
input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}
</style>

