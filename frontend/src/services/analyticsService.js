import api from '@/utils/api'
import { TEST_MODE } from '@/config'
import { testAnalytics } from '@/utils/testData'

export const analyticsService = {
  // Post analytics event
  async postEvent(eventData) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('📊 Analytics Event (Test Mode):', eventData)
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
      // Filter data by date range if provided (for demo purposes, we'll return all data)
      return { 
        data: {
          ...testAnalytics,
          messageId: 'ANALYTICS_RETRIEVED',
          receivingId: `analytics-${Date.now()}`,
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
      return { data: testAnalytics.topItems.slice(0, limit) }
    }
    
    const response = await api.get(`/analytics/top-items/${merchantId}`, {
      params: { limit },
    })
    return response
  },
}

export default analyticsService

