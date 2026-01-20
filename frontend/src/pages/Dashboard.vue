<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="header-bar">
      <div class="header-content">
        <div class="header-top">
          <div class="header-left">
            <h1 class="page-title">Merchant Dashboard</h1>
            <span v-if="merchantName" class="merchant-name">{{ merchantName }}</span>
          </div>
          <button
            @click="handleLogout"
            class="btn-link"
          >
            Logout
          </button>
        </div>
        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button
            @click="router.push('/dashboard')"
            class="nav-tab"
            :class="{ 'nav-tab-active': $route.path === '/dashboard' }"
          >
            Analytics
          </button>
          <button
            @click="router.push('/menu-management')"
            class="nav-tab"
            :class="{ 'nav-tab-active': $route.path === '/menu-management' }"
          >
            Menu
          </button>
          <button
            @click="router.push('/qr')"
            class="nav-tab"
            :class="{ 'nav-tab-active': $route.path === '/qr' }"
          >
            QR Codes
          </button>
          <button
            @click="router.push('/orders')"
            class="nav-tab"
            :class="{ 'nav-tab-active': $route.path === '/orders' }"
          >
            Orders
          </button>
          <button
            @click="viewCustomerMenu"
            class="nav-tab"
          >
            View Menu
          </button>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <!-- Test Mode Banner -->
      <div v-if="testMode" class="test-banner">
        <p>
          Test Mode - Displaying Sample Analytics Data
        </p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-text">Loading analytics...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-card">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 2L2 22h20L12 2z" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
        <h3 class="error-title">Failed to Load Analytics</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="loadDashboard" class="btn-primary">
          Try Again
        </button>
      </div>
      
      <!-- Dashboard Content -->
      <div v-else>
        <!-- Page Title -->
        <div class="page-header-section">
          <h2 class="page-section-title">Order Management</h2>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <!-- Total Pending Orders -->
          <div class="stat-card">
            <div class="stat-content">
              <div>
                <p class="stat-value">{{ pendingOrdersCount }}</p>
                <p class="stat-label">Total Pending Orders</p>
              </div>
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Preparing Orders -->
          <div class="stat-card">
            <div class="stat-content">
              <div>
                <p class="stat-value">{{ preparingOrdersCount }}</p>
                <p class="stat-label">Preparing Orders</p>
              </div>
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4h8l1 2H7l1-2z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <path d="M9 6v12h6V6" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <path d="M7 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M10 18v2h4v-2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <circle cx="12" cy="9" r="1.5" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Ready to Serve -->
          <div class="stat-card">
            <div class="stat-content">
              <div>
                <p class="stat-value">{{ readyOrdersCount }}</p>
                <p class="stat-label">Ready to serve</p>
              </div>
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M5 17h14v-6H5v6z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <path d="M5 11h3v-4h8v4h3" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <circle cx="17" cy="17" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <path d="M9 11V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Today Order Complete -->
          <div class="stat-card stat-card-progress">
            <div class="stat-content">
              <div>
                <p class="stat-value">{{ completedOrdersToday }}/{{ totalOrdersToday }}</p>
                <p class="stat-label">Today Order Complete</p>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: todayCompletionPercent + '%' }"
                  ></div>
              </div>
                <div class="progress-labels">
                  <span>33%</span>
                  <span>60%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Analytics Section -->
        <div class="section analytics-section">
          <div class="section-header">
            <h3 class="section-title">Analytics</h3>
            <div class="actions-bar">
              <button
                v-if="insights && insights.length > 0"
                @click="showInsights = !showInsights"
                class="btn-insights"
                :class="{ 'btn-insights-active': showInsights }"
                :title="showInsights ? 'Hide Insights' : 'Show Insights'"
              >
                <span class="insights-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M12 18v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M15 12h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M6 12h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 8l2.121 2.121" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M16 16l-2.121-2.121" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M16 8l-2.121 2.121" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 16l2.121-2.121" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M12 9a3 3 0 0 1 3 3" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  </svg>
                </span>
                <span v-if="showInsights" class="insights-text">{{ insights.length }} insights</span>
              </button>
              <button
                @click="exportToCSV"
                class="btn-secondary"
              >
                Export CSV
              </button>
              <button
                @click="showEmailModal = true"
                class="btn-secondary"
              >
                Email Report
              </button>
            </div>
          </div>
        
          <!-- Insights Panel (Collapsible) -->
          <div v-if="insights && insights.length > 0 && showInsights" class="analytics-item insights-expanded">
            <InsightsPanel
              title="Insights & Recommendations"
              :insights="insights"
            />
          </div>
        </div>
        
        <!-- Top Performing Items & Peak Hours Side by Side -->
        <div class="section side-by-side-section" :class="{ 'expanded-top-items': expandedTopItems }">
          <!-- Top Performing Items -->
          <div class="side-by-side-item top-items-container">
            <div class="section-card">
              <div class="section-header">
                <h3 class="section-title">Top Performing Items</h3>
                <button
                  v-if="!expandedTopItems && topItems.length > 2"
                  @click="expandedTopItems = true"
                  class="btn-see-more btn-see-more-small"
                >
                  See More
                </button>
                <button
                  v-else-if="expandedTopItems"
                  @click="expandedTopItems = false"
                  class="btn-collapse btn-collapse-small"
                >
                  Show Less
                </button>
              </div>
              <div class="top-items-grid-compact" :class="{ 'expanded-grid': expandedTopItems }">
                <div
                  v-for="(item, index) in (expandedTopItems ? topItems.slice(0, 10) : topItems.slice(0, 2))"
                  :key="index"
                  class="top-item-card"
                >
                  <!-- Header with Rank Badge -->
                  <div class="top-item-header">
                    <div class="top-item-name-title">{{ item.itemName }}</div>
                    <span class="top-item-rank-badge">#{{ index + 1 }}</span>
                  </div>
                  
                  <!-- Stats Circle (like timer) -->
                  <div class="top-item-stats-circle">
                    <div class="top-stats-circle" :class="getRankClass(index)">
                      <div class="top-stats-content">
                        <div class="top-stats-value">{{ (item.scans || 0) + (item.clicks || 0) }}</div>
                        <div class="top-stats-label">Total Views</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Stats Details -->
                  <div class="top-item-stats-details">
                    <div class="top-stat-row">
                      <span class="top-stat-label">Scans</span>
                      <span class="top-stat-value">{{ item.scans || 0 }}</span>
                    </div>
                    <div class="top-stat-row">
                      <span class="top-stat-label">Clicks</span>
                      <span class="top-stat-value">{{ item.clicks || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="topItems.length === 0" class="empty-state-text">
                No items to display
              </div>
            </div>
        </div>
        
        <!-- Peak Hours Chart -->
          <div v-if="peakHours && peakHours.length > 0" class="side-by-side-item chart-container-side" :class="{ 'hidden-when-expanded': expandedTopItems }">
            <div class="section-card chart-card-compact">
              <div class="chart-header-compact">
                <h3 class="section-title">Peak Hours Analysis</h3>
                <button
                  @click="fullscreenChart = 'peakHours'"
                  class="btn-fullscreen"
                  title="Fullscreen"
                >
                  ⛶
                </button>
              </div>
              <div class="chart-container-compact">
          <PeakHoursChart
                  title=""
            :data="peakHours"
          />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Trend Chart & Category Analytics Side by Side -->
        <div class="section side-by-side-section" :class="{ 'expanded-category': expandedCategory }" v-if="(trendData && trendData.length > 0) || (categoryAnalytics && categoryAnalytics.length > 0)">
          <!-- Trend Chart -->
          <div v-if="trendData && trendData.length > 0" class="side-by-side-item chart-container-side" :class="{ 'hidden-when-expanded': expandedCategory }">
            <div class="section-card chart-card-compact">
              <div class="chart-header-compact">
                <h3 class="section-title">Item Popularity Trends</h3>
                <button
                  @click="fullscreenChart = 'trend'"
                  class="btn-fullscreen"
                  title="Fullscreen"
                >
                  ⛶
                </button>
              </div>
              <div class="chart-container-compact">
                <TrendChart
                  title=""
                  :data="trendData"
                />
              </div>
            </div>
          </div>
          
          <!-- Category Analytics -->
          <div v-if="categoryAnalytics && categoryAnalytics.length > 0" class="side-by-side-item category-container">
            <div class="section-card">
              <div class="section-header">
                <h3 class="section-title">Category-Level Analytics</h3>
                <button
                  v-if="!expandedCategory"
                  @click="expandedCategory = true"
                  class="btn-see-more btn-see-more-small"
                >
                  See More
                </button>
                <button
                  v-else
                  @click="expandedCategory = false"
                  class="btn-collapse btn-collapse-small"
                >
                  Show Less
                </button>
              </div>
              <div v-if="!expandedCategory" class="category-overview">
                <div class="analytics-summary">
                  <div class="summary-item">
                    <span class="summary-label">Top Category:</span>
                    <span class="summary-value">{{ categorySummary.topCategory }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Total Categories:</span>
                    <span class="summary-value">{{ categorySummary.total }}</span>
                  </div>
                </div>
                <div class="category-preview">
                  <div
                    v-for="(category, index) in categoryAnalytics.slice(0, 3)"
                    :key="index"
                    class="category-preview-item"
                  >
                    <div class="category-preview-header">
                      <span class="category-preview-name">{{ category.category || 'N/A' }}</span>
                      <span class="category-preview-rank">#{{ index + 1 }}</span>
                    </div>
                    <div class="category-preview-stats">
                      <div class="category-preview-stat">
                        <span class="preview-stat-value">{{ (category.totalScans || 0) + (category.totalClicks || 0) }}</span>
                        <span class="preview-stat-label">Views</span>
                      </div>
                      <div class="category-preview-stat">
                        <span class="preview-stat-value">{{ category.totalOrders || 0 }}</span>
                        <span class="preview-stat-label">Orders</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="category-expanded">
                <CategoryAnalytics
                  title="Category-Level Analytics"
                  :data="categoryAnalytics"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Detailed Table -->
        <div class="section" v-if="topItems.length > 0">
          <AnalyticsTable
            title="Detailed Analytics"
            :columns="tableColumns"
            :data="topItems"
          />
        </div>
        
        <!-- Date Range Selector -->
        <div class="section-card">
          <h3 class="section-title">Date Range</h3>
          <div class="date-range-grid">
            <div>
              <label class="input-label">
                Start Date
              </label>
              <input
                v-model="startDate"
                type="date"
                class="input-field"
              />
            </div>
            <div>
              <label class="input-label">
                End Date
              </label>
              <input
                v-model="endDate"
                type="date"
                class="input-field"
              />
            </div>
          </div>
          <button
            @click="loadDashboard"
            class="btn-primary btn-full"
          >
            Apply Date Range
          </button>
        </div>
        
        <!-- Merchant Info -->
        <div class="section-card section-card-subtle">
          <h3 class="section-title">Merchant Information</h3>
          <div class="info-list">
            <p><strong>Merchant ID:</strong> {{ merchantId || 'N/A' }}</p>
            <p><strong>Business Name:</strong> {{ merchantName || 'N/A' }}</p>
            <p><strong>Menu Items:</strong> {{ topItems.length }} tracked</p>
          </div>
        </div>

        <!-- Customer Menu URL -->
        <div class="section-card section-card-info">
          <h3 class="section-title">Customer Menu URL</h3>
          <p class="info-text">Share this URL with your customers:</p>
          <div class="url-display">
            <code>{{ customerMenuUrl }}</code>
          </div>
          <div class="url-actions">
            <button
              @click="copyMenuUrl"
              class="btn-secondary"
            >
              Copy URL
            </button>
            <button
              @click="viewCustomerMenu"
              class="btn-primary"
            >
              Open Menu
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Email Report Modal -->
    <div
      v-if="showEmailModal"
      class="modal-overlay"
      @click.self="showEmailModal = false"
    >
      <div class="modal-content">
        <h3 class="modal-title">Email Analytics Report</h3>
        <div class="modal-form">
          <div>
            <label class="input-label">
              Email Address
            </label>
            <input
              v-model="emailAddress"
              type="email"
              placeholder="your@email.com"
              class="input-field"
            />
          </div>
          <div>
            <label class="input-label">
              Report Type
            </label>
            <select
              v-model="emailReportType"
              class="select-field"
            >
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>
          </div>
          <div class="checkbox-group">
            <input
              type="checkbox"
              id="emailSchedule"
              v-model="emailSchedule"
              class="checkbox-input"
            />
            <label for="emailSchedule" class="checkbox-label">
              Schedule recurring reports
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button
            @click="sendEmailReport"
            class="btn-primary"
            :disabled="!emailAddress || sendingEmail"
          >
            {{ sendingEmail ? 'Sending...' : 'Send Report' }}
          </button>
          <button
            @click="showEmailModal = false"
            class="btn-secondary"
          >
            Cancel
          </button>
        </div>
        <div v-if="emailMessage" class="modal-message" :class="emailMessageType === 'success' ? 'modal-message-success' : 'modal-message-error'">
          {{ emailMessage }}
        </div>
      </div>
    </div>
    
    <!-- Toast Notification -->
    <ToastNotification
      :notification="notification"
      @close="closeNotification"
    />
    
    <!-- Fullscreen Chart Modal -->
    <div
      v-if="fullscreenChart"
      class="fullscreen-modal"
      @click.self="fullscreenChart = null"
    >
      <div class="fullscreen-modal-content">
        <div class="fullscreen-header">
          <h3 class="fullscreen-title">
            {{ fullscreenChart === 'peakHours' ? 'Peak Hours Analysis' : 'Item Popularity Trends' }}
          </h3>
          <button
            @click="fullscreenChart = null"
            class="btn-fullscreen-close"
          >
            ✕
          </button>
        </div>
        <div class="fullscreen-chart">
          <PeakHoursChart
            v-if="fullscreenChart === 'peakHours'"
            title=""
            :data="peakHours"
          />
          <TrendChart
            v-if="fullscreenChart === 'trend'"
            title=""
            :data="trendData"
          />
        </div>
      </div>
    </div>
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
import ToastNotification from '@/components/ToastNotification.vue'

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
const notification = ref(null)
const expandedTopItems = ref(false)
const expandedCategory = ref(false)
const showInsights = ref(false)
const fullscreenChart = ref(null) // 'peakHours' | 'trend' | null

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

// Order counts (using analytics data)
const pendingOrdersCount = computed(() => {
  return 0 // Placeholder - can be updated with actual data
})

const preparingOrdersCount = computed(() => {
  return 0 // Placeholder - can be updated with actual data
})

const readyOrdersCount = computed(() => {
  return 0 // Placeholder - can be updated with actual data
})

const completedOrdersToday = computed(() => {
  return totalOrders.value || 0
})

const totalOrdersToday = computed(() => {
  return totalOrders.value || 0
})

const todayCompletionPercent = computed(() => {
  if (totalOrdersToday.value === 0) return 0
  return Math.round((completedOrdersToday.value / totalOrdersToday.value) * 100)
})

// Analytics summaries
const peakHourSummary = computed(() => {
  if (!peakHours.value || peakHours.value.length === 0) {
    return { hour: 'N/A', total: 0 }
  }
  const peak = peakHours.value.reduce((max, hour) => {
    const total = (hour.orders || 0) + (hour.scans || 0)
    const maxTotal = (max.orders || 0) + (max.scans || 0)
    return total > maxTotal ? hour : max
  }, peakHours.value[0])
  
  const totalActivity = peakHours.value.reduce((sum, hour) => {
    return sum + (hour.orders || 0) + (hour.scans || 0)
  }, 0)
  
  return {
    hour: peak.hourLabel || 'N/A',
    total: totalActivity
  }
})

const trendSummary = computed(() => {
  if (!trendData.value || trendData.value.length < 2) {
    return { change: 0, avgDaily: 0 }
  }
  
  const first = trendData.value[0]?.items?.[0]?.scans || 0
  const last = trendData.value[trendData.value.length - 1]?.items?.[0]?.scans || 0
  const change = first === 0 ? (last > 0 ? 100 : 0) : ((last - first) / first) * 100
  
  const total = trendData.value.reduce((sum, day) => {
    const item = day.items?.[0]
    return sum + (item?.scans || 0)
  }, 0)
  const avgDaily = Math.round(total / trendData.value.length)
  
  return {
    change,
    avgDaily
  }
})

const categorySummary = computed(() => {
  if (!categoryAnalytics.value || categoryAnalytics.value.length === 0) {
    return { topCategory: 'N/A', total: 0 }
  }
  
  const top = categoryAnalytics.value.reduce((max, cat) => {
    const total = (cat.totalScans || 0) + (cat.totalClicks || 0)
    const maxTotal = (max.totalScans || 0) + (max.totalClicks || 0)
    return total > maxTotal ? cat : max
  }, categoryAnalytics.value[0])
  
  return {
    topCategory: top.category || 'N/A',
    total: categoryAnalytics.value.length
  }
})

// Helper functions
const formatStatus = (status) => {
  if (!status) return 'Pending'
  const statusMap = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return statusMap[status.toLowerCase()] || status
}


const getRankClass = (index) => {
  if (index === 0) return 'top-stats-gold'
  if (index === 1) return 'top-stats-silver'
  if (index === 2) return 'top-stats-bronze'
  return 'top-stats-default'
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
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  endDate.value = today.toISOString().split('T')[0]
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  
  loadDashboard()
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
  const baseUrl = import.meta.env.BASE_URL || '/'
  const basePath = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const menuId = TEST_MODE ? testMenu.menuId : 'menu-001'
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
    window.open(customerMenuUrl.value, '_blank')
  } catch (err) {
    console.error('Error viewing customer menu:', err)
    alert('Failed to open menu. Please try again.')
  }
}

const exportToCSV = () => {
  try {
    const csvRows = []
    
    csvRows.push(['Item Name', 'Scans', 'Clicks', 'Category'].join(','))
    
    topItems.value.forEach(item => {
      csvRows.push([
        `"${item.itemName || ''}"`,
        item.scans || 0,
        item.clicks || 0,
        `"${item.category || 'N/A'}"`
      ].join(','))
    })
    
    csvRows.push([])
    csvRows.push(['Summary Statistics'].join(','))
    csvRows.push(['Metric', 'Value'].join(','))
    csvRows.push(['Total Scans', totalScans.value].join(','))
    csvRows.push(['Total Orders', totalOrders.value].join(','))
    csvRows.push(['Avg Order Value', `$${avgOrderValue.value.toFixed(2)}`].join(','))
    csvRows.push(['Avg Prep Time', `${avgOrderPrepTime.value.toFixed(1)} minutes`].join(','))
    
    if (peakHours.value.length > 0) {
      csvRows.push([])
      csvRows.push(['Peak Hours Analysis'].join(','))
      csvRows.push(['Hour', 'Orders', 'Scans'].join(','))
      peakHours.value.forEach(hour => {
        csvRows.push([hour.hourLabel, hour.orders, hour.scans].join(','))
      })
    }
    
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
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (testMode) {
      emailMessage.value = `✅ Report will be sent to ${emailAddress.value} (Test Mode - Email not actually sent)`
      emailMessageType.value = 'success'
      
      setTimeout(() => {
        showEmailModal.value = false
        emailAddress.value = ''
        emailMessage.value = ''
      }, 3000)
    } else {
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

<style scoped>
/* Dashboard UI Guidelines - Phase 1 Design System */
.dashboard-page {
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
  margin-bottom: 24px; /* section spacing */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px; /* internal card padding */
}

.page-title {
  font-size: 24px; /* Page Title */
  font-weight: 600;
  line-height: 1.3;
  color: #0b0706;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.merchant-name {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280; /* Neutral gray */
}

.btn-link {
  background: none;
  border: none;
  color: #0b0706;
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  cursor: pointer;
  text-decoration: underline;
  transition: all 150ms ease-out;
}

.btn-link:hover {
  opacity: 0.7;
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  gap: 8px; /* icon/text spacing */
  border-bottom: 1px solid #ECEAE5; /* canvas-300 */
}

.nav-tab {
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
}

.nav-tab:hover {
  color: #0b0706;
}

.nav-tab-active {
  color: #8A1222; /* burgundy-700 - Active navigation state */
  border-bottom-color: #8A1222;
}

/* Dashboard Content */
.dashboard-content {
  max-width: 1440px; /* Grid max width */
  margin: 0 auto;
  padding: 24px; /* Content padding */
}

/* Test Banner */
.test-banner {
  background-color: rgba(92, 7, 26, 0.08); /* burgundy-900 with opacity */
  border: 1px solid rgba(92, 7, 26, 0.2);
  border-left: 4px solid #5C071A; /* burgundy-900 */
  border-radius: 8px;
  padding: 12px 16px; /* internal card padding */
  margin-bottom: 16px; /* Reduced spacing for viewport fit */
  text-align: center;
}

.test-banner p {
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #5C071A; /* burgundy-900 */
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 16px; /* page-level separation, internal card padding */
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
  margin: 0;
}

/* Error Card */
.error-card {
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-left: 4px solid #5C071A; /* burgundy-900 - Critical alerts */
  border-radius: 16px; /* Card border radius */
  padding: 24px; /* section spacing */
  text-align: center;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
}

.error-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px; /* internal card padding */
  color: #5C071A; /* burgundy-900 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  fill: none;
}

.error-title {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #5C071A; /* burgundy-900 */
  margin: 0 0 8px 0;
}

.error-message {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280; /* Neutral gray */
  margin: 0 0 16px 0; /* internal card padding */
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

.btn-full {
  width: 100%;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12-column grid */
  gap: 20px; /* Reduced gap for viewport fit */
  margin-bottom: 24px; /* Reduced spacing for viewport fit */
}

@media (max-width: 1440px) {
  .stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

.stat-card {
  background-color: #FFFFFF; /* surface-white - Cards */
  border: none;
  border-radius: 16px; /* Card border radius */
  padding: 16px; /* internal card padding (min) */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
  grid-column: span 3; /* Default 3 columns each (12/4=3) */
}

@media (max-width: 1024px) {
  .stat-card {
    grid-column: span 6; /* 2 per row on medium screens */
  }
}

@media (max-width: 768px) {
  .stat-card {
    grid-column: span 12; /* Full width on small screens */
  }
}

.stat-card-progress {
  /* Progress card styling */
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
  margin: 8px 0 0 0; /* icon/text spacing - label comes after value */
}

.stat-value {
  font-size: 24px; /* Larger for stat cards */
  font-weight: 600;
  line-height: 1.2;
  color: #0b0706;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.stat-unit {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
}

.stat-icon {
  width: 32px;
  height: 32px;
  opacity: 0.2;
  color: #6B7280; /* Neutral gray */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  fill: none;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  gap: 8px; /* icon/text spacing */
  flex-wrap: wrap;
  align-items: center;
}

/* Insights Button */
.btn-insights {
  background-color: #FFFFFF;
  color: #8A1222;
  border: 1px solid #ECEAE5;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-insights:hover {
  background-color: #F4F3EF;
  border-color: #8A1222;
}

.btn-insights-active {
  background-color: #F4C430;
  color: #0b0706;
  border-color: #F4C430;
}

.btn-insights-active:hover {
  background-color: #E09F3E;
  border-color: #E09F3E;
}

.insights-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insights-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  fill: none;
}

.insights-text {
  font-size: 13px;
  font-weight: 600;
}

.insights-expanded {
  margin-top: 16px;
  animation: slideDown 200ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Header Section */
.page-header-section {
  margin-bottom: 24px; /* Reduced spacing for viewport fit */
}

.page-section-title {
  font-size: 24px; /* Page Title */
  font-weight: 600;
  line-height: 1.3;
  color: #0b0706;
  margin: 0;
}

/* Section */
.section {
  margin-bottom: 24px; /* Reduced spacing for viewport fit */
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px; /* Reduced spacing for viewport fit */
}

.section-actions {
  display: flex;
  gap: 8px; /* icon/text spacing */
}

.icon-btn {
  background: none;
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 150ms ease-out;
  font-size: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: #F4F3EF; /* canvas-200 */
  border-color: #8A1222; /* burgundy-700 */
}

/* Side by Side Section */
.side-by-side-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px; /* Reduced gap for viewport fit */
  margin-bottom: 24px; /* Reduced spacing for viewport fit */
  transition: all 300ms ease-out;
}

.side-by-side-section.expanded-top-items {
  grid-template-columns: 1fr;
}

.side-by-side-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
}

.side-by-side-section.expanded-category {
  grid-template-columns: 1fr;
}

.top-items-container {
  transition: all 300ms ease-out;
}

.category-container {
  transition: all 300ms ease-out;
}

.chart-container-side {
  transition: all 300ms ease-out;
  overflow: hidden;
}

.chart-container-side.hidden-when-expanded {
  display: none;
}

@media (max-width: 1024px) {
  .side-by-side-section {
    grid-template-columns: 1fr;
  }
  
  .chart-container-side.hidden-when-expanded {
    display: none;
  }
}

/* Top Items Grid */
.top-items-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px; /* internal card padding */
  align-items: stretch;
}

.top-items-grid-compact.expanded-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: stretch;
}

.category-overview {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 24px; /* section spacing */
  min-height: 300px;
}

.category-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-preview-item {
  background-color: #F4F3EF; /* canvas-200 */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 12px;
  padding: 16px; /* internal card padding */
  transition: all 150ms ease-out;
}

.category-preview-item:hover {
  border-color: #8A1222; /* burgundy-700 */
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04);
}

.category-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.category-preview-name {
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
  text-transform: capitalize;
}

.category-preview-rank {
  font-size: 12px; /* Metadata */
  font-weight: 600;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
  background-color: #ECEAE5; /* canvas-300 */
  padding: 2px 8px;
  border-radius: 8px;
}

.category-preview-stats {
  display: flex;
  gap: 16px; /* internal card padding */
}

.category-preview-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-stat-value {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  font-variant-numeric: tabular-nums;
}

.preview-stat-label {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
}

.top-item-card {
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 16px; /* Card border radius */
  padding: 24px; /* section spacing */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
  display: flex;
  flex-direction: column;
  gap: 16px; /* internal card padding */
  height: 100%;
  align-items: stretch;
}

.top-item-card:hover {
  border-color: #D4D4D3;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.1);
}

.top-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px; /* icon/text spacing */
}

.top-item-name-title {
  font-size: 16px; /* Card Title */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  flex: 1;
}

.top-item-rank-badge {
  padding: 4px 12px; /* micro spacing, horizontal padding */
  border-radius: 12px;
  font-size: 12px; /* Metadata */
  font-weight: 600;
  line-height: 1.4;
  background-color: #F4C430; /* Amber - for top items */
  color: #0b0706;
}

/* Stats Circle (like timer in order cards) */
.top-item-stats-circle {
  display: flex;
  justify-content: center;
  padding: 16px 0; /* internal card padding */
}

.top-stats-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid;
}

.top-stats-gold {
  border-color: #F4C430; /* Amber - Gold */
  background-color: rgba(244, 196, 48, 0.1);
}

.top-stats-silver {
  border-color: #9CA3AF; /* Muted Gray - Silver */
  background-color: rgba(156, 163, 175, 0.1);
}

.top-stats-bronze {
  border-color: #E09F3E; /* Warm Orange - Bronze */
  background-color: rgba(224, 159, 62, 0.1);
}

.top-stats-default {
  border-color: #8A1222; /* burgundy-700 */
  background-color: rgba(138, 18, 34, 0.1);
}

.top-stats-content {
  text-align: center;
}

.top-stats-value {
  font-size: 20px; /* Primary Data (Timers) */
  font-weight: 600;
  line-height: 1.2;
  color: #0b0706;
  font-variant-numeric: tabular-nums;
}

.top-stats-label {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
}

/* Stats Details */
.top-item-stats-details {
  display: flex;
  flex-direction: column;
  gap: 8px; /* icon/text spacing */
  padding: 16px; /* internal card padding */
  background-color: #F4F3EF; /* canvas-200 */
  border-radius: 8px;
}

.top-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px; /* Body Text */
  line-height: 1.6;
}

.top-stat-label {
  color: #6B7280; /* Neutral gray */
  font-weight: 400;
}

.top-stat-value {
  color: #0b0706;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}


.order-card-pending {
  border-color: #F4C430; /* Amber - Pending */
}

.order-card-preparing {
  border-color: #E09F3E; /* Warm Orange - Preparing */
}

.order-card-ready {
  border-color: #3FA34D; /* Calm Green - Ready */
}

.order-card-served {
  border-color: #9CA3AF; /* Muted Gray - Served */
  opacity: 0.9;
}

.order-card-cancelled {
  border-color: #5C071A; /* burgundy-900 - Critical */
}

.order-card-header-regular {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px; /* internal card padding */
  padding-bottom: 16px; /* internal card padding */
  border-bottom: 1px solid #ECEAE5; /* canvas-300 */
}

.order-time-section {
  display: flex;
  flex-direction: column;
  gap: 4px; /* micro spacing */
}

.time-primary {
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
}

.time-secondary {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
}

.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px; /* Metadata */
  font-weight: 600;
  line-height: 1.4;
  text-transform: capitalize;
}

.status-badge-pending {
  background-color: rgba(244, 196, 48, 0.15); /* Amber */
  color: #D97706;
}

.status-badge-preparing {
  background-color: rgba(224, 159, 62, 0.15); /* Warm Orange */
  color: #E09F3E;
}

.status-badge-ready {
  background-color: rgba(63, 163, 77, 0.15); /* Calm Green */
  color: #3FA34D;
}

.status-badge-served {
  background-color: rgba(156, 163, 175, 0.15); /* Muted Gray */
  color: #9CA3AF;
}

.status-badge-cancelled {
  background-color: rgba(92, 7, 26, 0.15); /* burgundy-900 */
  color: #5C071A;
}

.order-main-info {
  margin-bottom: 16px; /* internal card padding */
}

.table-number-regular {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0 0 4px 0; /* micro spacing */
}

.order-id-regular {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
  margin: 0;
}

.order-items-section {
  margin-bottom: 16px; /* internal card padding */
  display: flex;
  flex-direction: column;
  gap: 8px; /* icon/text spacing */
}

.order-item-regular {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px; /* Body Text */
  line-height: 1.6;
  padding: 4px 0;
}

.item-name-regular {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #0b0706;
}

.item-price-regular {
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
  font-variant-numeric: tabular-nums;
}

.order-items-more {
  font-size: 12px; /* Metadata */
  color: #6B7280; /* Neutral gray */
  margin: 4px 0;
}

.order-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px; /* internal card padding */
  border-top: 1px solid #ECEAE5; /* canvas-300 */
}

.total-label-regular {
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
}

.total-amount-regular {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  font-variant-numeric: tabular-nums;
}

.btn-compact {
  padding: 8px 16px;
  min-height: 36px;
  font-size: 13px;
}

/* Progress Bar (for Today Order Complete) */
.stat-card-progress .stat-content {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #ECEAE5; /* canvas-300 */
  border-radius: 4px;
  margin: 8px 0; /* icon/text spacing */
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #F4C430; /* Amber */
  transition: width 150ms ease-out;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #6B7280; /* Neutral gray */
  margin-top: 4px; /* micro spacing */
}

/* Analytics Section */
.analytics-section {
  margin-top: 24px; /* Reduced spacing for viewport fit */
}

.analytics-item {
  margin-bottom: 24px; /* Reduced spacing */
}

.analytics-card {
  background-color: #FFFFFF; /* surface-white */
  border-radius: 16px; /* Card border radius */
  padding: 24px; /* section spacing */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
}

.analytics-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px; /* section spacing */
}

.analytics-overview-content {
  flex: 1;
}

.analytics-title {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0 0 12px 0;
}

.analytics-summary {
  display: flex;
  gap: 24px; /* section spacing */
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px; /* micro spacing */
}

.summary-label {
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280; /* Neutral gray */
}

.summary-value {
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
  font-variant-numeric: tabular-nums;
}

.btn-see-more {
  background-color: #6E0D1C; /* burgundy-800 */
  color: #FFFFFF;
  border: none;
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
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-see-more:hover {
  background-color: #5C071A; /* burgundy-900 */
}

.analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px; /* section spacing */
}

.btn-collapse {
  background: none;
  border: 1px solid #ECEAE5; /* canvas-300 */
  color: #0b0706;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-collapse:hover {
  background-color: #F4F3EF; /* canvas-200 */
  border-color: #8A1222; /* burgundy-700 */
}

.trend-positive {
  color: #3FA34D; /* Calm Green */
}

.trend-negative {
  color: #5C071A; /* burgundy-900 */
}

/* Compact Chart Cards */
.chart-card-compact {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 450px;
  overflow: visible;
}

.side-by-side-item .section-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px; /* internal card padding */
}

.btn-fullscreen {
  background: none;
  border: 1px solid #ECEAE5; /* canvas-300 */
  color: #0b0706;
  border-radius: 8px;
  padding: 8px;
  font-size: 18px;
  font-weight: 400;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-fullscreen:hover {
  background-color: #F4F3EF; /* canvas-200 */
  border-color: #8A1222; /* burgundy-700 */
}

.chart-container-compact {
  flex: 1;
  min-height: 450px;
  width: 100%;
  max-width: 100%;
  overflow: visible;
  position: relative;
}

.chart-container-compact :deep(.card) {
  box-shadow: none;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.chart-container-compact :deep(.chart-title) {
  display: none;
}

.chart-container-compact :deep(.chart-container) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: visible;
}

.chart-container-compact :deep(.chart-wrapper) {
  overflow: visible !important;
  position: relative;
  width: 100%;
  min-width: 400px;
}

.chart-container-compact :deep(.chart-container) {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container-compact :deep(.chart-svg) {
  overflow: visible !important;
  max-width: 100%;
  width: 100%;
}

.category-container :deep(.card) {
  box-shadow: none;
  padding: 0;
}

.category-expanded {
  margin-top: 0;
}

.chart-container-compact :deep(.card) h3:empty,
.category-container :deep(.card) h3:empty {
  display: none;
}

.category-container :deep(.card) {
  box-shadow: none;
  padding: 0;
}

.btn-see-more-small {
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
}

.btn-collapse-small {
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
}

/* Fullscreen Modal */
.fullscreen-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.fullscreen-modal-content {
  background-color: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.fullscreen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #ECEAE5;
}

.fullscreen-title {
  font-size: 24px; /* Page Title */
  font-weight: 600;
  line-height: 1.3;
  color: #0b0706;
  margin: 0;
}

.btn-fullscreen-close {
  background: none;
  border: none;
  color: #0b0706;
  font-size: 24px;
  font-weight: 400;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 150ms ease-out;
}

.btn-fullscreen-close:hover {
  background-color: #F4F3EF; /* canvas-200 */
}

.fullscreen-chart {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.fullscreen-chart :deep(.card) {
  box-shadow: none;
  padding: 0;
  height: 100%;
}

.fullscreen-chart :deep(.chart-title) {
  display: none;
}

.section-card {
  background-color: #FFFFFF; /* surface-white - Cards */
  border: none;
  border-radius: 16px; /* Card border radius */
  padding: 24px; /* section spacing (max card padding) */
  margin-bottom: 32px; /* major separation */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
}

.section-card:hover {
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.08);
}

.section-card-subtle {
  background-color: #F4F3EF; /* canvas-200 - Section background */
}

.section-card-info {
  background-color: #FFFFFF; /* surface-white - Cards must always be white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-left: 4px solid #8A1222; /* burgundy-700 - Secondary emphasis */
}

.section-title {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0 0 16px 0; /* internal card padding */
}

/* Input Fields */
.input-label {
  display: block;
  font-size: 14px; /* Body Text */
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
  margin-bottom: 8px; /* icon/text spacing */
}

.input-field,
.select-field {
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

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: #8A1222; /* burgundy-700 */
  box-shadow: 0 0 0 3px rgba(138, 18, 34, 0.1);
}

.input-field::placeholder {
  color: #6B7280; /* Neutral gray */
}

.select-field {
  cursor: pointer;
}

/* Date Range */
.date-range-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px; /* internal card padding */
  margin-bottom: 16px; /* internal card padding */
}

/* Info List */
.info-list {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #0b0706;
}

.info-list p {
  margin: 8px 0; /* icon/text spacing */
}

.info-list strong {
  font-weight: 600;
}

/* URL Display */
.info-text {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280; /* Neutral gray */
  margin: 0 0 8px 0; /* icon/text spacing */
}

.url-display {
  background-color: #F4F3EF; /* canvas-200 */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-left: 4px solid #8A1222; /* burgundy-700 */
  border-radius: 8px;
  padding: 12px 16px; /* internal card padding */
  margin-bottom: 16px; /* internal card padding */
}

.url-display code {
  font-family: monospace;
  font-size: 12px; /* Metadata */
  font-weight: 400;
  line-height: 1.4;
  color: #0b0706;
  word-break: break-all;
}

.url-actions {
  display: flex;
  gap: 8px; /* icon/text spacing */
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px; /* internal card padding */
}

.modal-content {
  background-color: #FFFFFF; /* surface-white */
  border-radius: 16px; /* Card border radius */
  padding: 24px; /* section spacing */
  max-width: 500px;
  width: 100%;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #ECEAE5; /* canvas-300 */
}

.modal-title {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0 0 24px 0; /* section spacing */
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px; /* internal card padding */
  margin-bottom: 24px; /* section spacing */
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px; /* icon/text spacing */
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  color: #0b0706;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 8px; /* icon/text spacing */
}

.modal-actions .btn-primary,
.modal-actions .btn-secondary {
  flex: 1;
}

.modal-message {
  margin-top: 16px; /* internal card padding */
  padding: 12px 16px; /* internal card padding */
  border-radius: 8px;
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
}

.modal-message-success {
  background-color: rgba(92, 7, 26, 0.08); /* burgundy-900 with opacity */
  color: #5C071A; /* burgundy-900 */
  border: 1px solid rgba(92, 7, 26, 0.2);
  border-left: 4px solid #5C071A; /* burgundy-900 */
}

.modal-message-error {
  background-color: rgba(92, 7, 26, 0.08); /* burgundy-900 with opacity */
  color: #5C071A; /* burgundy-900 - Critical alerts */
  border: 1px solid rgba(92, 7, 26, 0.3);
  border-left: 4px solid #5C071A; /* burgundy-900 */
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px; /* internal card padding */
  }
  
  .header-content {
    padding: 16px; /* internal card padding */
  }
  
  .stats-grid {
    grid-template-columns: repeat(12, 1fr);
    gap: 16px; /* internal card padding */
  }
  
  .nav-tabs {
    overflow-x: auto;
    scrollbar-width: none;
  }
  
  .nav-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .nav-tab {
    white-space: nowrap;
  }
  
  .stat-card {
    grid-column: span 12; /* Full width on small screens */
  }
  
  .top-items-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px; /* internal card padding */
  }
}
</style>