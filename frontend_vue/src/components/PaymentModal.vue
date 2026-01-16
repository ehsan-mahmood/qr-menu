<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="handleClose">
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative bg-white rounded-2xl p-6 max-w-md w-full" @click.stop style="background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold" style="color: #2F2A25; font-weight: 700;">Complete Payment</h2>
          <button
            @click="handleClose"
            class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
            style="background-color: #F5F5F5; color: #2F2A25;"
          >
            <span class="text-2xl font-bold">×</span>
          </button>
        </div>

        <!-- Order Summary -->
        <div class="rounded-lg p-4 mb-4" style="background-color: #FAF8F3; border: 1px solid #E8E4DD;">
          <p class="text-sm font-semibold mb-1" style="color: #2F2A25;">Order Total</p>
          <p class="text-2xl font-bold" style="color: #2F2A25; font-weight: 700;">${{ totalAmount.toFixed(2) }}</p>
        </div>

        <!-- Payment Method Selection -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2" style="color: #2F2A25;">
            Payment Method
          </label>
          <div class="space-y-2">
            <label
              v-for="method in paymentMethods"
              :key="method.value"
              class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="selectedMethod === method.value ? 'shadow-sm' : ''"
              :style="selectedMethod === method.value 
                ? 'border-color: #2F2A25; background-color: #FAF8F3;' 
                : 'border-color: #E8E4DD; background-color: #FFFFFF;'"
            >
              <input
                type="radio"
                :value="method.value"
                v-model="selectedMethod"
                class="mr-3"
                style="accent-color: #2F2A25;"
              />
              <span class="text-lg mr-2">{{ method.icon }}</span>
              <span class="font-semibold" :style="{ color: selectedMethod === method.value ? '#2F2A25' : '#2F2A25' }">{{ method.label }}</span>
            </label>
          </div>
        </div>

        <!-- Card Details (if card selected) -->
        <div v-if="selectedMethod === 'card'" class="mb-4 space-y-3">
          <div>
            <label class="block text-sm font-semibold mb-1" style="color: #2F2A25;">
              Card Number
            </label>
            <input
              v-model="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              class="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style="border-color: #E8E4DD; background-color: #FFFFFF; color: #2F2A25;"
              @input="formatCardNumber"
              @focus="(e) => e.target.style.borderColor = '#2F2A25'"
              @blur="(e) => e.target.style.borderColor = '#E8E4DD'"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold mb-1" style="color: #2F2A25;">
                Expiry
              </label>
              <input
                v-model="cardExpiry"
                type="text"
                placeholder="MM/YY"
                maxlength="5"
                class="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style="border-color: #E8E4DD; background-color: #FFFFFF; color: #2F2A25;"
                @input="formatExpiry"
                @focus="(e) => e.target.style.borderColor = '#2F2A25'"
                @blur="(e) => e.target.style.borderColor = '#E8E4DD'"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1" style="color: #2F2A25;">
                CVV
              </label>
              <input
                v-model="cardCvv"
                type="text"
                placeholder="123"
                maxlength="4"
                class="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style="border-color: #E8E4DD; background-color: #FFFFFF; color: #2F2A25;"
                @focus="(e) => e.target.style.borderColor = '#2F2A25'"
                @blur="(e) => e.target.style.borderColor = '#E8E4DD'"
              />
            </div>
          </div>
        </div>

        <!-- Processing State -->
        <div v-if="processing" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style="border-color: #2F2A25;"></div>
          <p class="font-normal" style="color: #6E6159;">Processing payment...</p>
        </div>

        <!-- Actions -->
        <div v-else class="space-y-2">
          <button
            @click="processPayment"
            :disabled="!canProcess"
            class="w-full py-3 text-lg font-semibold rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style="background-color: #2F2A25; font-weight: 600;"
          >
            Pay ${{ totalAmount.toFixed(2) }}
          </button>
          <button
            @click="handleSkip"
            class="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-80"
            style="background-color: #F5F5F5; color: #2F2A25; font-weight: 600;"
          >
            Skip Payment (Pay Later)
          </button>
        </div>

        <!-- Demo Mode Notice -->
        <div v-if="isTestMode" class="mt-4 rounded-lg p-3" style="background-color: #FFF8E1; border: 1px solid #FFE082;">
          <p class="text-xs font-normal text-center" style="color: #F57C00;">
            🧪 Demo Mode: Payment is simulated for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { TEST_MODE } from '@/config'
import paymentService from '@/services/paymentService'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'success', 'skip'])

const isTestMode = TEST_MODE
const processing = ref(false)
const selectedMethod = ref('card')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')

const paymentMethods = [
  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: '📱' },
  { value: 'cash', label: 'Cash (Pay at Counter)', icon: '💵' },
]

const canProcess = computed(() => {
  if (selectedMethod.value === 'card') {
    return cardNumber.value.replace(/\s/g, '').length >= 13 &&
           cardExpiry.value.length === 5 &&
           cardCvv.value.length >= 3
  }
  return true
})

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  cardNumber.value = value.match(/.{1,4}/g)?.join(' ') || value
}

const formatExpiry = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  cardExpiry.value = value
}

const processPayment = async () => {
  if (!canProcess.value) return

  processing.value = true

  try {
    const paymentData = {
      orderId: props.orderId,
      amount: props.totalAmount,
      paymentMethod: selectedMethod.value,
      metadata: selectedMethod.value === 'card' ? {
        cardLast4: cardNumber.value.slice(-4).replace(/\s/g, ''),
        cardType: 'demo',
      } : null,
    }

    const response = await paymentService.createPayment(paymentData)
    
    emit('success', {
      payment: response.data.payment,
      paymentId: response.data.receivingId,
    })
  } catch (err) {
    console.error('Payment processing error:', err)
    alert('Payment failed. Please try again or skip payment.')
  } finally {
    processing.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const handleSkip = () => {
  emit('skip')
}

// Reset form when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    selectedMethod.value = 'card'
    cardNumber.value = ''
    cardExpiry.value = ''
    cardCvv.value = ''
    processing.value = false
  }
})
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
