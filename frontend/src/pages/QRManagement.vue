<template>
  <div class="qr-management-page">
    <!-- Header -->
    <div class="header-bar">
      <div class="header-content">
        <div class="header-top">
          <button @click="goToDashboard" class="back-button" title="Back to Dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h1 class="page-title">QR Management</h1>
          <div class="header-spacer"></div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <!-- Tabs -->
      <div class="tabs-container">
        <button
          @click="activeTab = 'list'"
          class="tab-button"
          :class="{ 'tab-button-active': activeTab === 'list' }"
        >
          All QR Codes
        </button>
        <button
          @click="activeTab = 'generate'"
          class="tab-button"
          :class="{ 'tab-button-active': activeTab === 'generate' }"
        >
          Generate New
        </button>
        <button
          @click="activeTab = 'settings'"
          class="tab-button"
          :class="{ 'tab-button-active': activeTab === 'settings' }"
        >
          Domain Settings
        </button>
        <button
          @click="activeTab = 'scan'"
          class="tab-button"
          :class="{ 'tab-button-active': activeTab === 'scan' }"
        >
          Scan QR
        </button>
      </div>

      <!-- QR Codes List Tab -->
      <div v-if="activeTab === 'list'" class="tab-content">
        <div class="section-header">
          <h2 class="section-title">All QR Codes</h2>
          <button @click="loadQRCodes" class="btn-secondary btn-with-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.5 2v6h-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.5 12a9 9 0 0 1 14.77-7.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.5 22v-6h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21.5 12a9 9 0 0 1-14.77 7.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>

        <div v-if="loadingQRCodes" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="empty-text">Loading QR codes...</p>
        </div>

        <div v-else-if="allQRCodes.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </div>
          <p class="empty-text">No QR codes found</p>
          <button @click="activeTab = 'generate'" class="btn-primary">
            Generate Your First QR Code
          </button>
        </div>

        <div v-else class="qr-codes-list">
          <div
            v-for="qr in allQRCodes"
            :key="qr.id"
            class="qr-code-card"
            :class="qr.isActive ? 'qr-code-card-active' : 'qr-code-card-inactive'"
          >
            <div class="qr-code-content">
              <div class="qr-code-info">
                <div class="qr-code-header">
                  <div class="qr-status-icon">
                    <svg v-if="qr.isActive" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
                      <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
                      <path d="M10 8v8M14 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <h3 class="qr-code-title">
                    {{ qr.tableLabel || 'Table ' + (allQRCodes.indexOf(qr) + 1) }}
                  </h3>
                  <span
                    class="status-badge"
                    :class="qr.isActive ? 'status-badge-active' : 'status-badge-inactive'"
                  >
                    {{ qr.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="qr-code-details">
                  <div class="qr-code-detail-row">
                    <span class="qr-token">{{ qr.qrToken.substring(0, 20) }}...</span>
                  </div>
                  <div class="qr-code-detail-row">Menu ID: <span class="qr-code-value">{{ qr.menuId }}</span></div>
                  <div class="qr-code-detail-row">Created: {{ formatDate(qr.createdAt) }}</div>
                </div>
              </div>
              <div class="qr-code-actions">
                <button
                  @click="toggleQRStatus(qr)"
                  :class="qr.isActive ? 'btn-secondary' : 'btn-primary'"
                >
                  {{ qr.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button
                  @click="viewQRCode(qr)"
                  class="btn-secondary"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generate QR Code Tab -->
      <div v-if="activeTab === 'generate'" class="tab-content">
        <div class="section-card">
          <h3 class="section-title">Generate QR Code</h3>
          <p class="section-description">Create a new QR code for a table</p>
          
          <div class="form-group">
            <div class="form-field">
              <label class="input-label">
                Menu ID <span class="required">*</span>
              </label>
              <input
                v-model="newMenuId"
                type="text"
                placeholder="e.g., test-menu-001"
                class="input-field"
                required
              />
              <p class="input-hint">The menu this QR code will link to</p>
            </div>
            
            <div class="form-field">
              <label class="input-label">
                Table Label <span class="label-optional">(Optional)</span>
              </label>
              <input
                v-model="newTableNumber"
                type="text"
                placeholder="e.g., Table 5, Counter, Bar"
                class="input-field"
              />
              <p class="input-hint">Optional label to help identify this QR code in your dashboard</p>
            </div>
            
            <button
              @click="generateQRCode"
              :disabled="generating || !newMenuId"
              class="btn-primary btn-full"
            >
              <span v-if="generating">Generating...</span>
              <span v-else>Generate QR Code</span>
            </button>
          </div>
          
          <div v-if="generatedQR" class="generated-qr-section">
            <div class="generated-qr-content">
              <p class="generated-qr-label">Generated Token:</p>
              <p class="generated-qr-token">
                {{ generatedQR }}
              </p>
              
              <!-- QR Code Image -->
              <div v-if="qrCodeImage" class="qr-code-image-container">
                <div class="qr-code-image-wrapper">
                  <img :src="qrCodeImage" alt="QR Code" class="qr-code-image" />
                </div>
              </div>
              
              <!-- Instructions -->
              <div class="info-banner info-banner-info">
                <p class="info-banner-title">How to Test</p>
                <ol class="info-banner-list">
                  <li>Scan this QR code with your phone camera</li>
                  <li>Or copy the URL below and open it in your browser</li>
                  <li>The menu will load automatically</li>
                </ol>
              </div>
              
              <!-- QR Code URL -->
              <div class="qr-url-section">
                <p class="qr-url-label">QR Code URL:</p>
                <a 
                  :href="qrCodeURL" 
                  target="_blank"
                  class="qr-url-link"
                >
                  {{ qrCodeURL }}
                </a>
                <button
                  @click="copyQRURL"
                  class="btn-secondary"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Custom Domain Settings Tab -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <div class="card">
          <h3 class="font-bold text-gray-900 mb-3">Custom Domain Settings</h3>
          <p class="text-sm text-gray-600 mb-4">
            Configure a custom domain for your pre-printed QR codes. When customers scan QR codes with your old domain/IP, they will be automatically redirected to your custom domain.
          </p>
          
          <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p class="text-sm font-semibold text-blue-900 mb-2">How It Works</p>
              <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>You have pre-printed QR codes with old URLs like: <code class="bg-blue-100 px-1 rounded">192.168.20.35:3000/menu/test-menu-002</code></li>
                <li>Set your custom domain below (e.g., <code class="bg-blue-100 px-1 rounded">www.cafemenu.com</code>)</li>
                <li>When someone scans the old QR code, they'll be redirected to: <code class="bg-blue-100 px-1 rounded">www.cafemenu.com/menu/test-menu-002</code></li>
              </ul>
            </div>
            
            <div v-if="TEST_MODE" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p class="text-sm font-semibold text-yellow-900 mb-1">Test Mode Active</p>
              <p class="text-xs text-yellow-800">
                In test mode, your custom domain is stored locally. Pre-saved QR codes are supported:
              </p>
              <ul class="text-xs text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                <li><code class="bg-yellow-100 px-1 rounded">{{ currentOrigin }}/menu/test-menu-001</code></li>
                <li><code class="bg-yellow-100 px-1 rounded">{{ currentOrigin }}/menu/test-menu-002</code></li>
                <li><code class="bg-yellow-100 px-1 rounded">{{ currentOrigin }}/menu/test-menu-003</code></li>
              </ul>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Custom Domain
              </label>
              <input
                v-model="customDomain"
                type="text"
                placeholder="e.g., www.cafemenu.com"
                class="input"
              />
              <p class="text-xs text-gray-500 mt-1">
                Enter your custom domain (without http:// or https://). Leave empty to disable redirects.
              </p>
            </div>
            
            <div v-if="customDomain" class="bg-green-50 border border-green-200 rounded-lg p-3">
              <p class="text-sm font-semibold text-green-900 mb-1">Redirect Example</p>
              <p class="text-xs text-green-800 font-mono">
                Old URL: <span class="text-gray-600">192.168.20.35:3000/menu/test-menu-002</span><br>
                Redirects to: <span class="font-bold">{{ customDomain.startsWith('http') ? customDomain : 'https://' + customDomain }}/menu/test-menu-002</span>
              </p>
            </div>
            
            <button
              @click="saveCustomDomain"
              :disabled="savingDomain"
              class="w-full btn btn-primary disabled:opacity-50"
            >
              <span v-if="savingDomain">Saving...</span>
              <span v-else>Save Custom Domain</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Scan QR Tab -->
      <div v-if="activeTab === 'scan'" class="space-y-6">
        <QRScanner
          @scan-success="handleScanSuccess"
          @scan-error="handleScanError"
        />
        
        <!-- Current QR Info -->
        <div v-if="hasQRData" class="card bg-green-50 border border-green-200">
          <h3 class="font-bold text-green-900 mb-3">Active QR Code</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-green-700">Token:</span>
              <span class="font-mono text-green-900">{{ qrToken }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-700">Table:</span>
              <span class="font-semibold text-green-900">{{ tableNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-700">Menu ID:</span>
              <span class="font-mono text-green-900">{{ menuId }}</span>
            </div>
          </div>
          <button @click="viewMenu" class="w-full btn btn-primary mt-4">
            View Menu
          </button>
        </div>
        
        <!-- Instructions -->
        <div class="card bg-blue-50 border border-blue-200">
          <h3 class="font-bold text-blue-900 mb-2">How to Use</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Point your camera at the QR code on your table</li>
            <li>• The menu will load automatically</li>
            <li>• Or enter the QR code manually below the camera</li>
            <li>• In test mode, use token: <code class="bg-blue-100 px-1 rounded">test-qr-token-001</code></li>
          </ul>
        </div>
      </div>
      
      <!-- Success/Error Messages (Global) -->
      <Transition name="fade">
        <div v-if="successMessage" class="mt-4 card bg-green-50 border border-green-200">
          <p class="text-green-800">{{ successMessage }}</p>
        </div>
      </Transition>
      
      <Transition name="fade">
        <div v-if="errorMessage" class="mt-4 card bg-red-50 border border-red-200">
          <p class="text-red-800">{{ errorMessage }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQRStore } from '@/stores/qrStore'
import { useMenuStore } from '@/stores/menuStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import qrService from '@/services/qrService'
import QRScanner from '@/components/QRScanner.vue'
import QRCode from 'qrcode'
import { QR_CODE_DOMAIN, TEST_MODE } from '@/config'

const router = useRouter()
const qrStore = useQRStore()
const menuStore = useMenuStore()
const analyticsStore = useAnalyticsStore()

const activeTab = ref('list')
const successMessage = ref('')
const errorMessage = ref('')
const newTableNumber = ref('')
const newMenuId = ref('test-menu-001')
const generating = ref(false)
const generatedQR = ref('')
const qrCodeImage = ref('')
const allQRCodes = ref([])
const loadingQRCodes = ref(false)
const customDomain = ref('')
const savingDomain = ref(false)

// Get current origin for display (removes protocol) - dynamically detects IP/domain
const currentOrigin = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/^https?:\/\//, '')
  }
  return '192.168.20.35:3000' // Fallback for SSR
})

// Generate QR Code URL - uses configured domain or falls back to current origin
const qrCodeURL = computed(() => {
  if (!generatedQR.value) return ''
  // Use configured domain if set, otherwise use current origin
  const baseUrl = QR_CODE_DOMAIN || window.location.origin
  // URL format: https://yourdomain.com/?qr=TOKEN
  return `${baseUrl}/?qr=${generatedQR.value}`
})

const hasQRData = computed(() => qrStore.hasQRData)
const qrToken = computed(() => qrStore.qrToken)
const tableNumber = computed(() => qrStore.tableNumber)
const menuId = computed(() => qrStore.menuId)

const handleScanSuccess = async (scannedData) => {
  try {
    // Parse the scanned data to extract the token
    // QR code might contain:
    // 1. Just the token: "token-123456"
    // 2. A full URL: "https://example.com/?qr=token-123456"
    // 3. A relative URL: "/?qr=token-123456"
    let qrToken = scannedData.trim()
    
    // If it's a URL, extract the token from the qr query parameter
    try {
      const url = new URL(scannedData, window.location.origin)
      const qrParam = url.searchParams.get('qr')
      if (qrParam) {
        qrToken = qrParam
      }
    } catch (e) {
      // Not a valid URL, assume it's just the token
      // Check if it looks like a URL with ?qr= parameter
      const urlMatch = scannedData.match(/[?&]qr=([^&]+)/)
      if (urlMatch) {
        qrToken = urlMatch[1]
      }
      // Otherwise, use the scanned data as-is (assuming it's the token)
    }
    
    console.log('Scanned QR data:', scannedData, 'Extracted token:', qrToken)
    
    // Fetch QR data using the extracted token
    await qrStore.fetchQRData(qrToken)
    
    // Track scan event
    analyticsStore.postEvent({
      eventType: 'qr_scan',
      qrToken: qrToken,
      timestamp: new Date().toISOString(),
    })
    
    // Fetch menu and config
    if (qrStore.menuId) {
      await menuStore.fetchMenuById(qrStore.menuId)
      await menuStore.fetchMenuConfig(qrStore.menuId)
      
      // Automatically navigate to menu page
      successMessage.value = 'QR Code scanned successfully! Redirecting to menu...'
      errorMessage.value = ''
      
      // Small delay to show success message, then navigate
      setTimeout(() => {
        router.push(`/menu/${qrStore.menuId}`)
      }, 500)
    } else {
      errorMessage.value = 'QR code found but no menu ID associated. Please check the QR code configuration.'
      successMessage.value = ''
    }
  } catch (err) {
    console.error('QR scan error:', err)
    errorMessage.value = err.response?.data?.message || 'Failed to load QR data. Please try again.'
    successMessage.value = ''
  }
}

const handleScanError = (error) => {
  errorMessage.value = error
  successMessage.value = ''
}

// Custom domain management
const loadCustomDomain = async () => {
  if (TEST_MODE) {
    // In test mode, load from localStorage
    customDomain.value = localStorage.getItem('customDomain') || ''
  } else {
    // In production mode, load from backend
    try {
      const response = await fetch('/api/merchants/custom-domain', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        customDomain.value = data.data?.customDomain || ''
      }
    } catch (err) {
      console.error('Failed to load custom domain:', err)
    }
  }
}

const saveCustomDomain = async () => {
  savingDomain.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    if (TEST_MODE) {
      // In test mode, save to localStorage
      if (customDomain.value.trim()) {
        localStorage.setItem('customDomain', customDomain.value.trim())
      } else {
        localStorage.removeItem('customDomain')
      }
      successMessage.value = 'Custom domain saved successfully! (Test Mode - stored locally)'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      // In production mode, save to backend
      const response = await fetch('/api/merchants/custom-domain', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          customDomain: customDomain.value.trim() || null
        })
      })
      
      if (response.ok) {
        successMessage.value = 'Custom domain saved successfully!'
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        const data = await response.json()
        errorMessage.value = data.error || 'Failed to save custom domain'
      }
    }
  } catch (err) {
    console.error('Failed to save custom domain:', err)
    errorMessage.value = 'Failed to save custom domain. Please try again.'
  } finally {
    savingDomain.value = false
  }
}

const viewMenu = () => {
  if (menuId.value) {
    router.push(`/menu/${menuId.value}`)
  }
}

const generateQRCode = async () => {
  if (!newMenuId.value) {
    errorMessage.value = 'Please enter a Menu ID'
    return
  }
  
  generating.value = true
  errorMessage.value = ''
  successMessage.value = ''
  qrCodeImage.value = ''
  
  try {
    const response = await qrService.createQRCode({
      tableNumber: newTableNumber.value,
      menuId: newMenuId.value,
      merchantId: 'merchant-001',
    })
    
    const token = response.data.qrCode?.qrToken || response.data.receivingId
    generatedQR.value = token
    
    // Generate QR code image using the URL with token
    const baseUrl = QR_CODE_DOMAIN || window.location.origin
    const url = `${baseUrl}/?qr=${token}`
    const qrImage = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    qrCodeImage.value = qrImage
    
    successMessage.value = 'QR Code generated successfully!'
    
    // Reload QR codes list
    await loadQRCodes()
    
    // Clear form (but keep generated QR visible)
    // newTableNumber.value = ''
  } catch (err) {
    console.error('Failed to generate QR code:', err)
    errorMessage.value = 'Failed to generate QR code. Please try again.'
  } finally {
    generating.value = false
  }
}

const copyQRURL = async () => {
  try {
    await navigator.clipboard.writeText(qrCodeURL.value)
    successMessage.value = 'URL copied to clipboard!'
    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('Failed to copy URL:', err)
    errorMessage.value = 'Failed to copy URL. Please copy manually.'
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const loadQRCodes = async () => {
  loadingQRCodes.value = true
  errorMessage.value = ''
  
  try {
    const response = await qrService.getMerchantQRCodes('merchant-001')
    allQRCodes.value = response.data || []
  } catch (err) {
    console.error('Failed to load QR codes:', err)
    errorMessage.value = 'Failed to load QR codes. Please try again.'
  } finally {
    loadingQRCodes.value = false
  }
}

const toggleQRStatus = async (qr) => {
  try {
    await qrService.updateQRStatus(qr.id, !qr.isActive)
    qr.isActive = !qr.isActive
    successMessage.value = `QR code ${qr.isActive ? 'activated' : 'deactivated'} successfully!`
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err) {
    console.error('Failed to update QR status:', err)
    errorMessage.value = 'Failed to update QR code status. Please try again.'
  }
}


const viewQRCode = (qr) => {
  if (qr.menuId) {
    router.push(`/menu/${qr.menuId}`)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Load QR codes and custom domain on mount
loadQRCodes()
loadCustomDomain()
</script>

<style scoped>
/* Dashboard UI Guidelines - Phase 1 Design System */
.qr-management-page {
  min-height: 100vh;
  background-color: #FAFAF8; /* canvas-100 */
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0b0706;
}

/* Header */
.header-bar {
  background-color: #FAFAF8; /* canvas-100 */
  border-bottom: 1px solid #ECEAE5; /* canvas-300 */
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1440px; /* Grid max width */
  margin: 0 auto;
  padding: 24px; /* Content padding */
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  background: none;
  border: none;
  color: #0b0706;
  cursor: pointer;
  padding: 8px;
  transition: all 150ms ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.back-button svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  fill: none;
}

.back-button:hover {
  opacity: 0.7;
}

.page-title {
  font-size: 24px; /* Page Title */
  font-weight: 600;
  line-height: 1.3;
  color: #0b0706;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.header-spacer {
  width: 40px;
}

/* Content */
.content {
  max-width: 1440px; /* Grid max width */
  margin: 0 auto;
  padding: 24px; /* Content padding */
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 8px; /* icon/text spacing */
  border-bottom: 1px solid #ECEAE5; /* canvas-300 */
  margin-bottom: 24px; /* section spacing */
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab-button {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 16px; /* internal card padding */
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  color: #6B7280; /* Neutral gray */
  cursor: pointer;
  transition: all 150ms ease-out;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
}

.tab-button:hover {
  color: #0b0706;
}

.tab-button-active {
  color: #8A1222; /* burgundy-700 - Active navigation state */
  border-bottom-color: #8A1222;
}

/* Tab Content */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0;
}

.section-description {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280; /* Neutral gray */
  margin: 0 0 16px 0; /* internal card padding */
}

/* Section Card */
.section-card {
  background-color: #FFFFFF; /* surface-white - Cards */
  border: none;
  border-radius: 16px; /* Card border radius */
  padding: 24px; /* section spacing (max card padding) */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 16px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px; /* internal card padding */
  color: #6B7280; /* Neutral gray */
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  fill: none;
}

.empty-text {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280; /* Neutral gray */
  margin: 0 0 16px 0; /* internal card padding */
}

/* QR Codes List */
.qr-codes-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* internal card padding */
}

.qr-code-card {
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 16px; /* Card border radius */
  padding: 16px; /* internal card padding (min) */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
}

.qr-code-card-active {
  border-color: #3FA34D; /* Calm Green - Ready */
  background-color: rgba(63, 163, 77, 0.05);
}

.qr-code-card-inactive {
  opacity: 0.75;
}

.qr-code-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.qr-code-info {
  flex: 1;
}

.qr-code-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.qr-status-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6B7280; /* Neutral gray */
}

.qr-status-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  fill: none;
}

.qr-code-card-active .qr-status-icon {
  color: #3FA34D; /* Calm Green */
}

.qr-code-card-inactive .qr-status-icon {
  color: #9CA3AF; /* Muted Gray */
}

.qr-code-title {
  font-size: 16px;
  font-weight: 600;
  color: #0b0706;
  margin: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge-active {
  background-color: rgba(63, 163, 77, 0.15); /* Calm Green */
  color: #3FA34D;
}

.status-badge-inactive {
  background-color: rgba(156, 163, 175, 0.15); /* Muted Gray */
  color: #9CA3AF;
}

.qr-code-details {
  display: flex;
  flex-direction: column;
  gap: 4px; /* micro spacing */
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
}

.qr-code-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr-token {
  font-family: monospace;
  font-size: 12px; /* Metadata */
  background-color: #F4F3EF; /* canvas-200 */
  padding: 4px 8px; /* micro spacing, horizontal padding */
  border-radius: 6px;
  color: #0b0706;
}

.qr-code-value {
  font-family: monospace;
  color: #0b0706;
}

.qr-code-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Buttons */
.btn-primary {
  background-color: #6E0D1C; /* burgundy-800 - Primary CTAs */
  color: #FFFFFF;
  border: none;
  border-radius: 12px; /* Button radius */
  padding: 0 24px; /* horizontal padding */
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px; /* Button height */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none; /* No gradients */
}

.btn-primary:hover:not(:disabled) {
  background-color: #5C071A; /* burgundy-900 - darker shade on hover */
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #FFFFFF; /* Secondary button */
  color: #8A1222; /* burgundy-700 */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 12px; /* Button radius */
  padding: 0 24px;
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px; /* Button height */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  background-color: #F4F3EF; /* canvas-200 */
  border-color: #8A1222; /* burgundy-700 */
}

.btn-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 8px; /* icon/text spacing */
}

.btn-with-icon svg {
  flex-shrink: 0;
  stroke: currentColor;
  fill: none;
}

.btn-full {
  width: 100%;
}

/* Form Fields */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: block;
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
  margin-bottom: 8px; /* icon/text spacing */
}

.required {
  color: #5C071A; /* burgundy-900 - Critical alerts */
}

.label-optional {
  color: #737373;
  font-size: 12px;
  font-weight: 400;
}

.input-field {
  width: 100%;
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 8px;
  padding: 12px 16px; /* internal card padding */
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0b0706;
  min-height: 44px; /* Match button height */
  transition: all 150ms ease-out;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #8A1222; /* burgundy-700 */
  box-shadow: 0 0 0 3px rgba(138, 18, 34, 0.1);
}

.input-field::placeholder {
  color: #6B7280; /* Neutral gray */
}

.input-hint {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
  margin: 0;
}

/* Generated QR Section */
.generated-qr-section {
  margin-top: 16px; /* internal card padding */
  padding: 16px; /* internal card padding */
  background-color: #F4F3EF; /* canvas-200 */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 12px;
}

.generated-qr-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.generated-qr-label {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280; /* Neutral gray */
  margin: 0;
  text-align: center;
}

.generated-qr-token {
  font-family: monospace;
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
  margin: 0;
  text-align: center;
  word-break: break-all;
}

.qr-code-image-container {
  display: flex;
  justify-content: center;
}

.qr-code-image-wrapper {
  background-color: #FFFFFF; /* surface-white */
  padding: 16px; /* internal card padding */
  border-radius: 12px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
}

.qr-code-image {
  width: 256px;
  height: 256px;
  display: block;
}

/* Info Banner */
.info-banner {
  border-radius: 8px;
  padding: 12px 16px;
  text-align: left;
}

.info-banner-info {
  background-color: #E3F2FD;
  border: 1px solid #90CAF9;
}

.info-banner-title {
  font-size: 14px;
  font-weight: 600;
  color: #1976D2;
  margin: 0 0 8px 0;
}

.info-banner-list {
  font-size: 13px;
  color: #1565C0;
  margin: 0;
  padding-left: 20px;
}

.info-banner-list li {
  margin: 4px 0;
}

/* QR URL Section */
.qr-url-section {
  padding: 12px;
  background-color: #F4F3EF; /* canvas-200 */
  border-radius: 8px;
}

.qr-url-label {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
  margin: 0 0 8px 0; /* icon/text spacing */
}

.qr-url-link {
  font-size: 14px; /* Body Text */
  color: #8A1222; /* burgundy-700 */
  text-decoration: underline;
  word-break: break-all;
  display: block;
  margin-bottom: 12px;
  transition: all 150ms ease-out;
}

.qr-url-link:hover {
  opacity: 0.7;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .qr-code-content {
    flex-direction: column;
  }
  
  .qr-code-actions {
    width: 100%;
  }
  
  .qr-code-actions .btn-primary,
  .qr-code-actions .btn-secondary {
    width: 100%;
  }
}
</style>

