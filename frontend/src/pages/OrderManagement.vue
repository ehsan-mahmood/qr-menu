<template>
  <div class="order-management">
    <!-- Header -->
    <div class="header-bar">
      <div :class="kitchenMode ? 'header-content-full' : 'header-content'">
        <div class="header-top">
          <h1 class="page-title">Order Management</h1>
          <div class="header-actions">
            <button
              v-if="kitchenMode"
              @click="kitchenMode = false"
              class="btn-secondary"
              title="Exit kitchen mode and return to regular grid view"
            >
              Exit Kitchen Mode
            </button>
            <button
              v-else
              @click="kitchenMode = true"
              class="btn-primary"
              title="Switch to kitchen mode (Kanban board view)"
            >
              Kitchen Mode
            </button>
            <button
              @click="handleLogout"
              class="btn-secondary"
              title="Log out of your account"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Search and Filter Bar (Hidden in Kitchen Mode) -->
        <div v-if="!kitchenMode" class="controls-bar">
          <div class="controls-left">
            <div class="search-input-wrapper">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by table number..."
                class="input-field"
              />
            </div>
            <select
              v-model="statusFilter"
              class="select-field"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              @click="loadOrders"
              :disabled="loading"
              class="btn-primary btn-compact"
              title="Refresh orders list"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
          <div class="auto-refresh-toggle">
            <input
              type="checkbox"
              id="autoRefreshRegular"
              v-model="autoRefresh"
              class="checkbox-input"
              title="Automatically refresh orders every 10 seconds"
            />
            <label for="autoRefreshRegular" class="checkbox-label">
              Auto-refresh (10s)
            </label>
          </div>
        </div>

        <!-- Kitchen Mode Controls -->
        <div v-if="kitchenMode" class="kitchen-controls">
          <div class="search-input-wrapper-kitchen">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search table..."
              class="input-field"
            />
          </div>
          <div class="kitchen-controls-right">
            <button
              @click="showFullDetails = !showFullDetails"
              class="btn-secondary btn-compact"
              :title="showFullDetails ? 'Switch to summary view (shows fewer details)' : 'Switch to full details view (shows all items)'"
            >
              {{ showFullDetails ? 'Summary' : 'Full Details' }}
            </button>
            <button
              @click="loadOrders"
              :disabled="loading"
              class="btn-primary btn-compact"
              title="Refresh orders list"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
            <div class="auto-refresh-toggle">
              <input
                type="checkbox"
                id="autoRefreshKitchen"
                v-model="autoRefresh"
                class="checkbox-input"
                title="Automatically refresh orders every 10 seconds"
              />
              <label for="autoRefreshKitchen" class="checkbox-label">
                Auto (10s)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kitchen Mode Banner -->
    <div v-if="kitchenMode" class="kitchen-banner">
      <p class="kitchen-banner-text">Kitchen Mode</p>
    </div>

    <!-- Toast Notifications -->
    <div
      v-if="notification"
      class="toast-notification"
    >
      <div class="toast-content">
        <div class="toast-text">
          <p class="toast-title">{{ notification.title }}</p>
          <p class="toast-message">{{ notification.message }}</p>
        </div>
        <button 
          @click="notification = null" 
          class="toast-close"
          title="Close notification"
          aria-label="Close notification"
        >
          Close
        </button>
      </div>
    </div>

    <div :class="kitchenMode ? 'content-full' : 'content'">
      <!-- Loading State -->
      <div v-if="loading && orders.length === 0" class="empty-state">
        <p class="empty-state-text">Loading orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-card">
        <h3 class="error-title">Failed to Load Orders</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="loadOrders" class="btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <h3 class="empty-state-title">No Orders Found</h3>
        <p class="empty-state-text">
          {{ statusFilter || searchQuery ? 'Try adjusting your filters.' : 'No orders yet.' }}
        </p>
      </div>

      <!-- Kitchen Mode: Kanban Board Layout -->
      <div v-if="kitchenMode && filteredOrders.length > 0" class="kanban-board">
        <div class="kanban-grid">
          <!-- Pending Column -->
          <div class="kanban-column">
            <div class="kanban-header kanban-header-pending">
              <div class="kanban-header-content">
                <h3 class="kanban-title">Pending</h3>
                <p class="kanban-subtitle">New orders</p>
              </div>
              <span class="kanban-count">{{ getOrdersByStatus('pending').length }}</span>
            </div>
            <div class="kanban-content">
              <div
                v-for="order in getOrdersByStatus('pending')"
                :key="order.orderId"
                class="kanban-card kanban-card-pending"
              >
                <div class="order-card-header">
                  <div class="order-card-time">
                    <span class="time-label">{{ formatTime(order.createdAt) }}</span>
                    <span class="time-meta">{{ getProcessingTime(order) }}</span>
                  </div>
                  <span class="order-id">#{{ order.orderId.slice(-6) }}</span>
                </div>
                <h3 class="table-number">Table {{ order.tableNumber || 'N/A' }}</h3>
                <div class="order-items">
                  <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                    <span class="item-name">{{ item.quantity }}x {{ item.name || item.menu_item_id }}</span>
                    <span class="item-price">${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}</span>
                  </div>
                </div>
                <div class="order-total">
                  <span class="total-label">Total:</span>
                  <span class="total-amount">${{ order.totalAmount.toFixed(2) }}</span>
                </div>
                <button
                  @click="updateOrderStatus(order.orderId, 'preparing')"
                  :disabled="updatingOrder === order.orderId"
                  class="btn-primary btn-full"
                  title="Move order to Preparing status"
                >
                  Move to Preparing
                </button>
              </div>
              <div v-if="getOrdersByStatus('pending').length === 0" class="empty-column">
                <p class="empty-column-text">No pending orders</p>
              </div>
            </div>
          </div>

          <!-- Preparing Column -->
          <div class="kanban-column">
            <div class="kanban-header kanban-header-preparing">
              <div class="kanban-header-content">
                <h3 class="kanban-title">Preparing</h3>
                <p class="kanban-subtitle">In kitchen</p>
              </div>
              <span class="kanban-count">{{ getOrdersByStatus('preparing').length }}</span>
            </div>
            <div class="kanban-content">
              <div
                v-for="order in getOrdersByStatus('preparing')"
                :key="order.orderId"
                class="kanban-card kanban-card-preparing"
              >
                <div class="order-card-header">
                  <div class="order-card-time">
                    <span class="time-label">{{ formatTime(order.createdAt) }}</span>
                    <span class="time-meta">{{ getProcessingTime(order) }}</span>
                  </div>
                  <div class="order-card-actions">
                    <button
                      @click.stop="printDocket(order)"
                      class="btn-icon"
                      title="Print kitchen docket"
                    >
                      Print
                    </button>
                    <span class="order-id">#{{ order.orderId.slice(-6) }}</span>
                  </div>
                </div>
                <h3 class="table-number">Table {{ order.tableNumber || 'N/A' }}</h3>
                
                <!-- Full Details View -->
                <div v-if="showFullDetails || expandedOrders.has(order.orderId)" class="order-items">
                  <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                    <span class="item-name">{{ item.quantity }}x {{ item.name || item.menu_item_id }}</span>
                    <span class="item-price">${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}</span>
                  </div>
                </div>
                
                <!-- Summary View -->
                <div v-else class="order-items-summary">
                  <div v-for="(item, idx) in order.items.slice(0, 2)" :key="idx" class="order-item-summary">
                    {{ item.quantity }}x {{ item.name || item.menu_item_id }}
                  </div>
                  <p v-if="order.items.length > 2" class="order-items-more">
                    +{{ order.items.length - 2 }} more items
                  </p>
                  <button
                    @click="expandedOrders.add(order.orderId)"
                    class="btn-link"
                  >
                    View all {{ order.items.length }} items
                  </button>
                </div>
                
                <div class="order-total">
                  <span class="total-label">Total:</span>
                  <span class="total-amount">${{ order.totalAmount.toFixed(2) }}</span>
                </div>
                <div class="order-actions">
                  <button
                    @click="updateOrderStatus(order.orderId, 'ready')"
                    :disabled="updatingOrder === order.orderId"
                    class="btn-success btn-full"
                    title="Mark order as ready for pickup"
                  >
                    Mark Ready for Pickup
                  </button>
                  <button
                    @click="updateOrderStatus(order.orderId, 'cancelled')"
                    :disabled="updatingOrder === order.orderId"
                    class="btn-destructive"
                    title="Cancel this order"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
              <div v-if="getOrdersByStatus('preparing').length === 0" class="empty-column">
                <p class="empty-column-text">No orders preparing</p>
              </div>
            </div>
          </div>

          <!-- Ready Column -->
          <div class="kanban-column">
            <div class="kanban-header kanban-header-ready">
              <div class="kanban-header-content">
                <h3 class="kanban-title">Ready</h3>
                <p class="kanban-subtitle">Ready for pickup</p>
              </div>
              <span class="kanban-count">{{ getOrdersByStatus('ready').length }}</span>
            </div>
            <div class="kanban-content">
              <div
                v-for="order in getOrdersByStatus('ready')"
                :key="order.orderId"
                class="kanban-card kanban-card-ready"
              >
                <div class="order-card-header">
                  <div class="order-card-time">
                    <span class="time-label">{{ formatTime(order.createdAt) }}</span>
                    <span class="time-meta">{{ getProcessingTime(order) }}</span>
                  </div>
                  <div class="order-card-actions">
                    <button
                      @click.stop="printDocket(order)"
                      class="btn-icon"
                      title="Print kitchen docket"
                    >
                      Print
                    </button>
                    <span class="order-id">#{{ order.orderId.slice(-6) }}</span>
                  </div>
                </div>
                <div class="ready-alert">
                  <span class="ready-alert-text">Ready for pickup · {{ getProcessingTime(order) }}</span>
                </div>
                <h3 class="table-number">Table {{ order.tableNumber || 'N/A' }}</h3>
                
                <!-- Full Details View -->
                <div v-if="showFullDetails || expandedOrders.has(order.orderId)" class="order-items">
                  <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                    <span class="item-name">{{ item.quantity }}x {{ item.name || item.menu_item_id }}</span>
                    <span class="item-price">${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}</span>
                  </div>
                </div>
                
                <!-- Summary View -->
                <div v-else class="order-items-summary">
                  <div v-for="(item, idx) in order.items.slice(0, 2)" :key="idx" class="order-item-summary">
                    {{ item.quantity }}x {{ item.name || item.menu_item_id }}
                  </div>
                  <p v-if="order.items.length > 2" class="order-items-more">
                    +{{ order.items.length - 2 }} more items
                  </p>
                  <button
                    @click="expandedOrders.add(order.orderId)"
                    class="btn-link"
                  >
                    View all {{ order.items.length }} items
                  </button>
                </div>
                
                <div class="order-total">
                  <span class="total-label">Total:</span>
                  <span class="total-amount">${{ order.totalAmount.toFixed(2) }}</span>
                </div>
                <button
                  @click="updateOrderStatus(order.orderId, 'served')"
                  :disabled="updatingOrder === order.orderId"
                  class="btn-primary btn-full"
                  title="Mark order as served to customer"
                >
                  Mark as Served
                </button>
              </div>
              <div v-if="getOrdersByStatus('ready').length === 0" class="empty-column">
                <p class="empty-column-text">No orders ready</p>
              </div>
            </div>
          </div>

          <!-- Served Column (Compact) -->
          <div class="kanban-column">
            <div class="kanban-header kanban-header-served">
              <div class="kanban-header-content">
                <h3 class="kanban-title">Served</h3>
                <p class="kanban-subtitle">Completed</p>
              </div>
              <span class="kanban-count">{{ getOrdersByStatus('served').length }}</span>
            </div>
            <div class="kanban-content">
              <div
                v-for="order in getOrdersByStatus('served')"
                :key="order.orderId"
                class="kanban-card kanban-card-served"
              >
                <div class="order-card-header">
                  <h3 class="table-number-small">Table {{ order.tableNumber || 'N/A' }}</h3>
                  <button
                    @click.stop="printDocket(order)"
                    class="btn-icon"
                    title="Print kitchen docket"
                  >
                    Print
                  </button>
                </div>
                <p class="order-id-small">#{{ order.orderId.slice(-6) }}</p>
                <div class="order-summary">
                  <p class="order-summary-text">{{ order.items?.length }} items</p>
                  <p class="order-summary-total">${{ order.totalAmount.toFixed(2) }}</p>
                </div>
                <p class="order-time-small">{{ formatTime(order.createdAt) }}</p>
              </div>
              <div v-if="getOrdersByStatus('served').length === 0" class="empty-column">
                <p class="empty-column-text">No served orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Mode: Grid Layout -->
      <div v-else-if="!kitchenMode && filteredOrders.length > 0" class="orders-grid">
        <div
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="order-card"
          :class="getStatusCardClass(order.status)"
        >
          <!-- Order Header with Time First (Time is Hero) -->
          <div class="order-card-header-regular">
            <div class="order-time-section">
              <div class="time-primary">{{ formatTime(order.createdAt) }}</div>
              <div class="time-secondary">{{ getProcessingTime(order) }}</div>
            </div>
            <div class="order-header-right">
              <button
                @click.stop="printDocket(order)"
                class="btn-icon"
                title="Print kitchen docket"
              >
                Print
              </button>
              <span class="status-badge" :class="getStatusBadgeClass(order.status)">
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>

          <div class="order-main-info">
            <h3 class="table-number-regular">
              Table {{ order.tableNumber || 'N/A' }}
            </h3>
            <p class="order-id-regular">Order #{{ order.orderId.slice(-6) }}</p>
          </div>

          <!-- Order Items -->
          <div class="order-items-section">
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="order-item-regular"
            >
              <span class="item-name-regular">
                {{ item.quantity }}x {{ item.name || item.menu_item_id }}
              </span>
              <span class="item-price-regular">
                ${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Time Metadata Section -->
          <div class="time-metadata-section">
            <div class="time-metadata-row">
              <span class="time-metadata-label">Received:</span>
              <span class="time-metadata-value">{{ formatTime(order.createdAt) }}</span>
            </div>
            <div v-if="order.updatedAt !== order.createdAt" class="time-metadata-row">
              <span class="time-metadata-label">Last Updated:</span>
              <span class="time-metadata-value">{{ formatTime(order.updatedAt) }}</span>
            </div>
            <div class="time-metadata-row">
              <span class="time-metadata-label">Processing Time:</span>
              <span class="time-metadata-value" :class="getProcessingTimeClass(order)">{{ getProcessingTime(order) }}</span>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="order-total-section">
            <span class="total-label-regular">Total:</span>
            <span class="total-amount-regular">
              ${{ order.totalAmount.toFixed(2) }}
            </span>
          </div>

          <!-- Status Update Buttons -->
          <div class="order-actions-regular">
            <button
              v-if="order.status === 'pending'"
              @click="updateOrderStatus(order.orderId, 'preparing')"
              :disabled="updatingOrder === order.orderId"
              class="btn-primary btn-action"
              title="Move order to Preparing status"
            >
              Move to Preparing
            </button>
            <button
              v-if="order.status === 'preparing'"
              @click="updateOrderStatus(order.orderId, 'ready')"
              :disabled="updatingOrder === order.orderId"
              class="btn-success btn-action"
              title="Mark order as ready for pickup"
            >
              Mark Ready
            </button>
            <button
              v-if="order.status === 'ready'"
              @click="updateOrderStatus(order.orderId, 'served')"
              :disabled="updatingOrder === order.orderId"
              class="btn-served btn-action"
              title="Mark order as served to customer"
            >
              Mark Served
            </button>
            <button
              v-if="['pending', 'preparing'].includes(order.status)"
              @click="updateOrderStatus(order.orderId, 'cancelled')"
              :disabled="updatingOrder === order.orderId"
              class="btn-destructive btn-action"
              title="Cancel this order"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import orderService from '@/services/orderService'
import { TEST_MODE } from '@/config'

const router = useRouter()
const authStore = useAuthStore()

// State
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const autoRefresh = ref(true)
const kitchenMode = ref(false)
const notification = ref(null)
const updatingOrder = ref(null)
const showFullDetails = ref(true)
const expandedOrders = ref(new Set())
let refreshInterval = null

// Computed
const filteredOrders = computed(() => {
  let filtered = [...orders.value]

  if (!kitchenMode.value && statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.tableNumber && order.tableNumber.toLowerCase().includes(query)
    )
  }

  if (kitchenMode.value) {
    filtered = filtered.filter(order => order.status !== 'cancelled')
  }

  return filtered.sort((a, b) => {
    const statusPriority = { pending: 0, preparing: 1, ready: 2, served: 3, cancelled: 4 }
    const aPriority = statusPriority[a.status] || 5
    const bPriority = statusPriority[b.status] || 5
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

const getOrdersByStatus = (status) => {
  return filteredOrders.value.filter(order => order.status === status)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

const loadOrders = async () => {
  loading.value = true
  error.value = null

  try {
    const merchantId = authStore.merchant?.id || authStore.user?.merchantId || authStore.user?.userId
    const filters = {
      merchantId,
      ...(statusFilter.value && { status: statusFilter.value }),
    }

    const response = await orderService.getAllOrders(filters)
    
    const previousCount = orders.value.length
    const previousOrderIds = new Set(orders.value.map(o => o.orderId))
    
    const newOrders = response.data || response || []
    orders.value = Array.isArray(newOrders) ? newOrders : []
    
    if (previousCount > 0 && orders.value.length > previousCount) {
      const addedOrders = orders.value.filter(o => !previousOrderIds.has(o.orderId))
      if (addedOrders.length > 0) {
        showNotification(
          'New Order',
          `${addedOrders.length} new order${addedOrders.length > 1 ? 's' : ''} received`
        )
        playNotificationSound()
      }
    }
  } catch (err) {
    console.error('Failed to load orders:', err)
    error.value = 'Failed to load orders. Please try again.'
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId, newStatus) => {
  updatingOrder.value = orderId

  try {
    await orderService.updateOrderStatus(orderId, newStatus)
    
    const order = orders.value.find(o => o.orderId === orderId)
    if (order) {
      order.status = newStatus
      order.updatedAt = new Date().toISOString()
      
      if (!order.statusHistory) {
        order.statusHistory = []
      }
      order.statusHistory.push({
        status: newStatus,
        timestamp: order.updatedAt
      })
    }

    showNotification(
      'Order Updated',
      `Order #${orderId.slice(-6)} marked as ${formatStatus(newStatus)}`
    )
  } catch (err) {
    console.error('Failed to update order status:', err)
    alert('Failed to update order status. Please try again.')
  } finally {
    updatingOrder.value = null
  }
}

const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getProcessingTime = (order) => {
  if (!order.createdAt) return 'N/A'
  const start = new Date(order.createdAt)
  const end = order.updatedAt ? new Date(order.updatedAt) : new Date()
  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return '< 1 min'
  if (diffMins < 60) return `${diffMins} min`
  
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}

const getProcessingTimeClass = (order) => {
  const start = new Date(order.createdAt)
  const end = order.updatedAt ? new Date(order.updatedAt) : new Date()
  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  
  // Alert if processing time is over 30 minutes
  if (diffMins > 30) return 'time-alert'
  return ''
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'status-badge-pending',
    preparing: 'status-badge-preparing',
    ready: 'status-badge-ready',
    served: 'status-badge-served',
    cancelled: 'status-badge-cancelled'
  }
  return classes[status] || ''
}

const getStatusCardClass = (status) => {
  const classes = {
    pending: 'order-card-pending',
    preparing: 'order-card-preparing',
    ready: 'order-card-ready-regular',
    served: 'order-card-served-regular',
    cancelled: 'order-card-cancelled'
  }
  return classes[status] || ''
}

const showNotification = (title, message) => {
  notification.value = { title, message }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (err) {
    console.log('Could not play notification sound')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const printDocket = (order) => {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  
  let printTriggered = false
  
  const triggerPrint = () => {
    if (printTriggered) return
    printTriggered = true
    
    if (iframe.contentWindow) {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe)
        }
      }, 1000)
    }
  }
  
  const now = new Date()
  const orderTime = new Date(order.createdAt)
  
  const docketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          padding: 10px;
          max-width: 300px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .order-info {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #ccc;
        }
        .order-info div {
          margin: 3px 0;
        }
        .items {
          margin: 10px 0;
        }
        .item {
          margin: 5px 0;
          padding: 3px 0;
        }
        .item-quantity {
          font-weight: bold;
        }
        .total {
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 10px;
          text-align: right;
          font-size: 14px;
          font-weight: bold;
        }
        .footer {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #ccc;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        .status {
          background: #f0f0f0;
          padding: 5px;
          margin: 10px 0;
          text-align: center;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KITCHEN DOCKET</h1>
      </div>
      
      <div class="order-info">
        <div><strong>Table:</strong> ${order.tableNumber || 'N/A'}</div>
        <div><strong>Order #:</strong> ${order.orderId.slice(-8)}</div>
        <div><strong>Time:</strong> ${orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div><strong>Date:</strong> ${orderTime.toLocaleDateString()}</div>
        <div class="status">Status: ${formatStatus(order.status).toUpperCase()}</div>
      </div>
      
      <div class="items">
        <strong>ITEMS:</strong>
        ${order.items.map(item => `
          <div class="item">
            <span class="item-quantity">${item.quantity}x</span> ${item.name || item.menu_item_id}
          </div>
        `).join('')}
      </div>
      
      <div class="total">
        TOTAL: $${order.totalAmount.toFixed(2)}
      </div>
      
      <div class="footer">
        Printed: ${now.toLocaleString()}<br>
        Processing Time: ${getProcessingTime(order)}
      </div>
    </body>
    </html>
  `
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  iframeDoc.open()
  iframeDoc.write(docketHTML)
  iframeDoc.close()
  
  iframe.onload = () => {
    setTimeout(() => {
      triggerPrint()
    }, 250)
  }
  
  setTimeout(() => {
    if (!printTriggered) {
      triggerPrint()
    }
  }, 500)
}

watch(autoRefresh, (enabled) => {
  if (enabled) {
    refreshInterval = setInterval(() => {
      loadOrders()
    }, 10000)
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }
})

onMounted(() => {
  loadOrders()
  if (autoRefresh.value) {
    refreshInterval = setInterval(() => {
      loadOrders()
    }, 10000)
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
/* Dashboard UI Guidelines - Phase 1 Design System */
.order-management {
  min-height: 100vh;
  background-color: #FAFAF8; /* canvas-100 */
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0b0706;
}

/* Header */
.header-bar {
  background-color: #FAFAF8; /* canvas-100 */
  border-bottom: 1px solid #ECEAE5; /* canvas-300 */
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content,
.header-content-full {
  padding: 16px 24px;
}

.header-content {
  max-width: 1440px; /* Grid max width */
  margin: 0 auto;
}

.header-content-full {
  width: 100%;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page-title {
  font-size: 24px; /* Page Title */
  font-weight: 600;
  line-height: 1.3;
  color: #0b0706;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Buttons - Primary */
.btn-primary {
  background-color: #6E0D1C; /* burgundy-800 - Primary CTAs */
  color: #FFFFFF;
  border: none;
  border-radius: 12px; /* Button radius */
  padding: 0 24px; /* horizontal padding */
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px; /* Button height */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none; /* No gradients */
}

.btn-compact {
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5C071A; /* burgundy-900 - darker shade on hover */
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Buttons - Secondary */
.btn-secondary {
  background-color: #FFFFFF; /* Secondary button */
  color: #8A1222; /* burgundy-700 */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 12px; /* Button radius */
  padding: 0 24px;
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px; /* Button height */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  background-color: #F4F3EF; /* canvas-200 */
  border-color: #8A1222; /* burgundy-700 */
}

/* Buttons - Success (Ready) */
.btn-success {
  background-color: #3FA34D; /* Calm Green - Ready */
  color: #FFFFFF;
  border: none;
  border-radius: 12px; /* Button radius */
  padding: 0 24px;
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px; /* Button height */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none; /* No gradients */
}

.btn-success:hover:not(:disabled) {
  background-color: #359142; /* Darker green on hover */
}

/* Buttons - Served */
.btn-served {
  background-color: #9CA3AF; /* Muted Gray - Completed */
  color: #FFFFFF;
  border: none;
  border-radius: 12px; /* Button radius */
  padding: 0 24px;
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px; /* Button height */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none; /* No gradients */
}

.btn-served:hover:not(:disabled) {
  background-color: #8A919A; /* Darker gray on hover */
}

/* Buttons - Destructive (Cancel) */
.btn-destructive {
  background: transparent;
  color: #5C071A; /* burgundy-900 - Critical alerts */
  border: 1px solid #5C071A;
  border-radius: 12px; /* Button radius */
  padding: 0 24px;
  font-size: 14px; /* Button Text */
  font-weight: 600;
  line-height: 1.2;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 150ms ease-out;
  height: 44px; /* Button height */
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-destructive:hover:not(:disabled) {
  background-color: rgba(92, 7, 26, 0.05);
}

.btn-full {
  width: 100%;
}

.btn-action {
  flex: 1;
}

.btn-icon {
  background-color: transparent;
  color: #0b0706;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 400;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  transition: all 120ms ease-out;
  text-decoration: underline;
}

.btn-icon:hover {
  color: #525252;
}

.btn-link {
  background: none;
  border: none;
  color: #4A1A28;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  transition: all 120ms ease-out;
}

.btn-link:hover {
  opacity: 0.8;
}

/* Controls */
.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.search-input-wrapper {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-input-wrapper-kitchen {
  flex: 0 1 auto;
  max-width: 250px;
}

.input-field,
.select-field {
  width: 100%;
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 8px;
  padding: 12px 16px; /* internal card padding */
  font-size: 14px; /* Body Text */
  font-weight: 400;
  line-height: 1.6;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0b0706;
  min-height: 44px; /* Match button height */
  transition: all 150ms ease-out;
  box-sizing: border-box;
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: #8A1222; /* burgundy-700 */
  box-shadow: 0 0 0 3px rgba(138, 18, 34, 0.1);
}

.input-field::placeholder {
  color: #737373;
}

.select-field {
  cursor: pointer;
}

.kitchen-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0;
}

.kitchen-controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auto-refresh-toggle {
  display: flex;
  align-items: center;
  gap: 8px; /* icon/text spacing */
  padding: 6px 10px;
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 8px;
  white-space: nowrap;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 13px;
  font-weight: 400;
  color: #737373;
  cursor: pointer;
}

/* Kitchen Banner */
.kitchen-banner {
  background-color: #6E0D1C; /* burgundy-800 */
  color: #FFFFFF;
  text-align: center;
  padding: 8px;
}

.kitchen-banner-text {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  background-color: #3FA34D; /* Calm Green - Ready */
  color: #FFFFFF;
  padding: 16px 24px;
  border-radius: 12px;
  animation: slide-in 150ms ease-out;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06);
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toast-text {
  flex: 1;
}

.toast-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.toast-message {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.toast-close {
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 120ms ease-out;
}

.toast-close:hover {
  opacity: 0.8;
}

/* Content */
.content,
.content-full {
  padding: 16px 24px;
}

.content {
  max-width: 1440px; /* Grid max width */
  margin: 0 auto;
}

.content-full {
  width: 100%;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 48px 16px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 8px 0;
}

.empty-state-text {
  font-size: 15px;
  color: #737373;
  margin: 0;
}

.error-card {
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-left: 4px solid #5C071A; /* burgundy-900 - Critical alerts */
  border-radius: 16px; /* Card border radius */
  padding: 24px; /* section spacing */
  text-align: center;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
  transition: all 150ms ease-out;
}

.error-title {
  font-size: 18px; /* Section Header */
  font-weight: 600;
  line-height: 1.4;
  color: #5C071A; /* burgundy-900 */
  margin: 0 0 8px 0;
}

.error-message {
  font-size: 15px;
  color: #737373;
  margin: 0 0 16px 0;
}

/* Kanban Board */
.kanban-board {
  width: 100%;
}

.kanban-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  min-height: calc(100vh - 240px);
}

.kanban-column {
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 16px; /* Card border radius */
  overflow: hidden;
  min-height: calc(100vh - 240px);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
}

.kanban-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.kanban-header-pending {
  background-color: #F4C430; /* Amber - Pending */
  color: #0b0706;
}

.kanban-header-preparing {
  background-color: #E09F3E; /* Warm Orange - Preparing */
  color: #FFFFFF;
}

.kanban-header-ready {
  background-color: #3FA34D; /* Calm Green - Ready */
  color: #FFFFFF;
}

.kanban-header-served {
  background-color: #9CA3AF; /* Muted Gray - Completed */
  color: #FFFFFF;
  opacity: 0.9;
}

.kanban-header-content {
  display: flex;
  flex-direction: column;
}

.kanban-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.kanban-subtitle {
  font-size: 12px;
  margin: 0;
  opacity: 0.9;
}

.kanban-count {
  background-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  min-width: 32px;
  text-align: center;
}

.kanban-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px; /* internal card padding */
  display: flex;
  flex-direction: column;
  gap: 16px; /* internal card padding */
  background-color: #FAFAF8; /* canvas-100 */
}

.kanban-card {
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 16px; /* Card border radius */
  padding: 16px; /* internal card padding (min) */
  transition: all 150ms ease-out;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
}

.kanban-card:hover {
  border-color: #D4D4D3;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.08);
}

.kanban-card-pending {
  border-color: #F4C430; /* Amber - Pending */
}

.kanban-card-preparing {
  border-color: #E09F3E; /* Warm Orange - Preparing */
}

.kanban-card-ready {
  border-color: #3FA34D; /* Calm Green - Ready */
}

.kanban-card-served {
  border-color: #9CA3AF; /* Muted Gray - Completed */
  opacity: 0.8;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px; /* internal card padding */
  padding-bottom: 16px; /* internal card padding */
  border-bottom: 1px solid #ECEAE5; /* canvas-300 */
}

.order-card-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-label {
  font-size: 13px;
  font-weight: 500;
  color: #0b0706;
}

.time-meta {
  font-size: 13px;
  font-weight: 400;
  color: #737373;
}

.order-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-id {
  font-size: 13px;
  color: #737373;
  background-color: #F5F5F4;
  padding: 4px 8px;
  border-radius: 6px;
}

.table-number {
  font-size: 18px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 16px 0;
}

.table-number-small {
  font-size: 16px;
  font-weight: 600;
  color: #0b0706;
  margin: 0;
}

.order-id-small {
  font-size: 13px;
  color: #737373;
  margin: 4px 0;
}

.ready-alert {
  background-color: rgba(63, 163, 77, 0.15); /* Calm Green with opacity */
  border: 1px solid #3FA34D; /* Calm Green - Ready */
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 16px; /* internal card padding */
}

.ready-alert-text {
  font-size: 13px;
  color: #3FA34D; /* Calm Green */
  font-weight: 500;
  margin: 0;
}

.order-items {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 15px;
}

.item-name {
  font-size: 15px;
  font-weight: 400;
  color: #0b0706;
}

.item-price {
  font-size: 15px;
  font-weight: 500;
  color: #0b0706;
}

.order-items-summary {
  margin-bottom: 16px;
}

.order-item-summary {
  font-size: 15px;
  color: #0b0706;
  padding: 4px 0;
}

.order-items-more {
  font-size: 13px;
  color: #737373;
  margin: 4px 0;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px; /* internal card padding */
  border-top: 1px solid #ECEAE5; /* canvas-300 */
  margin-bottom: 16px; /* internal card padding */
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: #0b0706;
}

.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #0b0706;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.empty-column-text {
  font-size: 13px;
  color: #A3A3A2;
  margin: 0;
}

/* Scrollbar */
.kanban-content::-webkit-scrollbar {
  width: 6px;
}

.kanban-content::-webkit-scrollbar-track {
  background: #F4F3EF; /* canvas-200 */
  border-radius: 3px;
}

.kanban-content::-webkit-scrollbar-thumb {
  background: #D4D4D3;
  border-radius: 3px;
}

.kanban-content::-webkit-scrollbar-thumb:hover {
  background: #A3A3A2;
}

/* Regular Grid Layout */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.order-card {
  background-color: #FFFFFF; /* surface-white */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 16px; /* Card border radius */
  padding: 16px; /* internal card padding (min) */
  transition: all 150ms ease-out;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06); /* Card shadow */
}

.order-card:hover {
  border-color: #D4D4D3;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.08);
}

.order-card-pending {
  border-color: #F4C430; /* Amber - Pending */
}

.order-card-preparing {
  border-color: #E09F3E; /* Warm Orange - Preparing */
}

.order-card-ready-regular {
  border-color: #3FA34D; /* Calm Green - Ready */
}

.order-card-served-regular {
  border-color: #9CA3AF; /* Muted Gray - Completed */
  opacity: 0.9;
}

.order-card-cancelled {
  border-color: #5C071A; /* burgundy-900 - Overdue */
}

.order-card-header-regular {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px; /* internal card padding */
  padding-bottom: 16px; /* internal card padding */
  border-bottom: 1px solid #ECEAE5; /* canvas-300 */
}

.order-time-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-primary {
  font-size: 13px;
  font-weight: 500;
  color: #0b0706;
}

.time-secondary {
  font-size: 13px;
  font-weight: 400;
  color: #737373;
}

.order-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge-pending {
  background-color: rgba(244, 196, 48, 0.15); /* Amber */
  color: #D97706;
}

.status-badge-preparing {
  background-color: rgba(224, 159, 62, 0.15); /* Warm Orange */
  color: #E09F3E;
}

.status-badge-ready {
  background-color: rgba(63, 163, 77, 0.15); /* Calm Green */
  color: #3FA34D;
}

.status-badge-served {
  background-color: rgba(156, 163, 175, 0.15); /* Muted Gray */
  color: #9CA3AF;
}

.status-badge-cancelled {
  background-color: rgba(92, 7, 26, 0.15); /* burgundy-900 */
  color: #5C071A;
}

.order-main-info {
  margin-bottom: 16px;
}

.table-number-regular {
  font-size: 18px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 4px 0;
}

.order-id-regular {
  font-size: 13px;
  font-weight: 400;
  color: #737373;
  margin: 0;
}

.order-items-section {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item-regular {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  padding: 8px 0;
}

.item-name-regular {
  font-size: 15px;
  font-weight: 400;
  color: #0b0706;
}

.item-price-regular {
  font-size: 15px;
  font-weight: 500;
  color: #0b0706;
}

/* Time Metadata Section */
.time-metadata-section {
  background-color: #F4F3EF; /* canvas-200 */
  border: 1px solid #ECEAE5; /* canvas-300 */
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px; /* internal card padding */
}

.time-metadata-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.time-metadata-label {
  font-size: 13px;
  font-weight: 400;
  color: #737373;
}

.time-metadata-value {
  font-size: 13px;
  font-weight: 500;
  color: #0b0706;
}

.time-metadata-value.time-alert {
  color: #5C071A; /* burgundy-900 - Critical alerts */
}

.order-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px; /* internal card padding */
  border-top: 1px solid #ECEAE5; /* canvas-300 */
  margin-bottom: 16px; /* internal card padding */
}

.total-label-regular {
  font-size: 16px;
  font-weight: 600;
  color: #0b0706;
}

.total-amount-regular {
  font-size: 20px;
  font-weight: 600;
  color: #0b0706;
}

.order-actions-regular {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.order-summary {
  margin: 8px 0;
}

.order-summary-text {
  font-size: 13px;
  color: #737373;
  margin: 0 0 4px 0;
}

.order-summary-total {
  font-size: 15px;
  font-weight: 500;
  color: #0b0706;
  margin: 0;
}

.order-time-small {
  font-size: 13px;
  color: #737373;
  margin: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .orders-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
  
  .kanban-grid {
    grid-template-columns: 1fr;
  }
  
  .controls-bar {
    flex-direction: column;
  }
  
  .search-input-wrapper,
  .search-input-wrapper-kitchen {
    width: 100%;
  }
}
</style>
