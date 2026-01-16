<template>
    <div class="min-h-screen bg-cream">
    <div class="container mx-auto px-4 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-charcoal mb-4">
          QR Menu
        </h1>
        <p class="text-lg text-gray">
          Digital Menu System for Cafés & Restaurants
        </p>
      </div>
      
      <!-- Test Mode Banner -->
      <div v-if="testMode" class="max-w-2xl mx-auto mb-8">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p class="text-yellow-800 font-medium">
            🧪 Test Mode Active - Using Static Data
          </p>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="max-w-2xl mx-auto space-y-4">
        <!-- View Demo Menu -->
        <button
          @click="viewDemoMenu"
          class="w-full card-gradient hover:shadow-warm transition-all duration-200 text-left"
        >
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-3xl">
              📋
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-charcoal">View Demo Menu</h3>
              <p class="text-gray">Browse our sample café menu</p>
            </div>
            <span class="text-2xl text-gray">→</span>
          </div>
        </button>
        
        <!-- Scan QR Code -->
        <button
          @click="goToQRScanner"
          class="w-full card-gradient hover:shadow-warm transition-all duration-200 text-left"
        >
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center text-3xl">
              📷
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-charcoal">Scan QR Code</h3>
              <p class="text-gray">Scan table QR code to view menu</p>
            </div>
            <span class="text-2xl text-gray">→</span>
          </div>
        </button>
        
        <!-- Import Menu (OCR) -->
        <button
          @click="goToOCR"
          class="w-full card-gradient hover:border-primary/30 transition-all duration-200 text-left"
        >
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-3xl">
              📸
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-charcoal">Import Menu</h3>
              <p class="text-gray">Upload paper menu for OCR parsing</p>
            </div>
            <span class="text-2xl text-gray">→</span>
          </div>
        </button>
        
        <!-- Dashboard -->
        <button
          @click="goToDashboard"
          class="w-full card-gradient hover:border-primary/30 transition-all duration-200 text-left"
        >
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-3xl">
              📊
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-charcoal">Analytics Dashboard</h3>
              <p class="text-gray">View merchant analytics and insights</p>
            </div>
            <span class="text-2xl text-gray">→</span>
          </div>
        </button>
      </div>
      
      <!-- Features -->
      <div class="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-4xl mb-2">⚡</div>
          <h4 class="font-bold mb-1 text-charcoal">Fast & Simple</h4>
          <p class="text-sm text-gray">Quick menu browsing and ordering</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-2">📱</div>
          <h4 class="font-bold mb-1 text-charcoal">Mobile First</h4>
          <p class="text-sm text-gray">Optimized for smartphone use</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-2">🎯</div>
          <h4 class="font-bold mb-1 text-charcoal">Easy Setup</h4>
          <p class="text-sm text-gray">Upload menu and start in minutes</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'
import { useQRStore } from '@/stores/qrStore'
import { TEST_MODE } from '@/config'
import { testMenu, testQRData } from '@/utils/testData'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()
const qrStore = useQRStore()

const testMode = TEST_MODE

// Handle QR code URL parameter (e.g., /?qr=test-qr-token-001)
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
      }
    } catch (err) {
      console.error('Failed to load QR code data:', err)
      // If it fails, just stay on landing page
    }
  }
})

const viewDemoMenu = () => {
  // In test mode, load demo menu directly
  if (TEST_MODE) {
    menuStore.setMenu(testMenu)
    qrStore.setQRData(testQRData)
  }
  router.push('/menu/test-menu-001')
}

const goToQRScanner = () => {
  router.push('/qr')
}

const goToOCR = () => {
  router.push('/ocr')
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

