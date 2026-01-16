import api from '@/utils/api'
import { TEST_MODE } from '@/config'

export const paymentService = {
  // Create payment for an order (optional, independent of order creation)
  async createPayment(paymentData) {
    if (TEST_MODE) {
      // Simulate payment processing in demo mode
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newPayment = {
        paymentId: `payment-${Date.now()}`,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod || 'card',
        paymentStatus: 'completed',
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        metadata: paymentData.metadata || null,
        createdAt: new Date().toISOString(),
      }
      
      return { 
        data: {
          messageId: 'PAYMENT_CREATED',
          receivingId: newPayment.paymentId,
          payment: newPayment
        }
      }
    }
    
    const response = await api.post('/payments', paymentData)
    return response
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { 
        data: {
          messageId: 'PAYMENT_RETRIEVED',
          receivingId: paymentId,
          payment: {
            paymentId,
            orderId: 'order-001',
            amount: 25.50,
            paymentMethod: 'card',
            paymentStatus: 'completed',
            transactionId: 'txn_demo_123',
            createdAt: new Date().toISOString(),
          }
        }
      }
    }
    
    const response = await api.get(`/payments/${paymentId}`)
    return response
  },

  // Get payments for an order
  async getPaymentsByOrderId(orderId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { 
        data: {
          messageId: 'PAYMENTS_RETRIEVED',
          receivingId: orderId,
          payments: []
        }
      }
    }
    
    const response = await api.get(`/payments/order/${orderId}`)
    return response
  },

  // Update payment status
  async updatePaymentStatus(paymentId, paymentStatus) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400))
      return { 
        data: {
          messageId: 'PAYMENT_UPDATED',
          receivingId: paymentId,
          paymentStatus
        }
      }
    }
    
    const response = await api.patch(`/payments/${paymentId}`, { paymentStatus })
    return response
  },
}

export default paymentService
