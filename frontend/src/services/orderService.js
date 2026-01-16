import api from '@/utils/api'
import { TEST_MODE } from '@/config'
import { testOrders } from '@/utils/testData'

export const orderService = {
  // Create new order
  async createOrder(orderData) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600))
      const now = new Date()
      const newOrder = {
        orderId: `order-${Date.now()}`,
        tableNumber: orderData.tableNumber || orderData.customerName || 'N/A',
        items: orderData.items || [],
        totalAmount: orderData.totalAmount || 0,
        status: 'pending',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        statusHistory: [
          { status: 'pending', timestamp: now.toISOString() }
        ]
      }
      
      // Add to test orders array (unshift to add at the beginning for most recent first)
      testOrders.unshift(newOrder)
      
      // Keep only the most recent 50 orders in test data
      if (testOrders.length > 50) {
        testOrders.splice(50)
      }
      
      return { 
        data: {
          messageId: 'ORDER_CREATED',
          receivingId: newOrder.orderId,
          order: newOrder
        }
      }
    }
    
    const response = await api.post('/orders', orderData)
    return response
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400))
      // Update test data in memory
      const order = testOrders.find(o => o.orderId === orderId)
      if (order) {
        order.status = status
        order.updatedAt = new Date().toISOString()
        if (!order.statusHistory) {
          order.statusHistory = []
        }
        order.statusHistory.push({
          status,
          timestamp: order.updatedAt
        })
      }
      return { 
        data: {
          messageId: 'ORDER_UPDATED',
          receivingId: orderId,
          status
        }
      }
    }
    
    const response = await api.patch(`/orders/${orderId}`, { status })
    return response
  },

  // Get order by ID
  async getOrderById(orderId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: testOrders[0] }
    }
    
    const response = await api.get(`/orders/${orderId}`)
    return response
  },

  // Get recent orders (for dashboard)
  async getRecentOrders(merchantId, limit = 10) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      // Return recent orders from test data, sorted by most recent
      const sorted = [...testOrders].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      return { data: sorted.slice(0, limit) }
    }
    
    const response = await api.get(`/orders/recent/${merchantId}`, {
      params: { limit },
    })
    return response
  },

  // Get all orders with optional filters
  async getAllOrders(filters = {}) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400))
      let filteredOrders = [...testOrders]
      
      // Filter by status
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status)
      }
      
      // Filter by table number
      if (filters.tableNumber) {
        filteredOrders = filteredOrders.filter(order => 
          order.tableNumber && order.tableNumber.toLowerCase().includes(filters.tableNumber.toLowerCase())
        )
      }
      
      return { data: filteredOrders }
    }
    
    const params = new URLSearchParams()
    if (filters.merchantId) params.append('merchantId', filters.merchantId)
    if (filters.status) params.append('status', filters.status)
    if (filters.date) params.append('date', filters.date)
    
    const queryString = params.toString()
    const url = `/orders${queryString ? '?' + queryString : ''}`
    const response = await api.get(url)
    return response
  },
}

export default orderService

