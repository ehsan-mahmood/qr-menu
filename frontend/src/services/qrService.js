import api from '@/utils/api'
import { TEST_MODE } from '@/config'
import { testQRData } from '@/utils/testData'

export const qrService = {
  // Create new QR code
  async createQRCode(qrData) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { 
        data: {
          messageId: 'QR_CREATED',
          receivingId: `qr-${Date.now()}`,
          qrCode: {
            ...qrData,
            qrToken: `token-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
        }
      }
    }
    
    const response = await api.post('/qr/codes', qrData)
    return response
  },

  // Get QR code data
  async getQRData(qrToken) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: testQRData }
    }
    
    const response = await api.get(`/qr/codes/${qrToken}`)
    return response
  },

  // Get all QR codes for merchant
  async getMerchantQRCodes(merchantId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400))
      return { 
        data: [
          {
            id: 'qr-1',
            qrToken: 'test-qr-token-001',
            tableLabel: 'Table 1',
            menuId: 'test-menu-001',
            locationId: 'loc-1',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'qr-2',
            qrToken: 'test-qr-token-002',
            tableLabel: 'Table 2',
            menuId: 'test-menu-001',
            locationId: 'loc-1',
            isActive: false,
            createdAt: new Date().toISOString(),
          }
        ]
      }
    }
    
    const response = await api.get(`/qr/merchant/${merchantId}`)
    return response
  },

  // Update QR code status
  async updateQRStatus(qrId, isActive) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { 
        data: {
          messageId: 'QR_STATUS_UPDATED',
          receivingId: `qr-status-${Date.now()}`,
          qrId,
          isActive
        }
      }
    }
    
    const response = await api.patch(`/qr/codes/${qrId}/status`, { isActive })
    return response
  },

  // Register pre-printed QR code
  async registerPrePrintedQR(qrData) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { 
        data: {
          messageId: 'QR_REGISTERED',
          receivingId: `qr-reg-${Date.now()}`,
          qrCode: {
            id: `qr-${Date.now()}`,
            ...qrData,
            isActive: true,
            createdAt: new Date().toISOString(),
          }
        }
      }
    }
    
    const response = await api.post('/qr/codes/register', qrData)
    return response
  },
}

export default qrService

