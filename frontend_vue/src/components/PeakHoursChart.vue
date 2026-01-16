<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
    
    <div v-if="data && data.length > 0" class="space-y-4">
      <!-- Chart Container -->
      <div class="relative" style="height: 300px;">
        <svg :width="chartWidth" :height="300" class="w-full">
          <!-- Grid lines -->
          <g v-for="i in 5" :key="i" class="text-gray-300">
            <line
              :x1="padding"
              :y1="padding + (i - 1) * (chartHeight / 4)"
              :x2="chartWidth - padding"
              :y2="padding + (i - 1) * (chartHeight / 4)"
              stroke="#e5e7eb"
              stroke-width="1"
            />
          </g>
          
          <!-- Bars for orders -->
          <g v-for="(item, index) in data" :key="`order-${index}`">
            <rect
              :x="padding + index * barWidth + barSpacing"
              :y="chartHeight - padding - (item.orders / maxOrders) * chartHeight"
              :width="barWidth * 0.4"
              :height="(item.orders / maxOrders) * chartHeight"
              fill="#3b82f6"
              :opacity="0.7"
              class="hover:opacity-100 transition-opacity"
            >
              <title>{{ item.hourLabel }}: {{ item.orders }} orders</title>
            </rect>
          </g>
          
          <!-- Bars for scans -->
          <g v-for="(item, index) in data" :key="`scan-${index}`">
            <rect
              :x="padding + index * barWidth + barSpacing + barWidth * 0.4"
              :y="chartHeight - padding - (item.scans / maxScans) * chartHeight"
              :width="barWidth * 0.4"
              :height="(item.scans / maxScans) * chartHeight"
              fill="#10b981"
              :opacity="0.7"
              class="hover:opacity-100 transition-opacity"
            >
              <title>{{ item.hourLabel }}: {{ item.scans }} scans</title>
            </rect>
          </g>
          
          <!-- X-axis labels (every 2 hours) -->
          <g v-for="(item, index) in data" :key="`label-${index}`" v-if="index % 2 === 0">
            <text
              :x="padding + index * barWidth + barWidth / 2"
              :y="chartHeight - padding + 20"
              text-anchor="middle"
              class="text-xs fill-gray-600"
            >
              {{ item.hourLabel }}
            </text>
          </g>
          
          <!-- Y-axis labels -->
          <g v-for="i in 5" :key="`y-label-${i}`">
            <text
              :x="padding - 10"
              :y="padding + (i - 1) * (chartHeight / 4) + 4"
              text-anchor="end"
              class="text-xs fill-gray-600"
            >
              {{ Math.round(maxOrders * (1 - (i - 1) / 4)) }}
            </text>
          </g>
        </svg>
      </div>
      
      <!-- Legend -->
      <div class="flex items-center justify-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 opacity-70 rounded"></div>
          <span class="text-gray-700">Orders</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-500 opacity-70 rounded"></div>
          <span class="text-gray-700">Scans</span>
        </div>
      </div>
      
      <!-- Peak Hours Summary -->
      <div class="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-semibold text-blue-900 mb-2">📊 Peak Hours</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-blue-700 font-medium">Busiest Hour:</span>
            <span class="text-blue-900 ml-2">{{ peakHour.hourLabel }}</span>
          </div>
          <div>
            <span class="text-blue-700 font-medium">Total Activity:</span>
            <span class="text-blue-900 ml-2">{{ peakHour.orders + peakHour.scans }} events</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-gray-500">
      No hourly data available
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Peak Hours Analysis',
  },
  data: {
    type: Array,
    default: () => [],
  },
})

const padding = 40
const chartWidth = 800
const chartHeight = 300 - padding * 2
const barWidth = (chartWidth - padding * 2) / props.data.length
const barSpacing = 2

const maxOrders = computed(() => {
  return Math.max(...props.data.map(item => item.orders), 1)
})

const maxScans = computed(() => {
  return Math.max(...props.data.map(item => item.scans), 1)
})

const peakHour = computed(() => {
  if (!props.data || props.data.length === 0) return { hourLabel: 'N/A', orders: 0, scans: 0 }
  return props.data.reduce((max, item) => {
    const total = item.orders + item.scans
    const maxTotal = max.orders + max.scans
    return total > maxTotal ? item : max
  }, props.data[0])
})
</script>
