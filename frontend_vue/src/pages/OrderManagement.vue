<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm sticky top-0 z-10">
      <div :class="kitchenMode ? 'w-full px-4 py-3' : 'container mx-auto px-4 py-4'">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold text-gray-900">Order Management</h1>
          <div class="flex items-center gap-3">
            <button
              v-if="kitchenMode"
              @click="kitchenMode = false"
              class="text-sm px-3 py-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Exit kitchen mode and return to regular grid view"
            >
              Exit Kitchen Mode
            </button>
            <button
              v-else
              @click="kitchenMode = true"
              class="text-sm px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors font-medium"
              title="Switch to kitchen mode (Kanban board view)"
            >
              👨‍🍳 Kitchen Mode
            </button>
            <button
              @click="handleLogout"
              class="text-sm px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Log out of your account"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Search and Filter Bar (Hidden in Kitchen Mode) -->
        <div v-if="!kitchenMode" class="flex flex-wrap gap-3 mb-4">
          <!-- Search Input -->
          <div class="flex-1 min-w-[200px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by table number..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <!-- Refresh Button -->
          <button
            @click="loadOrders"
            :disabled="loading"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh orders list"
          >
            <span>🔄</span>
            <span>{{ loading ? 'Loading...' : 'Refresh Orders' }}</span>
          </button>
        </div>

        <!-- Kitchen Mode Controls -->
        <div v-if="kitchenMode" class="flex items-center justify-between mb-4">
          <!-- Search in Kitchen Mode (Simplified) -->
          <div class="flex-1 max-w-xs">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search table..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
            <!-- Refresh and Controls -->
          <div class="flex items-center gap-4">
            <button
              @click="showFullDetails = !showFullDetails"
              class="px-4 py-2 bg-white bg-opacity-20 text-charcoal rounded-lg hover:bg-opacity-30 text-sm font-medium flex items-center gap-2"
              :title="showFullDetails ? 'Switch to summary view (shows fewer details)' : 'Switch to full details view (shows all items)'"
            >
              <span>{{ showFullDetails ? '📋' : '📄' }}</span>
              <span>{{ showFullDetails ? 'Summary View' : 'Full Details View' }}</span>
            </button>
            <button
              @click="loadOrders"
              :disabled="loading"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Refresh orders list"
            >
              <span>🔄</span>
              <span>{{ loading ? 'Loading...' : 'Refresh Orders' }}</span>
            </button>
            <div class="flex items-center gap-2 text-sm bg-white bg-opacity-10 px-3 py-2 rounded-lg">
              <input
                type="checkbox"
                id="autoRefreshKitchen"
                v-model="autoRefresh"
                class="rounded cursor-pointer"
                title="Automatically refresh orders every 10 seconds"
              />
              <label for="autoRefreshKitchen" class="text-charcoal cursor-pointer font-medium">
                Auto-refresh (10s)
              </label>
            </div>
          </div>
        </div>

        <!-- Auto-refresh Toggle (Regular Mode) -->
        <div v-if="!kitchenMode" class="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="autoRefreshRegular"
            v-model="autoRefresh"
            class="rounded cursor-pointer"
            title="Automatically refresh orders every 10 seconds"
          />
          <label for="autoRefreshRegular" class="text-gray-700 cursor-pointer font-medium">
            Auto-refresh every 10 seconds
          </label>
        </div>
      </div>
    </div>

    <!-- Kitchen Mode Banner -->
    <div v-if="kitchenMode" class="bg-orange-500 text-white text-center py-2 shadow-md">
      <p class="font-bold text-lg">👨‍🍳 KITCHEN MODE</p>
    </div>

    <!-- Toast Notifications -->
    <div
      v-if="notification"
      class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-in"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl" title="Notification">🔔</span>
        <div>
          <p class="font-bold">{{ notification.title }}</p>
          <p class="text-sm">{{ notification.message }}</p>
        </div>
        <button 
          @click="notification = null" 
          class="ml-4 px-2 py-1 text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          title="Close notification"
          aria-label="Close notification"
        >
          ✕ Close
        </button>
      </div>
    </div>

    <div :class="kitchenMode ? 'w-full px-2 py-4' : 'container mx-auto px-4 py-6 max-w-7xl'">
      <!-- Loading State -->
      <div v-if="loading && orders.length === 0" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Loading orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border border-red-200 text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <h3 class="text-lg font-bold text-red-900 mb-2">Failed to Load Orders</h3>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button @click="loadOrders" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
        <p class="text-gray-600">
          {{ statusFilter || searchQuery ? 'Try adjusting your filters.' : 'No orders yet.' }}
        </p>
      </div>

      <!-- Kitchen Mode: Kanban Board Layout -->
      <div v-if="kitchenMode && filteredOrders.length > 0" class="kanban-board w-full">
        <div class="grid grid-cols-4 gap-3 h-full" style="min-height: calc(100vh - 180px);">
          <!-- Pending Column -->
          <div class="kanban-column">
            <div class="kanban-header bg-yellow-500">
              <div class="flex flex-col">
                <h3 class="text-white font-bold text-lg">📋 Pending</h3>
                <p class="text-xs text-yellow-100">New orders</p>
              </div>
              <span class="badge-count">{{ getOrdersByStatus('pending').length }}</span>
            </div>
            <div class="kanban-column-content">
              <div
                v-for="order in getOrdersByStatus('pending')"
                :key="order.orderId"
                class="kanban-card bg-white rounded-lg shadow-md p-5 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow"
              >
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-2xl font-bold text-gray-900">Table {{ order.tableNumber || 'N/A' }}</h3>
                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{{ order.orderId.slice(-6) }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-gray-600">
                    <span>⏰ {{ formatTime(order.createdAt) }}</span>
                    <span>•</span>
                    <span>{{ getProcessingTime(order) }}</span>
                  </div>
                </div>
                <div class="mb-4 space-y-2">
                  <div v-for="(item, idx) in order.items" :key="idx" class="flex items-center justify-between text-base py-1 border-b border-gray-100 last:border-0">
                    <span class="text-gray-800 font-medium">
                      {{ item.quantity }}x {{ item.name || item.menu_item_id }}
                    </span>
                    <span class="text-gray-600 text-sm">
                      ${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}
                    </span>
                  </div>
                </div>
                <div class="mb-4 pt-3 border-t-2 border-gray-200">
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold text-gray-700">Total:</span>
                    <span class="text-2xl font-bold text-orange-600">${{ order.totalAmount.toFixed(2) }}</span>
                  </div>
                </div>
                <button
                  @click="updateOrderStatus(order.orderId, 'preparing')"
                  :disabled="updatingOrder === order.orderId"
                  class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-base font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  title="Move order to Preparing status"
                >
                  <span>→</span>
                  <span>Move to Preparing</span>
                </button>
              </div>
              <div v-if="getOrdersByStatus('pending').length === 0" class="empty-column">
                <p class="text-gray-400 text-sm">No pending orders</p>
              </div>
            </div>
          </div>

          <!-- Preparing Column -->
          <div class="kanban-column">
            <div class="kanban-header bg-blue-500">
              <div class="flex flex-col">
                <h3 class="text-white font-bold text-lg">👨‍🍳 Preparing</h3>
                <p class="text-xs text-blue-100">In kitchen</p>
              </div>
              <span class="badge-count">{{ getOrdersByStatus('preparing').length }}</span>
            </div>
            <div class="kanban-column-content">
              <div
                v-for="order in getOrdersByStatus('preparing')"
                :key="order.orderId"
                class="kanban-card bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
              >
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="text-xl font-bold text-gray-900">Table {{ order.tableNumber || 'N/A' }}</h3>
                    <div class="flex items-center gap-2">
                      <button
                        @click.stop="printDocket(order)"
                        class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        title="Print kitchen docket"
                      >
                        🖨️ Print
                      </button>
                      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{{ order.orderId.slice(-6) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <span>⏰ {{ formatTime(order.createdAt) }}</span>
                    <span>•</span>
                    <span>{{ getProcessingTime(order) }}</span>
                  </div>
                </div>
                
                <!-- Full Details View -->
                <div v-if="showFullDetails || expandedOrders.has(order.orderId)" class="mb-3 space-y-1.5">
                  <div v-for="(item, idx) in order.items" :key="idx" class="flex items-center justify-between text-sm py-0.5 border-b border-gray-100 last:border-0">
                    <span class="text-gray-800 font-medium">
                      {{ item.quantity }}x {{ item.name || item.menu_item_id }}
                    </span>
                    <span class="text-gray-600 text-xs">
                      ${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}
                    </span>
                  </div>
                </div>
                
                <!-- Summary View -->
                <div v-else class="mb-3">
                  <div class="text-sm text-gray-700">
                    <div v-for="(item, idx) in order.items.slice(0, 2)" :key="idx" class="py-0.5">
                      {{ item.quantity }}x {{ item.name || item.menu_item_id }}
                    </div>
                    <p v-if="order.items.length > 2" class="text-xs text-gray-500 mt-1">
                      +{{ order.items.length - 2 }} more items
                    </p>
                  </div>
                  <button
                    @click="expandedOrders.add(order.orderId)"
                    class="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {{ order.items.length }} items →
                  </button>
                </div>
                
                <div class="mb-3 pt-2 border-t border-gray-200">
                  <div class="flex items-center justify-between">
                    <span class="text-base font-semibold text-gray-700">Total:</span>
                    <span class="text-xl font-bold text-orange-600">${{ order.totalAmount.toFixed(2) }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <button
                    @click="updateOrderStatus(order.orderId, 'ready')"
                    :disabled="updatingOrder === order.orderId"
                    class="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    title="Mark order as ready for pickup"
                  >
                    <span>✓</span>
                    <span>Mark Ready for Pickup</span>
                  </button>
                  <button
                    @click="updateOrderStatus(order.orderId, 'cancelled')"
                    :disabled="updatingOrder === order.orderId"
                    class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-xs font-medium"
                    title="Cancel this order"
                  >
                    ✕ Cancel Order
                  </button>
                </div>
              </div>
              <div v-if="getOrdersByStatus('preparing').length === 0" class="empty-column">
                <p class="text-gray-400 text-sm">No orders preparing</p>
              </div>
            </div>
          </div>

          <!-- Ready Column -->
          <div class="kanban-column">
            <div class="kanban-header bg-green-500">
              <div class="flex flex-col">
                <h3 class="text-white font-bold text-lg">✅ Ready</h3>
                <p class="text-xs text-green-100">Ready for pickup</p>
              </div>
              <span class="badge-count">{{ getOrdersByStatus('ready').length }}</span>
            </div>
            <div class="kanban-column-content">
              <div
                v-for="order in getOrdersByStatus('ready')"
                :key="order.orderId"
                class="kanban-card bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-500 hover:shadow-xl transition-shadow ring-2 ring-green-200"
              >
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="text-xl font-bold text-gray-900">Table {{ order.tableNumber || 'N/A' }}</h3>
                    <div class="flex items-center gap-2">
                      <button
                        @click.stop="printDocket(order)"
                        class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        title="Print kitchen docket"
                      >
                        🖨️ Print
                      </button>
                      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{{ order.orderId.slice(-6) }}</span>
                    </div>
                  </div>
                  <div class="bg-orange-50 border border-orange-200 rounded-lg p-1.5 mb-1.5">
                    <p class="text-xs text-orange-700 font-semibold flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Ready for pickup • {{ getProcessingTime(order) }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <span>⏰ {{ formatTime(order.createdAt) }}</span>
                  </div>
                </div>
                
                <!-- Full Details View -->
                <div v-if="showFullDetails || expandedOrders.has(order.orderId)" class="mb-3 space-y-1.5">
                  <div v-for="(item, idx) in order.items" :key="idx" class="flex items-center justify-between text-sm py-0.5 border-b border-gray-100 last:border-0">
                    <span class="text-gray-800 font-semibold">
                      {{ item.quantity }}x {{ item.name || item.menu_item_id }}
                    </span>
                    <span class="text-gray-600 text-xs">
                      ${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}
                    </span>
                  </div>
                </div>
                
                <!-- Summary View -->
                <div v-else class="mb-3">
                  <div class="text-sm text-gray-700">
                    <div v-for="(item, idx) in order.items.slice(0, 2)" :key="idx" class="py-0.5">
                      {{ item.quantity }}x {{ item.name || item.menu_item_id }}
                    </div>
                    <p v-if="order.items.length > 2" class="text-xs text-gray-500 mt-1">
                      +{{ order.items.length - 2 }} more items
                    </p>
                  </div>
                  <button
                    @click="expandedOrders.add(order.orderId)"
                    class="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {{ order.items.length }} items →
                  </button>
                </div>
                
                <div class="mb-3 pt-2 border-t border-gray-200">
                  <div class="flex items-center justify-between">
                    <span class="text-base font-semibold text-gray-700">Total:</span>
                    <span class="text-xl font-bold text-orange-600">${{ order.totalAmount.toFixed(2) }}</span>
                  </div>
                </div>
                <button
                  @click="updateOrderStatus(order.orderId, 'served')"
                  :disabled="updatingOrder === order.orderId"
                  class="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 text-base font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  title="Mark order as served to customer"
                >
                  <span>✓</span>
                  <span>Mark as Served</span>
                </button>
              </div>
              <div v-if="getOrdersByStatus('ready').length === 0" class="empty-column">
                <p class="text-gray-400 text-sm">No orders ready</p>
              </div>
            </div>
          </div>

          <!-- Served Column (Compact) -->
          <div class="kanban-column">
            <div class="kanban-header bg-purple-500">
              <div class="flex flex-col">
                <h3 class="text-white font-bold text-lg">✓ Served</h3>
                <p class="text-xs text-purple-100">Completed</p>
              </div>
              <span class="badge-count">{{ getOrdersByStatus('served').length }}</span>
            </div>
            <div class="kanban-column-content">
              <div
                v-for="order in getOrdersByStatus('served')"
                :key="order.orderId"
                class="kanban-card bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 opacity-70"
              >
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="text-xl font-bold text-gray-700">Table {{ order.tableNumber || 'N/A' }}</h3>
                    <button
                      @click.stop="printDocket(order)"
                      class="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                      title="Print kitchen docket"
                    >
                      🖨️
                    </button>
                  </div>
                  <p class="text-xs text-gray-400">#{{ order.orderId.slice(-6) }}</p>
                </div>
                <div class="mb-2">
                  <p class="text-sm text-gray-600">{{ order.items?.length }} items</p>
                  <p class="text-base font-semibold text-gray-700">${{ order.totalAmount.toFixed(2) }}</p>
                </div>
                <p class="text-xs text-gray-500">{{ formatTime(order.createdAt) }}</p>
              </div>
              <div v-if="getOrdersByStatus('served').length === 0" class="empty-column">
                <p class="text-gray-400 text-sm">No served orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Mode: Grid Layout -->
      <div v-else-if="!kitchenMode && filteredOrders.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="card hover:shadow-lg transition-shadow"
          :class="getStatusCardClass(order.status)"
        >
          <!-- Order Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">
                Table {{ order.tableNumber || 'N/A' }}
              </h3>
              <p class="text-sm text-gray-500">Order #{{ order.orderId.slice(-6) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click.stop="printDocket(order)"
                class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                title="Print kitchen docket"
              >
                🖨️ Print
              </button>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getStatusBadgeClass(order.status)"
              >
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>

          <!-- Order Items -->
          <div class="mb-4 space-y-2">
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-700">
                {{ item.quantity }}x {{ item.name || item.menu_item_id }}
              </span>
              <span class="text-gray-600 font-medium">
                ${{ ((item.price || item.price_cents / 100) * (item.quantity || 1)).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Time Tracking -->
          <div class="mb-4 p-3 bg-gray-50 rounded-lg space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-600">Received:</span>
              <span class="font-medium">{{ formatTime(order.createdAt) }}</span>
            </div>
            <div v-if="order.updatedAt !== order.createdAt" class="flex justify-between">
              <span class="text-gray-600">Last Updated:</span>
              <span class="font-medium">{{ formatTime(order.updatedAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Processing Time:</span>
              <span class="font-medium text-orange-600">{{ getProcessingTime(order) }}</span>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="mb-4 flex items-center justify-between border-t pt-3">
            <span class="font-bold text-gray-900">Total:</span>
            <span class="text-xl font-bold text-orange-600">
              ${{ order.totalAmount.toFixed(2) }}
            </span>
          </div>

          <!-- Status Update Buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              v-if="order.status === 'pending'"
              @click="updateOrderStatus(order.orderId, 'preparing')"
              :disabled="updatingOrder === order.orderId"
              class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-1"
              title="Move order to Preparing status"
            >
              <span>→</span>
              <span>Move to Preparing</span>
            </button>
            <button
              v-if="order.status === 'preparing'"
              @click="updateOrderStatus(order.orderId, 'ready')"
              :disabled="updatingOrder === order.orderId"
              class="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-1"
              title="Mark order as ready for pickup"
            >
              <span>✓</span>
              <span>Mark Ready</span>
            </button>
            <button
              v-if="order.status === 'ready'"
              @click="updateOrderStatus(order.orderId, 'served')"
              :disabled="updatingOrder === order.orderId"
              class="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-1"
              title="Mark order as served to customer"
            >
              <span>✓</span>
              <span>Mark Served</span>
            </button>
            <button
              v-if="['pending', 'preparing'].includes(order.status)"
              @click="updateOrderStatus(order.orderId, 'cancelled')"
              :disabled="updatingOrder === order.orderId"
              class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
              title="Cancel this order"
            >
              ✕ Cancel
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
const showFullDetails = ref(true) // Toggle between full details and summary view
const expandedOrders = ref(new Set()) // Track which orders are expanded in summary mode
let refreshInterval = null

// Computed
const filteredOrders = computed(() => {
  let filtered = [...orders.value]

  // Filter by status (only in regular mode, kitchen mode shows all)
  if (!kitchenMode.value && statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  // Filter by table number
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.tableNumber && order.tableNumber.toLowerCase().includes(query)
    )
  }

  // Exclude cancelled orders from kitchen mode
  if (kitchenMode.value) {
    filtered = filtered.filter(order => order.status !== 'cancelled')
  }

  // Sort: pending first, then by time
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

// Methods for Kanban board
const getOrdersByStatus = (status) => {
  return filteredOrders.value.filter(order => order.status === status)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Oldest first in each column
}

// Methods
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
    
    // Track previous order count for notifications
    const previousCount = orders.value.length
    const previousOrderIds = new Set(orders.value.map(o => o.orderId))
    
    // Handle both response formats (direct data or wrapped in data property)
    const newOrders = response.data || response || []
    orders.value = Array.isArray(newOrders) ? newOrders : []
    
    // Show notification for new orders
    if (previousCount > 0 && orders.value.length > previousCount) {
      const addedOrders = orders.value.filter(o => !previousOrderIds.has(o.orderId))
      if (addedOrders.length > 0) {
        showNotification(
          'New Order!',
          `${addedOrders.length} new order${addedOrders.length > 1 ? 's' : ''} received`
        )
        // Play notification sound (optional)
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
    
    // Update local order
    const order = orders.value.find(o => o.orderId === orderId)
    if (order) {
      order.status = newStatus
      order.updatedAt = new Date().toISOString()
      
      // Add to status history if it exists
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

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    served: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusCardClass = (status) => {
  const classes = {
    pending: 'border-l-4 border-yellow-500',
    preparing: 'border-l-4 border-blue-500',
    ready: 'border-l-4 border-green-500',
    served: 'border-l-4 border-purple-500',
    cancelled: 'border-l-4 border-red-500'
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
  // Simple notification sound using Web Audio API
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
    // Ignore audio errors
    console.log('Could not play notification sound')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const printDocket = (order) => {
  // Create a hidden iframe for printing (no new tab)
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  
  let printTriggered = false // Flag to prevent duplicate print dialogs
  
  const triggerPrint = () => {
    if (printTriggered) return // Already printed, don't trigger again
    printTriggered = true
    
    if (iframe.contentWindow) {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      // Remove iframe after printing (or after cancel)
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
  
  // Wait for content to load, then print (only once)
  iframe.onload = () => {
    setTimeout(() => {
      triggerPrint()
    }, 250)
  }
  
  // Fallback if onload doesn't fire (but only if print hasn't been triggered)
  setTimeout(() => {
    if (!printTriggered) {
      triggerPrint()
    }
  }, 500)
}

// Auto-refresh setup
watch(autoRefresh, (enabled) => {
  if (enabled) {
    refreshInterval = setInterval(() => {
      loadOrders()
    }, 10000) // Refresh every 10 seconds
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }
})

// Lifecycle
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

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.card {
  @apply bg-white rounded-lg shadow p-5;
}

/* Kanban Board Styles */
.kanban-board {
  @apply w-full;
}

.kanban-column {
  @apply flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200;
  min-height: calc(100vh - 180px);
  min-width: 0; /* Allow columns to shrink if needed */
}

.kanban-header {
  @apply px-4 py-3 text-white flex items-center justify-between sticky top-0 z-10 shadow-md;
  min-height: 70px;
}

.badge-count {
  @apply bg-white bg-opacity-30 text-white font-bold px-3 py-1 rounded-full text-base;
  min-width: 2rem;
  text-align: center;
}

.kanban-column-content {
  @apply flex-1 overflow-y-auto p-3 space-y-3;
  max-height: calc(100vh - 240px);
}

.kanban-card {
  @apply bg-white rounded-lg shadow-sm;
  transition: all 0.2s ease;
}

.kanban-card:hover {
  @apply shadow-md;
}

.empty-column {
  @apply flex items-center justify-center py-12 text-center;
}

/* Scrollbar styling for kanban columns */
.kanban-column-content::-webkit-scrollbar {
  width: 6px;
}

.kanban-column-content::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.kanban-column-content::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded;
}

.kanban-column-content::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}
</style>

