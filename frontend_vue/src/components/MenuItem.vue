<template>
  <div class="card-gradient hover:border-primary/30 transition-all duration-200 cursor-pointer" @click="handleClick">
    <div class="flex gap-4">
      <!-- Item Image -->
      <div v-if="item.image" class="flex-shrink-0">
        <img 
          :src="item.image" 
          :alt="item.name"
          class="w-20 h-20 object-cover rounded-lg"
          loading="lazy"
        />
      </div>
      
      <!-- Item Details -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start gap-2">
          <h3 class="font-semibold text-charcoal truncate">{{ item.name }}</h3>
          <span class="font-bold text-primary whitespace-nowrap">${{ item.price.toFixed(2) }}</span>
        </div>
        
        <p v-if="item.description" class="text-sm text-gray-500 mt-1 line-clamp-2">
          {{ item.description }}
        </p>
        
        <div class="mt-2 flex items-center gap-2">
          <span 
            v-if="!item.available" 
            class="text-xs text-red-500 font-medium"
          >
            Unavailable
          </span>
        </div>
      </div>
      
      <!-- Add Button -->
      <div class="flex-shrink-0 flex items-center">
        <button
          v-if="item.available"
          @click.stop="handleAddToBasket"
          class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all"
          aria-label="Add to basket"
        >
          <span class="text-xl font-bold">+</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBasketStore } from '@/stores/basketStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click', 'add-to-basket'])

const basketStore = useBasketStore()
const analyticsStore = useAnalyticsStore()

const handleClick = () => {
  emit('click', props.item)
  
  // Track item click
  analyticsStore.postEvent({
    eventType: 'item_click',
    itemId: props.item.id,
    itemName: props.item.name,
    timestamp: new Date().toISOString(),
  })
}

const handleAddToBasket = () => {
  basketStore.addItem(props.item)
  emit('add-to-basket', props.item)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

