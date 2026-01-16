import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import qrService from '@/services/qrService'

export const useQRStore = defineStore('qr', () => {
  // State
  const qrToken = ref('')
  const qrData = ref(null)
  const tableNumber = ref('')
  const menuId = ref('')
  const merchantId = ref('')
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const hasQRData = computed(() => qrData.value !== null)

  // Actions
  async function fetchQRData(token) {
    loading.value = true
    error.value = null
    try {
      const response = await qrService.getQRData(token)
      qrData.value = response.data
      qrToken.value = token
      tableNumber.value = response.data.tableNumber || ''
      menuId.value = response.data.menuId || ''
      merchantId.value = response.data.merchantId || ''
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to load QR data'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setQRToken(token) {
    qrToken.value = token
  }

  function setTableNumber(table) {
    tableNumber.value = table
  }

  function setQRData(data) {
    qrData.value = data
    if (data.qrToken) qrToken.value = data.qrToken
    if (data.tableNumber) tableNumber.value = data.tableNumber
    if (data.menuId) menuId.value = data.menuId
    if (data.merchantId) merchantId.value = data.merchantId
  }

  function clearQRData() {
    qrToken.value = ''
    qrData.value = null
    tableNumber.value = ''
    menuId.value = ''
    merchantId.value = ''
    error.value = null
  }

  return {
    // State
    qrToken,
    qrData,
    tableNumber,
    menuId,
    merchantId,
    loading,
    error,
    // Getters
    hasQRData,
    // Actions
    fetchQRData,
    setQRToken,
    setTableNumber,
    setQRData,
    clearQRData,
  }
})

