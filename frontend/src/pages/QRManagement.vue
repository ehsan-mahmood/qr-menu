<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button @click="goToDashboard" class="text-gray-600 hover:text-gray-900">
            <span class="text-2xl">←</span>
          </button>
          <h1 class="text-xl font-bold text-gray-900">QR Management</h1>
          <div class="w-8"></div>
        </div>
      </div>
    </div>
    
    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- Tabs -->
      <div class="mb-6 flex gap-2 border-b border-gray-200">
        <button
          @click="activeTab = 'list'"
          class="px-4 py-2 font-medium transition-colors"
          :class="activeTab === 'list' 
            ? 'text-primary-600 border-b-2 border-primary-600' 
            : 'text-gray-600 hover:text-gray-900'"
        >
          📋 All QR Codes
        </button>
        <button
          @click="activeTab = 'generate'"
          class="px-4 py-2 font-medium transition-colors"
          :class="activeTab === 'generate' 
            ? 'text-primary-600 border-b-2 border-primary-600' 
            : 'text-gray-600 hover:text-gray-900'"
        >
          ➕ Generate New
        </button>
        <button
          @click="activeTab = 'settings'"
          class="px-4 py-2 font-medium transition-colors"
          :class="activeTab === 'settings' 
            ? 'text-primary-600 border-b-2 border-primary-600' 
            : 'text-gray-600 hover:text-gray-900'"
        >
          ⚙️ Domain Settings
        </button>
        <button
          @click="activeTab = 'scan'"
          class="px-4 py-2 font-medium transition-colors"
          :class="activeTab === 'scan' 
            ? 'text-primary-600 border-b-2 border-primary-600' 
            : 'text-gray-600 hover:text-gray-900'"
        >
          📱 Scan QR
        </button>
      </div>

      <!-- QR Codes List Tab -->
      <div v-if="activeTab === 'list'" class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">All QR Codes</h2>
          <button @click="loadQRCodes" class="btn btn-secondary text-sm">
            🔄 Refresh
          </button>
        </div>

        <div v-if="loadingQRCodes" class="card text-center py-8">
          <div class="text-4xl mb-2">⏳</div>
          <p class="text-gray-600">Loading QR codes...</p>
        </div>

        <div v-else-if="allQRCodes.length === 0" class="card text-center py-8">
          <div class="text-4xl mb-2">📭</div>
          <p class="text-gray-600 mb-4">No QR codes found</p>
          <button @click="activeTab = 'generate'" class="btn btn-primary">
            Generate Your First QR Code
          </button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="qr in allQRCodes"
            :key="qr.id"
            class="card"
            :class="qr.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-75'"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">{{ qr.isActive ? '✅' : '⏸️' }}</span>
                  <h3 class="font-semibold text-gray-900">
                    {{ qr.tableLabel || 'Table ' + (allQRCodes.indexOf(qr) + 1) }}
                  </h3>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded"
                    :class="qr.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-200 text-gray-600'"
                  >
                    {{ qr.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {{ qr.qrToken.substring(0, 20) }}...
                    </span>
                  </div>
                  <div>Menu ID: <span class="font-mono">{{ qr.menuId }}</span></div>
                  <div>Created: {{ formatDate(qr.createdAt) }}</div>
                </div>
              </div>
              <div class="flex flex-col gap-2 ml-4">
                <button
                  @click="toggleQRStatus(qr)"
                  class="btn text-sm"
                  :class="qr.isActive ? 'btn-secondary' : 'btn-primary'"
                >
                  {{ qr.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button
                  @click="viewQRCode(qr)"
                  class="btn btn-secondary text-sm"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generate QR Code Tab -->
      <div v-if="activeTab === 'generate'" class="space-y-6">
        <div class="card">
          <h3 class="font-bold text-gray-900 mb-3">🎯 Generate QR Code</h3>
          <p class="text-sm text-gray-600 mb-4">Create a new QR code for a table</p>
          
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Menu ID <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newMenuId"
                type="text"
                placeholder="e.g., test-menu-001"
                class="input"
                required
              />
              <p class="text-xs text-gray-500 mt-1">The menu this QR code will link to</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Table Label <span class="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                v-model="newTableNumber"
                type="text"
                placeholder="e.g., Table 5, Counter, Bar"
                class="input"
              />
              <p class="text-xs text-gray-500 mt-1">Optional label to help identify this QR code in your dashboard</p>
            </div>
            
            <button
              @click="generateQRCode"
              :disabled="generating || !newMenuId"
              class="w-full btn btn-primary disabled:opacity-50"
            >
              <span v-if="generating">Generating...</span>
              <span v-else>Generate QR Code</span>
            </button>
          </div>
          
          <div v-if="generatedQR" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-center mb-4">
              <p class="text-sm text-gray-600 mb-2">Generated Token:</p>
              <p class="font-mono text-sm font-bold text-gray-900 break-all mb-4">
                {{ generatedQR }}
              </p>
              
              <!-- QR Code Image -->
              <div v-if="qrCodeImage" class="flex justify-center mb-4">
                <div class="bg-white p-4 rounded-lg shadow-md">
                  <img :src="qrCodeImage" alt="QR Code" class="w-64 h-64" />
                </div>
              </div>
              
              <!-- Instructions -->
              <div class="text-left bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p class="text-sm font-semibold text-blue-900 mb-2">📱 How to Test:</p>
                <ol class="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Scan this QR code with your phone camera</li>
                  <li>Or copy the URL below and open it in your browser</li>
                  <li>The menu will load automatically</li>
                </ol>
              </div>
              
              <!-- QR Code URL -->
              <div class="p-3 bg-gray-100 rounded-lg">
                <p class="text-xs text-gray-600 mb-1">QR Code URL:</p>
                <a 
                  :href="qrCodeURL" 
                  target="_blank"
                  class="text-sm text-primary-600 hover:text-primary-800 break-all underline block mb-2"
                >
                  {{ qrCodeURL }}
                </a>
                <button
                  @click="copyQRURL"
                  class="text-xs btn btn-secondary py-1 px-2"
                >
                  📋 Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Custom Domain Settings Tab -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <div class="card">
          <h3 class="font-bold text-gray-900 mb-3">⚙️ Custom Domain Settings</h3>
          <p class="text-sm text-gray-600 mb-4">
            Configure a custom domain for your pre-printed QR codes. When customers scan QR codes with your old domain/IP, they will be automatically redirected to your custom domain.
          </p>
          
          <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p class="text-sm font-semibold text-blue-900 mb-2">💡 How It Works:</p>
              <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>You have pre-printed QR codes with old URLs like: <code class="bg-blue-100 px-1 rounded">192.168.20.35:3000/menu/test-menu-002</code></li>
                <li>Set your custom domain below (e.g., <code class="bg-blue-100 px-1 rounded">www.cafemenu.com</code>)</li>
                <li>When someone scans the old QR code, they'll be redirected to: <code class="bg-blue-100 px-1 rounded">www.cafemenu.com/menu/test-menu-002</code></li>
              </ul>
            </div>
            
            <div v-if="TEST_MODE" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p class="text-sm font-semibold text-yellow-900 mb-1">🧪 Test Mode Active</p>
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
              <p class="text-sm font-semibold text-green-900 mb-1">✅ Redirect Example:</p>
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
          <h3 class="font-bold text-green-900 mb-3">✅ Active QR Code</h3>
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
          <h3 class="font-bold text-blue-900 mb-2">📱 How to Use</h3>
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
      successMessage.value = '✅ QR Code scanned successfully! Redirecting to menu...'
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
      successMessage.value = '✅ Custom domain saved successfully! (Test Mode - stored locally)'
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
        successMessage.value = '✅ Custom domain saved successfully!'
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
    
    successMessage.value = '✅ QR Code generated successfully!'
    
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
    successMessage.value = '✅ URL copied to clipboard!'
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

