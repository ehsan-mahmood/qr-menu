import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import analyticsService from '@/services/analyticsService'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const dashboardData = ref(null)
  const topItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalScans = computed(() => dashboardData.value?.totalScans || 0)
  const totalOrders = computed(() => dashboardData.value?.totalOrders || 0)
  const avgOrderValue = computed(() => dashboardData.value?.avgOrderValue || 0)

  // Actions
  async function fetchDashboardData(merchantId, dateRange) {
    loading.value = true
    error.value = null
    try {
      const response = await analyticsService.getDashboardData(merchantId, dateRange)
      dashboardData.value = response.data
      if (response.data.topItems) {
        topItems.value = response.data.topItems
      }
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to load analytics'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTopItems(merchantId, limit = 10) {
    loading.value = true
    error.value = null
    try {
      const response = await analyticsService.getTopItems(merchantId, limit)
      topItems.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to load top items'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postEvent(eventData) {
    try {
      await analyticsService.postEvent(eventData)
    } catch (err) {
      console.error('Failed to post analytics event:', err)
      // Don't throw - analytics should not block user flow
    }
  }

  function clearAnalytics() {
    dashboardData.value = null
    topItems.value = []
    error.value = null
  }

  return {
    // State
    dashboardData,
    topItems,
    loading,
    error,
    // Getters
    totalScans,
    totalOrders,
    avgOrderValue,
    // Actions
    fetchDashboardData,
    fetchTopItems,
    postEvent,
    clearAnalytics,
  }
})

