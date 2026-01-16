<template>
    <div class="min-h-screen" style="background-color: #FEFDF9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <!-- Header -->
    <div class="sticky top-0 z-10" style="background-color: #FEFDF9; border-bottom: 1px solid #E8E4DD;">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button @click="goBack" class="transition-colors" style="color: #2F2A25;">
            <span class="text-2xl">←</span>
          </button>
          <h1 class="text-xl font-bold" style="color: #2F2A25; font-weight: 700;">Your Basket</h1>
          <div class="w-8"></div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="isEmpty" class="container mx-auto px-4 py-12 text-center">
      <div class="max-w-md mx-auto">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold mb-2" style="color: #2F2A25; font-weight: 700;">Your basket is empty</h2>
        <p class="mb-6 font-normal" style="color: #6E6159;">Add some delicious items from the menu!</p>
        <button @click="goToMenu" class="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style="background-color: #2F2A25; font-weight: 600;">
          Browse Menu
        </button>
      </div>
    </div>
    
    <!-- Basket Items -->
    <div v-else class="container mx-auto px-4 py-6 pb-32">
      <!-- Customer Information -->
      <div class="mb-4 rounded-xl overflow-hidden shadow-sm" style="background-color: #FFFFFF; border: 1px solid #E8E4DD;">
        <div class="p-4">
          <h3 class="font-bold mb-3" style="color: #2F2A25; font-weight: 700;">Customer Information</h3>
          
          <!-- Show existing table number if from QR -->
          <div v-if="qrStore.tableNumber && !showCustomerInput && !basketStore.tableNumber && !basketStore.customerName" class="rounded-lg p-4 mb-3" style="background-color: #FAF8F3; border: 1px solid #E8E4DD;">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold" style="color: #2F2A25;">Table Number</p>
                <p class="text-lg font-bold" style="color: #2F2A25;">{{ qrStore.tableNumber }}</p>
              </div>
              <button
                @click="showCustomerInput = true"
                class="text-sm underline font-semibold transition-colors hover:opacity-80"
                style="color: #2F2A25;"
              >
                Change
              </button>
            </div>
          </div>
          
          <!-- Customer Input (Table Number or Name) -->
          <div v-if="showCustomerInput || (!qrStore.tableNumber && !basketStore.tableNumber && !basketStore.customerName)" class="space-y-3">
            <div>
              <label class="block text-sm font-semibold mb-1" style="color: #2F2A25;">
                Table Number <span class="font-normal" style="color: #6E6159;">(or)</span> Your Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="customerInput"
                type="text"
                placeholder="e.g., 'Table 5' or 'John Doe'"
                class="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style="border-color: #E8E4DD; background-color: #FFFFFF; color: #2F2A25; font-style: italic;"
                required
                @input="updateCustomerInfo"
                @focus="(e) => { e.target.style.fontStyle = 'normal'; e.target.style.borderColor = '#2F2A25'; }"
                @blur="(e) => { if(!e.target.value) e.target.style.fontStyle = 'italic'; e.target.style.borderColor = '#E8E4DD'; }"
              />
              <p class="text-xs mt-1 font-normal" style="color: #6E6159;">
                Enter your table number if dining in, or your name for takeout
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Items List -->
      <div class="space-y-3 mb-6">
        <div
          v-for="item in items"
          :key="item.id"
          class="rounded-xl overflow-hidden shadow-sm"
          style="background-color: #FFFFFF; border: 1px solid #E8E4DD;"
        >
          <div class="p-4 flex gap-4">
            <!-- Item Image -->
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
            
            <!-- Item Details -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold" style="color: #2F2A25; font-weight: 700;">{{ item.name }}</h3>
              <p class="text-sm font-normal mt-0.5" style="color: #6E6159;">${{ item.price.toFixed(2) }} each</p>
              
              <!-- Quantity Controls -->
              <div class="flex items-center gap-3 mt-2">
                <button
                  @click="decrementQuantity(item.id)"
                  class="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all hover:opacity-80 shadow-sm"
                  style="background-color: #F5F5F5; color: #2F2A25;"
                >
                  −
                </button>
              <span class="font-bold min-w-[2rem] text-center" style="color: #2F2A25;">
                {{ item.quantity }}
              </span>
                <button
                  @click="incrementQuantity(item.id)"
                  class="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold transition-all shadow-sm hover:opacity-90"
                  style="background-color: #2F2A25; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);"
                >
                  +
                </button>
              </div>
            </div>
            
            <!-- Item Total & Remove -->
            <div class="flex flex-col items-end justify-between">
              <button
                @click="removeItem(item.id)"
                class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style="background-color: #F5F5F5; color: #2F2A25;"
              >
                <span class="text-xl font-bold">×</span>
              </button>
              <span class="font-bold" style="color: #2F2A25; font-weight: 700;">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="rounded-xl overflow-hidden shadow-sm mt-4" style="background-color: #FAF8F3; border: 1px solid #E8E4DD;">
        <div class="p-4">
          <h3 class="font-bold mb-3" style="color: #2F2A25; font-weight: 700;">Order Summary</h3>
          <div class="space-y-2">
            <div class="flex justify-between font-normal" style="color: #6E6159;">
              <span>Subtotal ({{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }})</span>
              <span>${{ totalAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-normal" style="color: #6E6159;">
              <span>Service Fee</span>
              <span>$0.00</span>
            </div>
            <div class="pt-2 mt-2" style="border-top: 1px solid #E8E4DD;">
              <div class="flex justify-between text-lg font-bold" style="color: #2F2A25;">
                <span>Total</span>
                <span>${{ totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Special Instructions -->
      <div class="rounded-xl overflow-hidden shadow-sm mt-4" style="background-color: #FFFFFF; border: 1px solid #E8E4DD;">
        <div class="p-4">
          <label class="block text-sm font-semibold mb-2" style="color: #2F2A25;">
            Special Instructions (Optional)
          </label>
          <textarea
            v-model="specialInstructions"
            rows="3"
            class="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
            style="border-color: #E8E4DD; background-color: #FFFFFF; color: #2F2A25;"
            placeholder="Any special requests or dietary requirements?"
            @focus="(e) => e.target.style.borderColor = '#2F2A25'"
            @blur="(e) => e.target.style.borderColor = '#E8E4DD'"
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- Fixed Bottom Actions -->
    <div v-if="!isEmpty" class="fixed bottom-0 left-0 right-0 p-4 z-20" style="background-color: #FFFFFF; border-top: 1px solid #E8E4DD;">
      <div class="container mx-auto max-w-2xl space-y-2">
        <!-- Place Order Button (only shown if orderEnabled) -->
        <div v-if="orderEnabled">
          <button
            @click="submitOrder"
            :disabled="submitting || !hasCustomerInfo"
            class="w-full py-4 text-lg font-semibold rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style="background-color: #2F2A25; font-weight: 600;"
          >
            <span v-if="submitting">Submitting Order...</span>
            <span v-else-if="!hasCustomerInfo">Enter Table Number or Name</span>
            <span v-else>Place Order - ${{ totalAmount.toFixed(2) }}</span>
          </button>
        </div>
        
        <!-- Message when ordering is disabled -->
        <div v-else class="rounded-lg p-4 text-center" style="background-color: #FFF8E1; border: 1px solid #FFE082;">
          <p class="font-medium" style="color: #F57C00;">
            Ordering is currently disabled. Please contact staff for assistance.
          </p>
        </div>
        
        <button
          @click="clearBasket"
          class="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-80"
          style="background-color: #F5F5F5; color: #2F2A25; font-weight: 600;"
        >
          Clear Basket
        </button>
      </div>
    </div>
    
    <!-- Payment Modal (Demo Mode Only) -->
    <PaymentModal
      v-if="showPaymentModal"
      :show="showPaymentModal"
      :totalAmount="totalAmount"
      :orderId="orderId"
      @close="handlePaymentClose"
      @success="handlePaymentSuccess"
      @skip="handlePaymentSkip"
    />

    <!-- Success Modal -->
    <Transition name="modal">
      <div v-if="orderSuccess" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click="closeSuccessModal">
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="relative bg-white rounded-2xl p-8 max-w-md text-center" @click.stop style="background-color: #FFFFFF;">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-2xl font-bold mb-2" style="color: #2F2A25; font-weight: 700;">Order Placed!</h2>
          <p class="mb-6 font-normal" style="color: #6E6159;">
            Your order has been sent to the kitchen. We'll bring it to your table soon!
          </p>
          <div v-if="orderId" class="mb-6 p-4 rounded-lg" style="background-color: #F5F5F5;">
            <p class="text-sm font-normal" style="color: #6E6159;">Order ID</p>
            <p class="font-mono font-bold mt-1" style="color: #2F2A25;">{{ orderId }}</p>
          </div>
          <div v-if="paymentInfo" class="mb-4 p-4 rounded-lg" style="background-color: #E8F5E9;">
            <p class="text-sm font-semibold" style="color: #2E7D32;">Payment Completed</p>
            <p class="text-xs mt-1 font-normal" style="color: #4CAF50;">Transaction: {{ paymentInfo.transactionId }}</p>
          </div>
          <button @click="closeSuccessModal" class="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style="background-color: #2F2A25; font-weight: 600;">
            Done
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBasketStore } from '@/stores/basketStore'
import { useQRStore } from '@/stores/qrStore'
import { useMenuStore } from '@/stores/menuStore'
import orderService from '@/services/orderService'
import PaymentModal from '@/components/PaymentModal.vue'
import { TEST_MODE } from '@/config'

const router = useRouter()
const route = useRoute()
const basketStore = useBasketStore()
const qrStore = useQRStore()
const menuStore = useMenuStore()

const specialInstructions = ref('')
const submitting = ref(false)
const orderSuccess = ref(false)
const orderId = ref('')
const customerInput = ref('')
const showCustomerInput = ref(false)
const showPaymentModal = ref(false)
const paymentInfo = ref(null)

const items = computed(() => basketStore.items)
const itemCount = computed(() => basketStore.itemCount)
const totalAmount = computed(() => basketStore.totalAmount)
const isEmpty = computed(() => basketStore.isEmpty)
const tableNumber = computed(() => basketStore.tableNumber || qrStore.tableNumber)
const customerName = computed(() => basketStore.customerName)
const orderEnabled = computed(() => menuStore.orderEnabled)

// Check if customer info (table or name) is provided
const hasCustomerInfo = computed(() => {
  // If we have a table number from QR and user hasn't changed it
  if (qrStore.tableNumber && !showCustomerInput.value && !basketStore.tableNumber && !basketStore.customerName) {
    return true
  }
  // Otherwise check if customer has entered something
  return basketStore.tableNumber.trim() !== '' || basketStore.customerName.trim() !== '' || customerInput.value.trim() !== ''
})

// Update customer info when input changes
const updateCustomerInfo = () => {
  const input = customerInput.value.trim()
  if (input) {
    // Check if input looks like a table number (numeric or starts with "table" or "t")
    const isTableNumber = /^(table\s*)?[0-9]+([a-z])?$/i.test(input) || /^t\d+$/i.test(input) || /^\d+$/.test(input)
    if (isTableNumber) {
      // Store as table number (normalize by removing "table" prefix)
      const normalizedTable = input.replace(/^table\s*/i, '').trim()
      basketStore.setTableNumber(normalizedTable)
      basketStore.setCustomerName('')
    } else {
      // Store as customer name
      basketStore.setCustomerName(input)
      basketStore.setTableNumber('')
    }
  } else {
    // Clear both if input is empty
    basketStore.setCustomerName('')
    basketStore.setTableNumber('')
  }
}

// Initialize customer input from store
onMounted(async () => {
  // Fetch menu config to check if ordering is enabled - only if menuId is available
  if (qrStore.menuId) {
    try {
      await menuStore.fetchMenuConfig(qrStore.menuId)
    } catch (err) {
      console.error('Failed to fetch menu config:', err)
      // Continue even if config fails
    }
  }
  
  // Initialize basket store table number from QR store if available
  if (qrStore.tableNumber && !basketStore.tableNumber && !basketStore.customerName) {
    basketStore.setTableNumber(qrStore.tableNumber)
  }
  
  // Initialize customer input - only populate if user needs to enter it
  if (showCustomerInput.value || (!qrStore.tableNumber && !basketStore.tableNumber && !basketStore.customerName)) {
    if (basketStore.customerName) {
      customerInput.value = basketStore.customerName
    } else if (basketStore.tableNumber) {
      customerInput.value = basketStore.tableNumber
    }
  }
})

const incrementQuantity = (itemId) => {
  basketStore.incrementQuantity(itemId)
}

const decrementQuantity = (itemId) => {
  basketStore.decrementQuantity(itemId)
}

const removeItem = (itemId) => {
  basketStore.removeItem(itemId)
}

const clearBasket = () => {
  if (confirm('Are you sure you want to clear your basket?')) {
    basketStore.clearBasket()
    customerInput.value = ''
    showCustomerInput.value = false
  }
}

const submitOrder = async () => {
  // Validate customer info
  if (!hasCustomerInfo.value) {
    alert('Please enter your table number or name before placing an order.')
    return
  }
  
  submitting.value = true
  
  try {
    const orderData = {
      tableNumber: basketStore.tableNumber || (qrStore.tableNumber && !basketStore.customerName ? qrStore.tableNumber : null),
      customerName: basketStore.customerName || null,
      menuId: qrStore.menuId,
      merchantId: qrStore.merchantId,
      items: items.value.map(item => ({
        itemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalAmount.value,
      specialInstructions: specialInstructions.value,
    }
    
    const response = await orderService.createOrder(orderData)
    orderId.value = response.data.receivingId || response.data.orderId || 'N/A'
    
    // In demo/test mode, show payment modal (optional)
    if (TEST_MODE) {
      showPaymentModal.value = true
    } else {
      // In production, go directly to success
      orderSuccess.value = true
      basketStore.clearBasket()
      specialInstructions.value = ''
      customerInput.value = ''
    }
  } catch (err) {
    console.error('Failed to submit order:', err)
    alert('Failed to submit order. Please try again.')
  } finally {
    submitting.value = false
  }
}

const handlePaymentSuccess = (paymentData) => {
  paymentInfo.value = {
    transactionId: paymentData.payment?.transactionId || paymentData.paymentId,
    amount: paymentData.payment?.amount || totalAmount.value,
    method: paymentData.payment?.paymentMethod || 'card',
  }
  showPaymentModal.value = false
  orderSuccess.value = true
  basketStore.clearBasket()
  specialInstructions.value = ''
  customerInput.value = ''
}

const handlePaymentSkip = () => {
  showPaymentModal.value = false
  orderSuccess.value = true
  basketStore.clearBasket()
  specialInstructions.value = ''
  customerInput.value = ''
  paymentInfo.value = null
}

const handlePaymentClose = () => {
  // If user closes payment modal, treat as skip
  handlePaymentSkip()
}

const closeSuccessModal = () => {
  orderSuccess.value = false
  // Route back to menu after order is placed
  if (qrStore.menuId) {
    router.push(`/menu/${qrStore.menuId}`)
  } else {
    router.push('/menu')
  }
}

const goBack = () => {
  // Go back to menu instead of using browser back
  if (qrStore.menuId) {
    router.push(`/menu/${qrStore.menuId}`)
  } else {
    router.push('/menu')
  }
}

const goToMenu = () => {
  // Route to the specific menu if menuId is available
  if (qrStore.menuId) {
    router.push(`/menu/${qrStore.menuId}`)
  } else {
    router.push('/menu')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

