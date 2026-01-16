import api from '@/utils/api'
import { TEST_MODE } from '@/config'
import { testMenu } from '@/utils/testData'

export const menuService = {
  // Get menu by QR token
  async getMenuByToken(qrToken) {
    if (TEST_MODE) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: testMenu }
    }
    
    const response = await api.get(`/menu/qr/${qrToken}`)
    return response
  },

  // Get menu by ID
  async getMenuById(menuId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: testMenu }
    }
    
    const response = await api.get(`/menu/${menuId}`)
    return response
  },

  // Get menu by merchant slug and menu name
  async getMenuBySlug(merchantSlug, menuName) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: testMenu }
    }
    
    const response = await api.get(`/menu/${encodeURIComponent(merchantSlug)}/${encodeURIComponent(menuName)}`)
    return response
  },

  // Get all menu items
  async getMenuItems(menuId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const allItems = testMenu.sections.flatMap(section => section.items)
      return { data: allItems }
    }
    
    const response = await api.get(`/menu/${menuId}/items`)
    return response
  },

  // Get menu configuration (e.g., orderEnabled setting)
  async getMenuConfig(menuId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return { 
        data: { 
          orderEnabled: testMenu.orderEnabled ?? true 
        } 
      }
    }
    
    const response = await api.get(`/menu/${menuId}/config`)
    return response
  },

  // Get merchant's menu ID (first menu for the merchant)
  async getMerchantMenuId(merchantId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return { data: { menuId: testMenu.menuId || 'test-menu-001' } }
    }
    
    // TODO: Add backend endpoint GET /menu/merchant/:merchantId
    // For now, this will need to be implemented on the backend
    // We can try to get it from QR codes or create a new endpoint
    const response = await api.get(`/menu/merchant/${merchantId}`)
    return response
  },

  // Create or update menu
  async createOrUpdateMenu({ merchantId, menuName, orderEnabled, sections }) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        data: {
          messageId: 'MENU_CREATED',
          receivingId: 'menu-' + Date.now(),
          menu: {
            menuId: 'test-menu-001',
            merchantId,
            menuName,
            createdAt: new Date().toISOString(),
          },
        }
      }
    }
    
    const response = await api.post('/menu', {
      merchantId,
      menuName,
      orderEnabled,
      sections,
    })
    return response
  },
}

export default menuService

