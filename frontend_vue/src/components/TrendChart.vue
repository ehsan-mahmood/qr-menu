<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
    
    <div v-if="data && data.length > 0" class="space-y-4">
      <!-- Item Selector -->
      <div class="flex items-center gap-2 mb-4">
        <label class="text-sm font-medium text-gray-700">Item:</label>
        <select
          v-model="selectedItem"
          class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        >
          <option v-for="item in availableItems" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
      
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
          
          <!-- Line for scans -->
          <polyline
            :points="scanPoints"
            fill="none"
            stroke="#3b82f6"
            stroke-width="3"
            class="drop-shadow-sm"
          />
          
          <!-- Line for clicks -->
          <polyline
            :points="clickPoints"
            fill="none"
            stroke="#10b981"
            stroke-width="3"
            class="drop-shadow-sm"
          />
          
          <!-- Data points for scans -->
          <g v-for="(point, index) in scanDataPoints" :key="`scan-point-${index}`">
            <circle
              :cx="point.x"
              :cy="point.y"
              r="5"
              fill="#3b82f6"
              class="hover:r-7 transition-all cursor-pointer"
            >
              <title>{{ point.label }}: {{ point.value }} scans</title>
            </circle>
          </g>
          
          <!-- Data points for clicks -->
          <g v-for="(point, index) in clickDataPoints" :key="`click-point-${index}`">
            <circle
              :cx="point.x"
              :cy="point.y"
              r="5"
              fill="#10b981"
              class="hover:r-7 transition-all cursor-pointer"
            >
              <title>{{ point.label }}: {{ point.value }} clicks</title>
            </circle>
          </g>
          
          <!-- X-axis labels -->
          <g v-for="(item, index) in filteredData" :key="`label-${index}`">
            <text
              :x="padding + index * stepX + stepX / 2"
              :y="chartHeight - padding + 20"
              text-anchor="middle"
              class="text-xs fill-gray-600"
            >
              {{ item.dateLabel }}
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
              {{ Math.round(maxValue * (1 - (i - 1) / 4)) }}
            </text>
          </g>
        </svg>
      </div>
      
      <!-- Legend -->
      <div class="flex items-center justify-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span class="text-gray-700">Scans</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-500 rounded-full"></div>
          <span class="text-gray-700">Clicks</span>
        </div>
      </div>
      
      <!-- Trend Summary -->
      <div class="mt-4 p-4 bg-green-50 rounded-lg">
        <h4 class="font-semibold text-green-900 mb-2">📈 Trend Analysis</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-green-700 font-medium">7-Day Change:</span>
            <span :class="[trendChange >= 0 ? 'text-green-900' : 'text-red-600', 'ml-2']">
              {{ trendChange >= 0 ? '+' : '' }}{{ trendChange.toFixed(1) }}%
            </span>
          </div>
          <div>
            <span class="text-green-700 font-medium">Average Daily:</span>
            <span class="text-green-900 ml-2">{{ avgDailyScans }} scans</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-gray-500">
      No trend data available
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Trend Visualization',
  },
  data: {
    type: Array,
    default: () => [],
  },
})

const selectedItem = ref('')

const availableItems = computed(() => {
  if (!props.data || props.data.length === 0) return []
  const items = new Set()
  props.data.forEach(day => {
    day.items?.forEach(item => {
      items.add(item.itemName)
    })
  })
  return Array.from(items)
})

const filteredData = computed(() => {
  if (!selectedItem.value || !props.data) return props.data
  return props.data.map(day => ({
    ...day,
    items: day.items?.filter(item => item.itemName === selectedItem.value) || []
  }))
})

const padding = 40
const chartWidth = 800
const chartHeight = 300 - padding * 2
const stepX = (chartWidth - padding * 2) / Math.max(filteredData.value.length - 1, 1)

const maxValue = computed(() => {
  let max = 0
  filteredData.value.forEach(day => {
    day.items?.forEach(item => {
      max = Math.max(max, item.scans || 0, item.clicks || 0)
    })
  })
  return Math.max(max, 1)
})

const scanDataPoints = computed(() => {
  return filteredData.value.map((day, index) => {
    const item = day.items?.[0]
    const value = item?.scans || 0
    return {
      x: padding + index * stepX + stepX / 2,
      y: chartHeight - padding - (value / maxValue.value) * chartHeight,
      value,
      label: day.dateLabel,
    }
  })
})

const clickDataPoints = computed(() => {
  return filteredData.value.map((day, index) => {
    const item = day.items?.[0]
    const value = item?.clicks || 0
    return {
      x: padding + index * stepX + stepX / 2,
      y: chartHeight - padding - (value / maxValue.value) * chartHeight,
      value,
      label: day.dateLabel,
    }
  })
})

const scanPoints = computed(() => {
  return scanDataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

const clickPoints = computed(() => {
  return clickDataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

const avgDailyScans = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) return 0
  const total = filteredData.value.reduce((sum, day) => {
    const item = day.items?.[0]
    return sum + (item?.scans || 0)
  }, 0)
  return Math.round(total / filteredData.value.length)
})

const trendChange = computed(() => {
  if (!filteredData.value || filteredData.value.length < 2) return 0
  const first = filteredData.value[0].items?.[0]?.scans || 0
  const last = filteredData.value[filteredData.value.length - 1].items?.[0]?.scans || 0
  if (first === 0) return last > 0 ? 100 : 0
  return ((last - first) / first) * 100
})

// Set default selected item
if (availableItems.value.length > 0 && !selectedItem.value) {
  selectedItem.value = availableItems.value[0]
}
</script>
