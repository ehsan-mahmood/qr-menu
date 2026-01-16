import api from '@/utils/api'
import { TEST_MODE, DEMO_MODE } from '@/config'
import { testAnalytics } from '@/utils/testData'
import { demoAnalyticsStorage } from '@/utils/demoStorage'

export const analyticsService = {
  // Post analytics event
  async postEvent(eventData) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('📊 Analytics Event (Test Mode):', eventData)
      
      // Track events in demo mode
      if (DEMO_MODE) {
        const { eventType, ...rest } = eventData
        
        if (eventType === 'menu_scan') {
          demoAnalyticsStorage.trackScan(rest.qrToken || rest.menuId)
        } else if (eventType === 'menu_view') {
          demoAnalyticsStorage.trackView(rest.menuId)
        } else if (eventType === 'item_click') {
          demoAnalyticsStorage.trackClick(rest.itemName)
        } else if (eventType === 'order_placed') {
          demoAnalyticsStorage.trackOrder()
        }
      }
      
      return { 
        data: {
          messageId: 'EVENT_RECORDED',
          receivingId: `event-${Date.now()}`,
          success: true
        }
      }
    }
    
    const response = await api.post('/analytics/events', eventData)
    return response
  },

  // Get analytics dashboard data
  async getDashboardData(merchantId, dateRange) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (DEMO_MODE) {
        // Merge localStorage tracking with existing testAnalytics structure
        const clicks = demoAnalyticsStorage.getClicks()
        const topItems = Object.keys(clicks).length > 0 
          ? demoAnalyticsStorage.getTopItems(10)
          : testAnalytics.topItems // Use testAnalytics if no clicks yet
        
        const storedScans = demoAnalyticsStorage.getScans().length
        const storedViews = demoAnalyticsStorage.getViews().length
        const storedOrders = demoOrderStorage.getAll().length
        
        return {
          data: {
            ...testAnalytics, // Use all existing testAnalytics structure
            topItems, // Enhanced with localStorage clicks if available
            totalScans: storedScans || testAnalytics.totalScans,
            totalOrders: storedOrders || testAnalytics.totalOrders,
            messageId: 'ANALYTICS_RETRIEVED',
            receivingId: `analytics-${Date.now()}`,
          }
        }
      } else {
        // Filter data by date range if provided (for demo purposes, we'll return all data)
        return { 
          data: {
            ...testAnalytics,
            messageId: 'ANALYTICS_RETRIEVED',
            receivingId: `analytics-${Date.now()}`,
          }
        }
      }
    }
    
    const response = await api.get(`/analytics/dashboard/${merchantId}`, {
      params: dateRange,
    })
    return response
  },

  // Get top items
  async getTopItems(merchantId, limit = 10) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      if (DEMO_MODE) {
        // Merge localStorage clicks with testAnalytics structure
        const clicks = demoAnalyticsStorage.getClicks()
        const topItems = Object.keys(clicks).length > 0
          ? demoAnalyticsStorage.getTopItems(limit)
          : testAnalytics.topItems.slice(0, limit)
        return { data: topItems }
      } else {
        return { data: testAnalytics.topItems.slice(0, limit) }
      }
    }
    
    const response = await api.get(`/analytics/top-items/${merchantId}`, {
      params: { limit },
    })
    return response
  },
}

export default analyticsService

