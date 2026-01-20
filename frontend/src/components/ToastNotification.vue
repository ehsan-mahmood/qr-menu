<template>
  <Transition name="toast">
    <div
      v-if="notification"
      class="toast-notification"
      :class="getNotificationClass(notification.type)"
    >
      <div class="toast-content">
        <span class="toast-icon">{{ getNotificationIcon(notification.type) }}</span>
        <div class="toast-text">
          <p class="toast-title">{{ notification.title }}</p>
          <p class="toast-message">{{ notification.message }}</p>
        </div>
        <button 
          @click="$emit('close')" 
          class="toast-close-button"
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
    new_order: 'toast-success',
    order_update: 'toast-info',
    info: 'toast-info',
    success: 'toast-success',
    warning: 'toast-warning',
    error: 'toast-error',
  }
  return classes[type] || 'toast-default'
}
</script>

<style scoped>
/* Light Theme - Updated Design Handoff */
.toast-notification {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  background-color: #FEFEFE;
  border-left: 4px solid;
  border-radius: 10px;
  padding: 16px 20px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', system-ui, sans-serif;
}

.toast-success {
  border-left-color: #4A1A28;
  background-color: #FEFEFE;
}

.toast-info {
  border-left-color: #4A1A28;
  background-color: #FEFEFE;
}

.toast-warning {
  border-left-color: #4A1A28;
  background-color: #FEFEFE;
}

.toast-error {
  border-left-color: #DC2626;
  background-color: #FEFEFE;
}

.toast-default {
  border-left-color: #737373;
  background-color: #FEFEFE;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.toast-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 15px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 4px 0;
}

.toast-message {
  font-size: 13px;
  font-weight: 400;
  color: #737373;
  margin: 0;
  line-height: 1.4;
}

.toast-close-button {
  margin-left: 8px;
  padding: 4px 8px;
  background: none;
  border: none;
  color: #737373;
  font-size: 18px;
  cursor: pointer;
  transition: all 120ms ease-out;
  border-radius: 4px;
  flex-shrink: 0;
}

.toast-close-button:hover {
  color: #0b0706;
  background-color: #F5F5F4;
}

.toast-enter-active {
  animation: slideIn 120ms ease-out;
}

.toast-leave-active {
  animation: slideOut 120ms ease-in;
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
</style>
