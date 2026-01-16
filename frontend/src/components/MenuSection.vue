<template>
  <div class="mb-4">
    <!-- Section Header -->
    <button
      @click="toggleSection"
      class="w-full flex justify-between items-center p-4 bg-white rounded-lg border border-warm-gray hover:border-primary/30 transition-all duration-200"
      :class="{ 'section-accent-line': isOpen }"
    >
      <h2 class="text-xl font-bold text-charcoal">{{ section.name }}</h2>
      <span class="text-gray-500 text-2xl transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
        ▼
      </span>
    </button>
    
    <!-- Section Items -->
    <Transition name="slide">
      <div v-show="isOpen" class="mt-2 space-y-2">
        <MenuItem
          v-for="item in section.items"
          :key="item.id"
          :item="item"
          @click="handleItemClick"
          @add-to-basket="handleAddToBasket"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MenuItem from './MenuItem.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  defaultOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['item-click', 'item-added'])

const isOpen = ref(props.defaultOpen)

const toggleSection = () => {
  isOpen.value = !isOpen.value
}

const handleItemClick = (item) => {
  emit('item-click', item)
}

const handleAddToBasket = (item) => {
  emit('item-added', item)
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>

