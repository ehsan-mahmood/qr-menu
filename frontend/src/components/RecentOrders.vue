<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            id="autoRefreshOrders"
            :checked="autoRefresh"
            @change="$emit('update:autoRefresh', $event.target.checked)"
            class="rounded cursor-pointer"
            title="Automatically refresh orders every 10 seconds"
          />
          <label for="autoRefreshOrders" class="cursor-pointer">
            Auto-refresh
          </label>
        </div>
        <button
          @click="$emit('refresh')"
          class="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
          title="Refresh orders"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
    
    <div v-if="orders && orders.length > 0" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Table</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
            <th class="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.orderId"
            class="border-b border-gray-100 transition-all"
            :class="getRowClass(order)"
          >
            <td class="py-3 px-4 font-medium text-gray-900">
              Table {{ order.tableNumber || 'N/A' }}
            </td>
            <td class="py-3 px-4 text-gray-600 font-mono text-sm">
              #{{ order.orderId.slice(-6) }}
            </td>
            <td class="py-3 px-4 text-right font-semibold text-gray-900">
              ${{ order.totalAmount.toFixed(2) }}
            </td>
            <td class="py-3 px-4">
              <span
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="getStatusBadgeClass(order.status)"
              >
                {{ formatStatus(order.status) }}
              </span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">
              {{ formatTime(order.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else class="text-center py-8 text-gray-500">
      No recent orders
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Recent Orders',
  },
  orders: {
    type: Array,
    default: () => [],
  },
  newOrderIds: {
    type: Set,
    default: () => new Set(),
  },
  autoRefresh: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['refresh', 'update:autoRefresh'])

const getRowClass = (order) => {
  const classes = []
  if (props.newOrderIds && props.newOrderIds.has(order.orderId)) {
    classes.push('bg-green-50 border-l-4 border-green-500')
  }
  classes.push('hover:bg-gray-50')
  return classes.join(' ')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    served: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    cancelled: 'Cancelled',
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
</script>
