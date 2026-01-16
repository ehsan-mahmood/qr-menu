<template>
  <Transition name="toast">
    <div
      v-if="notification"
      class="fixed top-4 right-4 z-50 bg-white border-l-4 shadow-lg rounded-lg px-6 py-4 min-w-[300px] max-w-md animate-slide-in"
      :class="getNotificationClass(notification.type)"
    >
      <div class="flex items-start gap-3">
        <span class="text-2xl">{{ getNotificationIcon(notification.type) }}</span>
        <div class="flex-1">
          <p class="font-bold text-gray-900">{{ notification.title }}</p>
          <p class="text-sm text-gray-700 mt-1">{{ notification.message }}</p>
        </div>
        <button 
          @click="$emit('close')" 
          class="ml-2 px-2 py-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Close notification"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  notification: {
    type: Object,
    default: null,
  },
})

defineEmits(['close'])

const getNotificationIcon = (type) => {
  const icons = {
    new_order: '🛒',
    order_update: '📋',
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }
  return icons[type] || '🔔'
}

const getNotificationClass = (type) => {
  const classes = {
    new_order: 'border-green-500 bg-green-50',
    order_update: 'border-blue-500 bg-blue-50',
    info: 'border-blue-500 bg-blue-50',
    success: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    error: 'border-red-500 bg-red-50',
  }
  return classes[type] || 'border-gray-500 bg-gray-50'
}
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
</style>
