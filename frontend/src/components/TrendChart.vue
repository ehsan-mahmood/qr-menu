<template>
  <div class="card">
    <h3 class="chart-title">{{ title }}</h3>
    
    <div v-if="data && data.length > 0" class="chart-container">
      <!-- Item Selector -->
      <div class="item-selector">
        <label class="selector-label">Item:</label>
        <select
          v-model="selectedItem"
          class="selector-dropdown"
        >
          <option v-for="item in availableItems" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
      
      <!-- Chart Container with Glassmorphism -->
      <div class="chart-wrapper" ref="chartContainer">
        <svg :width="chartWidth.value" :height="300" class="chart-svg" :viewBox="`0 0 ${chartWidth.value} 300`" preserveAspectRatio="xMidYMid meet">
          <!-- Background gradient for glass effect -->
          <defs>
            <linearGradient id="trendGlassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
            </linearGradient>
            <!-- Gradient for scan line -->
            <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#8A1222;stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:#8A1222;stop-opacity:0.4" />
            </linearGradient>
            <!-- Gradient for click line -->
            <linearGradient id="clickGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#E09F3E;stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:#E09F3E;stop-opacity:0.4" />
            </linearGradient>
          </defs>
          
          <!-- Glass background -->
          <rect
            :x="padding - 10"
            :y="padding + topBuffer - 10"
            :width="chartWidth.value - padding * 2 + 20"
            :height="chartHeight + 20"
            fill="url(#trendGlassGradient)"
            rx="12"
            :opacity="0.3"
          />
          
          <!-- Grid lines -->
          <g v-for="i in 5" :key="i">
            <line
              :x1="padding"
              :y1="padding + topBuffer + (i - 1) * (chartHeight / 4)"
              :x2="chartWidth.value - padding"
              :y2="padding + topBuffer + (i - 1) * (chartHeight / 4)"
              stroke="#ECEAE5"
              stroke-width="1"
              :opacity="0.5"
            />
          </g>
          
          <!-- Area fill for scans -->
          <polygon
            :points="`${padding},${padding + topBuffer + chartHeight} ${scanPoints} ${chartWidth.value - padding},${padding + topBuffer + chartHeight}`"
            fill="url(#scanGradient)"
            :opacity="0.15"
          />
          
          <!-- Area fill for clicks -->
          <polygon
            :points="`${padding},${padding + topBuffer + chartHeight} ${clickPoints} ${chartWidth.value - padding},${padding + topBuffer + chartHeight}`"
            fill="url(#clickGradient)"
            :opacity="0.15"
          />
          
          <!-- Line for scans -->
          <polyline
            :points="scanPoints"
            fill="none"
            stroke="#8A1222"
            stroke-width="3"
            class="line-hover"
          />
          
          <!-- Line for clicks -->
          <polyline
            :points="clickPoints"
            fill="none"
            stroke="#E09F3E"
            stroke-width="3"
            class="line-hover"
          />
          
          <!-- Data points for scans -->
          <g v-for="(point, index) in scanDataPoints" :key="`scan-point-${index}`">
            <circle
              :cx="point.x"
              :cy="point.y"
              r="5"
              fill="#8A1222"
              stroke="#FFFFFF"
              stroke-width="2"
              class="point-hover"
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
              fill="#E09F3E"
              stroke="#FFFFFF"
              stroke-width="2"
              class="point-hover"
            >
              <title>{{ point.label }}: {{ point.value }} clicks</title>
            </circle>
          </g>
          
          <!-- X-axis labels -->
          <g v-for="(item, index) in filteredData" :key="`label-${index}`">
            <text
              :x="padding + index * stepX.value + stepX.value / 2"
              :y="padding + topBuffer + chartHeight + 20"
              text-anchor="middle"
              class="axis-label"
            >
              {{ item.dateLabel }}
            </text>
          </g>
          
          <!-- Y-axis labels -->
          <g v-for="i in 5" :key="`y-label-${i}`">
            <text
              :x="padding - 10"
              :y="padding + topBuffer + (i - 1) * (chartHeight / 4) + 4"
              text-anchor="end"
              class="axis-label"
            >
              {{ Math.round((maxValue / 1.1) * (1 - (i - 1) / 4)) }}
            </text>
          </g>
        </svg>
      </div>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color legend-scans-line"></div>
          <span class="legend-text">Scans</span>
        </div>
        <div class="legend-item">
          <div class="legend-color legend-clicks-line"></div>
          <span class="legend-text">Clicks</span>
        </div>
      </div>
      
      <!-- Trend Summary -->
      <div class="trend-summary">
        <h4 class="trend-title">📈 Trend Analysis</h4>
        <div class="trend-metrics">
          <div class="trend-metric">
            <span class="trend-label">7-Day Change:</span>
            <span :class="['trend-value', trendChange >= 0 ? 'trend-positive' : 'trend-negative']">
              {{ trendChange >= 0 ? '+' : '' }}{{ trendChange.toFixed(1) }}%
            </span>
          </div>
          <div class="trend-metric">
            <span class="trend-label">Average Daily:</span>
            <span class="trend-value">{{ avgDailyScans }} scans</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="chart-empty">
      No trend data available
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const chartContainer = ref(null)
const chartWidth = ref(800)

const updateChartWidth = () => {
  if (chartContainer.value) {
    const containerWidth = chartContainer.value.clientWidth
    chartWidth.value = Math.max(containerWidth - 32, 400) // Account for padding
  }
}

onMounted(() => {
  updateChartWidth()
  window.addEventListener('resize', updateChartWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartWidth)
})

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
const topBuffer = 15 // Extra space at top to prevent line/circle overflow
const chartHeight = 300 - padding * 2 - topBuffer
const stepX = computed(() => {
  return (chartWidth.value - padding * 2) / Math.max(filteredData.value.length - 1, 1)
})

const maxValue = computed(() => {
  let max = 0
  filteredData.value.forEach(day => {
    day.items?.forEach(item => {
      max = Math.max(max, item.scans || 0, item.clicks || 0)
    })
  })
  // Add 10% buffer to max value to prevent top clipping
  return Math.max(max * 1.1, 1)
})

const scanDataPoints = computed(() => {
  return filteredData.value.map((day, index) => {
    const item = day.items?.[0]
    const value = item?.scans || 0
    return {
      x: padding + index * stepX.value + stepX.value / 2,
      y: padding + topBuffer + chartHeight - (value / maxValue.value) * chartHeight,
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
      x: padding + index * stepX.value + stepX.value / 2,
      y: padding + topBuffer + chartHeight - (value / maxValue.value) * chartHeight,
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

<style scoped>
.card {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0 0 24px 0;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.item-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
}

.selector-dropdown {
  background-color: #FFFFFF;
  border: 1px solid #ECEAE5;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0b0706;
  min-height: 40px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.selector-dropdown:focus {
  outline: none;
  border-color: #8A1222;
  box-shadow: 0 0 0 3px rgba(138, 18, 34, 0.1);
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
  max-width: 100%;
  background: linear-gradient(135deg, rgba(138, 18, 34, 0.05) 0%, rgba(244, 196, 48, 0.05) 100%);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(236, 234, 229, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6),
              0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.line-hover {
  transition: all 150ms ease-out;
}

.line-hover:hover {
  stroke-width: 4;
  filter: brightness(1.1);
}

.point-hover {
  transition: all 150ms ease-out;
  cursor: pointer;
}

.point-hover:hover {
  r: 7;
  filter: brightness(1.2);
}

.axis-label {
  font-size: 12px;
  font-weight: 400;
  fill: #6B7280;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.chart-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 4px;
  border-radius: 2px;
}

.legend-scans-line {
  background-color: #8A1222;
}

.legend-clicks-line {
  background-color: #E09F3E;
}

.legend-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: #0b0706;
}

.trend-summary {
  background: linear-gradient(135deg, rgba(63, 163, 77, 0.08) 0%, rgba(244, 243, 239, 0.8) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(236, 234, 229, 0.6);
  border-radius: 12px;
  padding: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7),
              0 2px 8px rgba(0, 0, 0, 0.04);
}

.trend-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0 0 12px 0;
}

.trend-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.trend-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trend-label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280;
}

.trend-value {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  font-variant-numeric: tabular-nums;
}

.trend-positive {
  color: #3FA34D;
}

.trend-negative {
  color: #5C071A;
}

.chart-empty {
  text-align: center;
  padding: 48px 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280;
}

@media (max-width: 768px) {
  .trend-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
