import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBasketStore = defineStore('basket', () => {
  // State
  const items = ref([])
  const tableNumber = ref('')
  const customerName = ref('')

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  function addItem(item) {
    const existingItem = items.value.find(i => i.id === item.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      items.value.push({
        ...item,
        quantity: 1,
      })
    }
  }

  function removeItem(itemId) {
    const index = items.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(itemId, quantity) {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function incrementQuantity(itemId) {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      item.quantity += 1
    }
  }

  function decrementQuantity(itemId) {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        removeItem(itemId)
      }
    }
  }

  function setTableNumber(table) {
    tableNumber.value = table
  }

  function setCustomerName(name) {
    customerName.value = name
  }

  function clearBasket() {
    items.value = []
    customerName.value = ''
  }

  return {
    // State
    items,
    tableNumber,
    customerName,
    // Getters
    itemCount,
    totalAmount,
    isEmpty,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearBasket,
    setTableNumber,
    setCustomerName,
  }
})

