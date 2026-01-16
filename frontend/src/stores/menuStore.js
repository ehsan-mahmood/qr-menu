import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import menuService from '@/services/menuService'

export const useMenuStore = defineStore('menu', () => {
  // State
  const currentMenu = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const orderEnabled = ref(true) // Default to enabled

  // Getters
  const sections = computed(() => currentMenu.value?.sections || [])
  const merchantName = computed(() => currentMenu.value?.merchantName || '')
  const allItems = computed(() => {
    if (!currentMenu.value?.sections) return []
    return currentMenu.value.sections.flatMap(section => section.items)
  })

  // Actions
  async function fetchMenuByToken(qrToken) {
    loading.value = true
    error.value = null
    try {
      const response = await menuService.getMenuByToken(qrToken)
      // Backend returns { messageId, receivingId, data: { menuId, sections, ... } }
      const menuData = response.data?.data || response.data
      currentMenu.value = menuData
      // Set orderEnabled from menu config if available
      if (menuData?.orderEnabled !== undefined) {
        orderEnabled.value = menuData.orderEnabled
      }
      return menuData
    } catch (err) {
      error.value = err.message || 'Failed to load menu'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuById(menuId) {
    loading.value = true
    error.value = null
    try {
      const response = await menuService.getMenuById(menuId)
      // Backend returns { messageId, receivingId, data: { menuId, sections, ... } }
      const menuData = response.data?.data || response.data
      currentMenu.value = menuData
      // Set orderEnabled from menu config if available
      if (menuData?.orderEnabled !== undefined) {
        orderEnabled.value = menuData.orderEnabled
      }
      return menuData
    } catch (err) {
      error.value = err.message || 'Failed to load menu'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuBySlug(merchantSlug, menuName) {
    loading.value = true
    error.value = null
    try {
      const response = await menuService.getMenuBySlug(merchantSlug, menuName)
      // Backend returns { messageId, receivingId, data: { menuId, sections, ... } }
      const menuData = response.data?.data || response.data
      currentMenu.value = menuData
      // Set orderEnabled from menu config if available
      if (menuData?.orderEnabled !== undefined) {
        orderEnabled.value = menuData.orderEnabled
      }
      return menuData
    } catch (err) {
      error.value = err.message || 'Failed to load menu'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuConfig(menuId) {
    try {
      const response = await menuService.getMenuConfig(menuId)
      if (response.data?.orderEnabled !== undefined) {
        orderEnabled.value = response.data.orderEnabled
      }
      return response.data
    } catch (err) {
      console.error('Failed to fetch menu config:', err)
      // Don't throw - use default value
      return { orderEnabled: true }
    }
  }

  function setMenu(menu) {
    currentMenu.value = menu
    // Set orderEnabled from menu if available
    if (menu?.orderEnabled !== undefined) {
      orderEnabled.value = menu.orderEnabled
    }
  }

  function clearMenu() {
    currentMenu.value = null
    error.value = null
    orderEnabled.value = true // Reset to default
  }

  return {
    // State
    currentMenu,
    loading,
    error,
    orderEnabled,
    // Getters
    sections,
    merchantName,
    allItems,
    // Actions
    fetchMenuByToken,
    fetchMenuById,
    fetchMenuBySlug,
    fetchMenuConfig,
    setMenu,
    clearMenu,
  }
})

