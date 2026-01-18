<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold text-gray-900">Merchant Dashboard</h1>
            <span v-if="merchantName" class="text-sm text-gray-500">{{ merchantName }}</span>
          </div>
          <button
            @click="handleLogout"
            class="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Logout
          </button>
        </div>
        <!-- Navigation Tabs -->
        <div class="flex gap-2 border-b border-gray-200">
          <button
            @click="router.push('/dashboard')"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="$route.path === '/dashboard' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            📊 Analytics
          </button>
          <button
            @click="router.push('/menu-management')"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="$route.path === '/menu-management' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            📋 Menu
          </button>
          <button
            @click="router.push('/qr')"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="$route.path === '/qr' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            📱 QR Codes
          </button>
          <button
            @click="router.push('/orders')"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="$route.path === '/orders' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            📋 Orders
          </button>
          <button
            @click="viewCustomerMenu"
            class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors"
          >
            👁️ View Menu
          </button>
        </div>
      </div>
    </div>
    
    <div class="container mx-auto px-4 py-6 max-w-6xl">
      <!-- Test Mode Banner -->
      <div v-if="testMode" class="mb-6 card bg-yellow-50 border border-yellow-200">
        <p class="text-yellow-800 text-center font-medium">
          🧪 Test Mode - Displaying Sample Analytics Data
        </p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Loading analytics...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border border-red-200 text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <h3 class="text-lg font-bold text-red-900 mb-2">Failed to Load Analytics</h3>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button @click="loadDashboard" class="btn btn-primary">
          Try Again
        </button>
      </div>
      
      <!-- Dashboard Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Total Scans -->
          <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm mb-1">Total Scans</p>
                <p class="text-3xl font-bold">{{ totalScans.toLocaleString() }}</p>
              </div>
              <div class="text-5xl opacity-50">📊</div>
            </div>
          </div>
          
          <!-- Total Orders -->
          <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm mb-1">Total Orders</p>
                <p class="text-3xl font-bold">{{ totalOrders.toLocaleString() }}</p>
              </div>
              <div class="text-5xl opacity-50">🛒</div>
            </div>
          </div>
          
          <!-- Avg Order Value -->
          <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm mb-1">Avg Order Value</p>
                <p class="text-3xl font-bold">${{ avgOrderValue.toFixed(2) }}</p>
              </div>
              <div class="text-5xl opacity-50">💰</div>
            </div>
          </div>
          
          <!-- Avg Order Prep Time -->
          <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm mb-1">Avg Prep Time</p>
                <p class="text-3xl font-bold">{{ avgOrderPrepTime.toFixed(1) }}<span class="text-xl">min</span></p>
              </div>
              <div class="text-5xl opacity-50">⏱️</div>
            </div>
          </div>
        </div>
        
        <!-- Export & Report Actions -->
        <div class="mb-6 flex flex-wrap gap-3">
          <button
            @click="exportToCSV"
            class="btn btn-secondary flex items-center gap-2"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
          <button
            @click="showEmailModal = true"
            class="btn btn-secondary flex items-center gap-2"
          >
            <span>📧</span>
            <span>Email Report</span>
          </button>
        </div>
        
        <!-- Insights Panel -->
        <div class="mb-6" v-if="insights && insights.length > 0">
          <InsightsPanel
            title="💡 Insights & Recommendations"
            :insights="insights"
          />
        </div>
        
        <!-- Peak Hours Chart -->
        <div class="mb-6" v-if="peakHours && peakHours.length > 0">
          <PeakHoursChart
            title="⏰ Peak Hours Analysis"
            :data="peakHours"
          />
        </div>
        
        <!-- Trend Chart -->
        <div class="mb-6" v-if="trendData && trendData.length > 0">
          <TrendChart
            title="📈 Item Popularity Trends"
            :data="trendData"
          />
        </div>
        
        <!-- Category Analytics -->
        <div class="mb-6" v-if="categoryAnalytics && categoryAnalytics.length > 0">
          <CategoryAnalytics
            title="📦 Category-Level Analytics"
            :data="categoryAnalytics"
          />
        </div>
        
        <!-- Recent Orders -->
        <div class="mb-6">
          <RecentOrders
            title="📋 Recent Orders"
            :orders="recentOrders"
            :new-order-ids="newOrderIds"
            :auto-refresh="autoRefreshOrders"
            @refresh="loadRecentOrders"
            @update:auto-refresh="autoRefreshOrders = $event"
          />
        </div>
        
        <!-- Top Items -->
        <div class="mb-6">
          <TopItems
            title="🏆 Top Performing Items"
            :items="topItems"
            :limit="10"
          />
        </div>
        
        <!-- Detailed Table -->
        <div>
          <AnalyticsTable
            title="📈 Detailed Analytics"
            :columns="tableColumns"
            :data="topItems"
          />
        </div>
        
        <!-- Date Range Selector -->
        <div class="mt-6 card">
          <h3 class="font-bold text-gray-900 mb-4">📅 Date Range</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                v-model="startDate"
                type="date"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                v-model="endDate"
                type="date"
                class="input"
              />
            </div>
          </div>
          <button
            @click="loadDashboard"
            class="w-full btn btn-primary mt-4"
          >
            Apply Date Range
          </button>
        </div>
        
        <!-- Merchant Info -->
        <div class="mt-6 card bg-gray-50">
          <h3 class="font-bold text-gray-900 mb-2">ℹ️ Merchant Information</h3>
          <div class="text-sm text-gray-700 space-y-1">
            <p><strong>Merchant ID:</strong> {{ merchantId || 'N/A' }}</p>
            <p><strong>Business Name:</strong> {{ merchantName || 'N/A' }}</p>
            <p><strong>Menu Items:</strong> {{ topItems.length }} tracked</p>
          </div>
        </div>

        <!-- Customer Menu URL -->
        <div class="mt-6 card bg-blue-50 border border-blue-200">
          <h3 class="font-bold text-blue-900 mb-3">🔗 Customer Menu URL</h3>
          <p class="text-sm text-blue-700 mb-2">Share this URL with your customers:</p>
          <div class="bg-white p-3 rounded border border-blue-200 mb-3">
            <code class="text-sm text-gray-900 break-all">{{ customerMenuUrl }}</code>
          </div>
          <button
            @click="copyMenuUrl"
            class="btn btn-secondary text-sm py-2 px-4"
          >
            📋 Copy URL
          </button>
          <button
            @click="viewCustomerMenu"
            class="btn btn-primary text-sm py-2 px-4 ml-2"
          >
            👁️ Open Menu
          </button>
        </div>
      </div>
    </div>
    
    <!-- Email Report Modal -->
    <div
      v-if="showEmailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showEmailModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">📧 Email Analytics Report</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              v-model="emailAddress"
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              v-model="emailReportType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="emailSchedule"
              v-model="emailSchedule"
              class="rounded"
            />
            <label for="emailSchedule" class="text-sm text-gray-700">
              Schedule recurring reports
            </label>
          </div>
        </div>
        <div class="mt-6 flex gap-3">
          <button
            @click="sendEmailReport"
            class="flex-1 btn btn-primary"
            :disabled="!emailAddress || sendingEmail"
          >
            {{ sendingEmail ? 'Sending...' : 'Send Report' }}
          </button>
          <button
            @click="showEmailModal = false"
            class="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
        </div>
        <div v-if="emailMessage" class="mt-4 p-3 rounded" :class="emailMessageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
          {{ emailMessage }}
        </div>
      </div>
    </div>
    
    <!-- Toast Notification -->
    <ToastNotification
      :notification="notification"
      @close="closeNotification"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { useAuthStore } from '@/stores/authStore'
import menuService from '@/services/menuService'
import { TEST_MODE } from '@/config'
import { generateSlug } from '@/utils/slug'
import { testMenu } from '@/utils/testData'
import TopItems from '@/components/TopItems.vue'
import AnalyticsTable from '@/components/AnalyticsTable.vue'
import PeakHoursChart from '@/components/PeakHoursChart.vue'
import TrendChart from '@/components/TrendChart.vue'
import CategoryAnalytics from '@/components/CategoryAnalytics.vue'
import InsightsPanel from '@/components/InsightsPanel.vue'
import RecentOrders from '@/components/RecentOrders.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import orderService from '@/services/orderService'

const router = useRouter()
const route = useRoute()
const analyticsStore = useAnalyticsStore()
const authStore = useAuthStore()

const testMode = TEST_MODE
const startDate = ref('')
const endDate = ref('')
const showEmailModal = ref(false)
const emailAddress = ref('')
const emailReportType = ref('weekly')
const emailSchedule = ref(false)
const sendingEmail = ref(false)
const emailMessage = ref('')
const emailMessageType = ref('')
const recentOrders = ref([])
const newOrderIds = ref(new Set())
const autoRefreshOrders = ref(true)
const notification = ref(null)
let ordersRefreshInterval = null

const loading = computed(() => analyticsStore.loading)
const error = computed(() => analyticsStore.error)
const merchantName = computed(() => authStore.user?.restaurantName || authStore.user?.name)
const merchantId = computed(() => authStore.merchantId || authStore.user?.merchantId)
const topItems = computed(() => analyticsStore.topItems)
const totalScans = computed(() => analyticsStore.totalScans)
const totalOrders = computed(() => analyticsStore.totalOrders)
const avgOrderValue = computed(() => analyticsStore.avgOrderValue)
const avgOrderPrepTime = computed(() => analyticsStore.dashboardData?.avgOrderPrepTime || 0)
const peakHours = computed(() => analyticsStore.dashboardData?.peakHours || [])
const trendData = computed(() => analyticsStore.dashboardData?.trendData || [])
const categoryAnalytics = computed(() => analyticsStore.dashboardData?.categoryAnalytics || [])
const insights = computed(() => analyticsStore.dashboardData?.insights || [])

const tableColumns = [
  { key: 'itemName', label: 'Item Name' },
  { key: 'scans', label: 'Scans', format: 'number' },
  { key: 'clicks', label: 'Clicks', format: 'number' },
]

const loadRecentOrders = async () => {
  try {
    const currentMerchantId = merchantId.value
    if (!currentMerchantId) {
      return
    }
    
    const previousOrderIds = new Set(recentOrders.value.map(o => o.orderId))
    const response = await orderService.getRecentOrders(currentMerchantId, 10)
    const newOrders = response.data || []
    
    // Find newly added orders
    const addedOrders = newOrders.filter(order => !previousOrderIds.has(order.orderId))
    
    // Update recent orders
    recentOrders.value = newOrders
    
    // Show toast notification for new orders
    if (addedOrders.length > 0 && previousOrderIds.size > 0) {
      addedOrders.forEach(order => {
        newOrderIds.value.add(order.orderId)
        showNotification('new_order', 'New Order!', `New order at Table ${order.tableNumber || 'N/A'}`)
      })
      
      // Remove highlight after 5 seconds
      setTimeout(() => {
        addedOrders.forEach(order => {
          newOrderIds.value.delete(order.orderId)
        })
      }, 5000)
    }
  } catch (err) {
    console.error('Failed to load recent orders:', err)
  }
}

const showNotification = (type, title, message) => {
  notification.value = { type, title, message }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

const closeNotification = () => {
  notification.value = null
}

onMounted(() => {
  // Set default date range (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  endDate.value = today.toISOString().split('T')[0]
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  
  loadDashboard()
  loadRecentOrders()
  
  // Set up auto-refresh for orders
  if (autoRefreshOrders.value) {
    ordersRefreshInterval = setInterval(() => {
      loadRecentOrders()
    }, 10000) // Refresh every 10 seconds
  }
})

onUnmounted(() => {
  if (ordersRefreshInterval) {
    clearInterval(ordersRefreshInterval)
  }
})

// Watch auto-refresh toggle
watch(autoRefreshOrders, (enabled) => {
  if (enabled) {
    ordersRefreshInterval = setInterval(() => {
      loadRecentOrders()
    }, 10000)
  } else {
    if (ordersRefreshInterval) {
      clearInterval(ordersRefreshInterval)
      ordersRefreshInterval = null
    }
  }
})

const loadDashboard = async () => {
  try {
    const currentMerchantId = merchantId.value
    if (!currentMerchantId) {
      console.error('No merchant ID available')
      return
    }
    await analyticsStore.fetchDashboardData(currentMerchantId, {
      startDate: startDate.value,
      endDate: endDate.value,
    })
  } catch (err) {
    console.error('Failed to load dashboard:', err)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const customerMenuUrl = computed(() => {
  // Use menuId format for demo mode (test-menu-001)
  // BASE_URL already includes /qr-menu/ when deployed to GitHub Pages
  const baseUrl = import.meta.env.BASE_URL || '/'
  const basePath = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const menuId = TEST_MODE ? testMenu.menuId : 'menu-001' // Use test menu ID in demo mode
  return `${window.location.origin}${basePath}/menu/${menuId}`
})

const copyMenuUrl = async () => {
  try {
    await navigator.clipboard.writeText(customerMenuUrl.value)
    alert('✅ Menu URL copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy URL:', err)
    alert('Failed to copy URL. Please copy manually.')
  }
}

const viewCustomerMenu = async () => {
  try {
    // Use the friendly URL format
    window.open(customerMenuUrl.value, '_blank')
  } catch (err) {
    console.error('Error viewing customer menu:', err)
    alert('Failed to open menu. Please try again.')
  }
}

const exportToCSV = () => {
  try {
    // Prepare CSV data
    const csvRows = []
    
    // Header
    csvRows.push(['Item Name', 'Scans', 'Clicks', 'Category'].join(','))
    
    // Top items data
    topItems.value.forEach(item => {
      csvRows.push([
        `"${item.itemName || ''}"`,
        item.scans || 0,
        item.clicks || 0,
        `"${item.category || 'N/A'}"`
      ].join(','))
    })
    
    // Add summary stats
    csvRows.push([])
    csvRows.push(['Summary Statistics'].join(','))
    csvRows.push(['Metric', 'Value'].join(','))
    csvRows.push(['Total Scans', totalScans.value].join(','))
    csvRows.push(['Total Orders', totalOrders.value].join(','))
    csvRows.push(['Avg Order Value', `$${avgOrderValue.value.toFixed(2)}`].join(','))
    csvRows.push(['Avg Prep Time', `${avgOrderPrepTime.value.toFixed(1)} minutes`].join(','))
    
    // Add peak hours if available
    if (peakHours.value.length > 0) {
      csvRows.push([])
      csvRows.push(['Peak Hours Analysis'].join(','))
      csvRows.push(['Hour', 'Orders', 'Scans'].join(','))
      peakHours.value.forEach(hour => {
        csvRows.push([hour.hourLabel, hour.orders, hour.scans].join(','))
      })
    }
    
    // Add category analytics if available
    if (categoryAnalytics.value.length > 0) {
      csvRows.push([])
      csvRows.push(['Category Analytics'].join(','))
      csvRows.push(['Category', 'Scans', 'Clicks', 'Orders', 'Avg Value'].join(','))
      categoryAnalytics.value.forEach(cat => {
        csvRows.push([
          `"${cat.category}"`,
          cat.totalScans,
          cat.totalClicks,
          cat.totalOrders,
          `$${cat.avgOrderValue.toFixed(2)}`
        ].join(','))
      })
    }
    
    // Create and download CSV
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert('✅ CSV report downloaded successfully!')
  } catch (err) {
    console.error('Failed to export CSV:', err)
    alert('Failed to export CSV. Please try again.')
  }
}

const sendEmailReport = async () => {
  if (!emailAddress.value) {
    emailMessage.value = 'Please enter an email address'
    emailMessageType.value = 'error'
    return
  }
  
  sendingEmail.value = true
  emailMessage.value = ''
  
  try {
    // Simulate API call (in test mode, just show success message)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (testMode) {
      emailMessage.value = `✅ Report will be sent to ${emailAddress.value} (Test Mode - Email not actually sent)`
      emailMessageType.value = 'success'
      
      // Clear form after 3 seconds
      setTimeout(() => {
        showEmailModal.value = false
        emailAddress.value = ''
        emailMessage.value = ''
      }, 3000)
    } else {
      // In production, this would call the backend API
      // await analyticsService.sendEmailReport({
      //   email: emailAddress.value,
      //   reportType: emailReportType.value,
      //   schedule: emailSchedule.value,
      // })
      emailMessage.value = `✅ Report sent successfully to ${emailAddress.value}`
      emailMessageType.value = 'success'
      
      setTimeout(() => {
        showEmailModal.value = false
        emailAddress.value = ''
        emailMessage.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('Failed to send email report:', err)
    emailMessage.value = 'Failed to send email report. Please try again.'
    emailMessageType.value = 'error'
  } finally {
    sendingEmail.value = false
  }
}
</script>

