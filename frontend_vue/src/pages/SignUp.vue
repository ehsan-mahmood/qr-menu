<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-charcoal mb-2">QR Menu</h1>
        <p class="text-gray">Create Your Merchant Account</p>
      </div>

      <!-- Sign Up Card -->
      <div class="card">
        <h2 class="text-2xl font-bold text-charcoal mb-6">Get Started</h2>

        <!-- Test Mode Banner -->
        <div v-if="testMode" class="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-yellow-800 text-sm text-center">
            🧪 Test Mode: Sign up will proceed to onboarding
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-700 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Sign Up Form -->
        <form @submit.prevent="handleSignUp" class="space-y-4">
          <!-- Debug Info -->
          <div v-if="testMode" class="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Form Valid: {{ isFormValid }} | Loading: {{ loading }}
          </div>
          <div>
            <label for="name" class="block text-sm font-medium text-charcoal mb-1">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="input"
              placeholder="John Doe"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-charcoal mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="input"
              placeholder="your@email.com"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-charcoal mb-1">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="input"
              placeholder="+1 (555) 123-4567"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-charcoal mb-1">
              Password <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="8"
              class="input"
              placeholder="••••••••"
              :disabled="loading"
            />
            <p class="text-xs text-gray mt-1">At least 8 characters</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-charcoal mb-1">
              Confirm Password <span class="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              required
              class="input"
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>

          <div class="flex items-start">
            <input
              id="terms"
              v-model="formData.agreeToTerms"
              type="checkbox"
              required
              class="mt-1 rounded border-warm-gray text-primary focus:ring-primary"
              :disabled="loading"
              @change="() => console.log('Terms checkbox changed:', formData.agreeToTerms)"
            />
            <label for="terms" class="ml-2 text-sm text-gray">
              I agree to the <button type="button" class="text-primary hover:underline">Terms of Service</button> 
              and <button type="button" class="text-primary hover:underline">Privacy Policy</button>
            </label>
          </div>

          <button
            type="submit"
            class="w-full btn btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || loading }"
            :disabled="!isFormValid || loading"
            @click="(e) => { console.log('Button clicked!', { isFormValid: isFormValid, loading: loading, disabled: !isFormValid || loading }); }"
          >
            <span v-if="loading">Creating Account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-warm-gray"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray">Already have an account?</span>
          </div>
        </div>

        <!-- Login Link -->
        <button
          @click="goToLogin"
          class="w-full btn btn-secondary"
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
input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}
</style>

