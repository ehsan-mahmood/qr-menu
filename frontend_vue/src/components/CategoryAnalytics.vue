<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
    
    <div v-if="data && data.length > 0" class="space-y-4">
      <!-- Category Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(category, index) in data"
          :key="index"
          class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-bold text-gray-900 capitalize">{{ category.category }}</h4>
            <span class="text-2xl">{{ getCategoryIcon(category.category) }}</span>
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Scans:</span>
              <span class="font-semibold text-gray-900">{{ category.totalScans.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Clicks:</span>
              <span class="font-semibold text-blue-600">{{ category.totalClicks.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Orders:</span>
              <span class="font-semibold text-green-600">{{ category.totalOrders.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-300 pt-2 mt-2">
              <span class="text-gray-600">Avg Value:</span>
              <span class="font-bold text-purple-600">${{ category.avgOrderValue.toFixed(2) }}</span>
            </div>
          </div>
          
          <!-- Conversion Rate -->
          <div class="mt-3 pt-3 border-t border-gray-300">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Conversion Rate:</span>
              <span class="text-xs font-semibold" :class="getConversionRateClass(category)">
                {{ getConversionRate(category) }}%
              </span>
            </div>
            <div class="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full transition-all"
                :class="getConversionRateClass(category).replace('text-', 'bg-').replace('-600', '-500')"
                :style="{ width: `${getConversionRate(category)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Summary Table -->
      <div class="mt-6 overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-700">Scans</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-700">Clicks</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-700">Avg Value</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-700">Conversion</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(category, index) in sortedData"
              :key="index"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4 font-medium text-gray-900 capitalize">{{ category.category }}</td>
              <td class="py-3 px-4 text-right text-gray-700">{{ category.totalScans.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right text-blue-600 font-medium">{{ category.totalClicks.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right text-green-600 font-medium">{{ category.totalOrders.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right text-purple-600 font-semibold">${{ category.avgOrderValue.toFixed(2) }}</td>
              <td class="py-3 px-4 text-right">
                <span :class="getConversionRateClass(category)" class="font-semibold">
                  {{ getConversionRate(category) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-gray-500">
      No category data available
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Category Analytics',
  },
  data: {
    type: Array,
    default: () => [],
  },
})

const getCategoryIcon = (category) => {
  const icons = {
    breakfast: '🍳',
    mains: '🍽️',
    drinks: '☕',
    salads: '🥗',
    desserts: '🍰',
  }
  return icons[category] || '📦'
}

const getConversionRate = (category) => {
  if (category.totalScans === 0) return 0
  return ((category.totalOrders / category.totalScans) * 100).toFixed(1)
}

const getConversionRateClass = (category) => {
  const rate = parseFloat(getConversionRate(category))
  if (rate >= 20) return 'text-green-600'
  if (rate >= 10) return 'text-yellow-600'
  return 'text-red-600'
}

const sortedData = computed(() => {
  return [...props.data].sort((a, b) => b.totalOrders - a.totalOrders)
})
</script>
