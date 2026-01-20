<template>
  <div class="landing-page">
    <div class="landing-content">
      <!-- Header -->
      <div class="landing-header">
        <h1 class="landing-title">
          QR Menu
        </h1>
        <p class="landing-subtitle">
          Digital Menu System for Cafés & Restaurants
        </p>
      </div>
      
      <!-- Test Mode Banner -->
      <div v-if="testMode" class="test-banner">
        <p class="test-banner-text">
          🧪 Test Mode Active - Using Static Data
        </p>
      </div>
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <!-- View Demo Menu -->
        <button
          @click="viewDemoMenu"
          class="action-card"
        >
          <div class="action-card-content">
            <div class="action-icon">📋</div>
            <div class="action-text">
              <h3 class="action-title">View Demo Menu</h3>
              <p class="action-description">Browse our sample café menu</p>
            </div>
            <span class="action-arrow">→</span>
          </div>
        </button>
        
        <!-- Scan QR Code -->
        <button
          @click="goToQRScanner"
          class="action-card"
        >
          <div class="action-card-content">
            <div class="action-icon">📷</div>
            <div class="action-text">
              <h3 class="action-title">Scan QR Code</h3>
              <p class="action-description">Scan table QR code to view menu</p>
            </div>
            <span class="action-arrow">→</span>
          </div>
        </button>
        
        <!-- Import Menu (OCR) -->
        <button
          @click="goToOCR"
          class="action-card"
        >
          <div class="action-card-content">
            <div class="action-icon">📸</div>
            <div class="action-text">
              <h3 class="action-title">Import Menu</h3>
              <p class="action-description">Upload paper menu for OCR parsing</p>
            </div>
            <span class="action-arrow">→</span>
          </div>
        </button>
        
        <!-- Dashboard -->
        <button
          @click="goToDashboard"
          class="action-card"
        >
          <div class="action-card-content">
            <div class="action-icon">📊</div>
            <div class="action-text">
              <h3 class="action-title">Analytics Dashboard</h3>
              <p class="action-description">View merchant analytics and insights</p>
            </div>
            <span class="action-arrow">→</span>
          </div>
        </button>
      </div>
      
      <!-- Features -->
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <h4 class="feature-title">Fast & Simple</h4>
          <p class="feature-description">Quick menu browsing and ordering</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <h4 class="feature-title">Mobile First</h4>
          <p class="feature-description">Optimized for smartphone use</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <h4 class="feature-title">Easy Setup</h4>
          <p class="feature-description">Upload menu and start in minutes</p>
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

<style scoped>
/* Light Theme - Updated Design Handoff */
.landing-page {
  min-height: 100vh;
  background-color: #F8F8F7;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
}

.landing-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.landing-header {
  text-align: center;
  margin-bottom: 48px;
}

.landing-title {
  font-size: 48px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 16px 0;
}

.landing-subtitle {
  font-size: 18px;
  color: #737373;
  margin: 0;
}

.test-banner {
  max-width: 700px;
  margin: 0 auto 32px;
  background-color: #FFF8E1;
  border: 1px solid #FFE082;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.test-banner-text {
  font-size: 14px;
  font-weight: 500;
  color: #F57C00;
  margin: 0;
}

.quick-actions {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 64px;
}

.action-card {
  width: 100%;
  background-color: #FEFEFE;
  border: 2px solid #E5E5E4;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  transition: all 120ms ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-card:hover {
  border-color: #4A1A28;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  width: 64px;
  height: 64px;
  background-color: rgba(74, 26, 40, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.action-text {
  flex: 1;
}

.action-title {
  font-size: 20px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 4px 0;
}

.action-description {
  font-size: 15px;
  color: #737373;
  margin: 0;
}

.action-arrow {
  font-size: 24px;
  color: #737373;
  flex-shrink: 0;
}

.features-grid {
  max-width: 900px;
  margin: 64px auto 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.feature-item {
  text-align: center;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 4px 0;
}

.feature-description {
  font-size: 14px;
  color: #737373;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .landing-title {
    font-size: 36px;
  }
  
  .landing-subtitle {
    font-size: 16px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>