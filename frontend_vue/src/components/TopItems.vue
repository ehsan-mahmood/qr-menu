<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
    
    <div class="space-y-3">
      <div 
        v-for="(item, index) in displayItems" 
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
            {{ index + 1 }}
          </span>
          <span class="font-medium text-gray-900">{{ item.itemName }}</span>
        </div>
        
        <div class="flex items-center gap-6 text-sm">
          <div class="text-right">
            <div class="text-gray-500">Scans</div>
            <div class="font-bold text-gray-900">{{ item.scans }}</div>
          </div>
          <div class="text-right">
            <div class="text-gray-500">Clicks</div>
            <div class="font-bold text-primary-600">{{ item.clicks }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="displayItems.length === 0" class="text-center py-8 text-gray-500">
      No items to display
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Top Items',
  },
  items: {
    type: Array,
    required: true,
  },
  limit: {
    type: Number,
    default: 10,
  },
})

const displayItems = computed(() => {
  return props.items.slice(0, props.limit)
})
</script>

