<template>
  <div class="card">
    <h3 class="chart-title">{{ title }}</h3>
    
    <div v-if="data && data.length > 0" class="chart-container">
      <!-- Chart Container with Glassmorphism -->
      <div class="chart-wrapper" ref="chartContainer">
        <svg :width="effectiveWidth" :height="300" class="chart-svg" :viewBox="`0 0 ${effectiveWidth} 300`" preserveAspectRatio="xMidYMid meet">
          <!-- Background gradient for glass effect -->
          <defs>
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Glass background -->
          <rect
            :x="padding - 10"
            :y="padding - 10"
            :width="chartAreaWidth + 20"
            :height="chartHeight + 20"
            fill="url(#glassGradient)"
            rx="12"
            :opacity="0.3"
          />
          
          <!-- Grid lines -->
          <g v-for="i in 5" :key="i">
            <line
              :x1="padding"
              :y1="padding + (i - 1) * (chartHeight / 4)"
              :x2="padding + chartAreaWidth"
              :y2="padding + (i - 1) * (chartHeight / 4)"
              stroke="#ECEAE5"
              stroke-width="1"
              :opacity="0.5"
            />
          </g>
          
          <!-- Bars for orders -->
          <g v-for="(item, index) in data" :key="`order-${index}`">
            <rect
              :x="padding + index * barWidth + barSpacing"
              :y="padding + chartHeight - (item.orders / maxOrders) * chartHeight"
              :width="barWidth * 0.4"
              :height="(item.orders / maxOrders) * chartHeight"
              fill="#8A1222"
              :opacity="0.8"
              rx="4"
              class="bar-hover"
            >
              <title>{{ item.hourLabel }}: {{ item.orders }} orders</title>
            </rect>
          </g>
          
          <!-- Bars for scans -->
          <g v-for="(item, index) in data" :key="`scan-${index}`">
            <rect
              :x="padding + index * barWidth + barSpacing + barWidth * 0.4"
              :y="padding + chartHeight - (item.scans / maxScans) * chartHeight"
              :width="barWidth * 0.4"
              :height="(item.scans / maxScans) * chartHeight"
              fill="#E09F3E"
              :opacity="0.8"
              rx="4"
              class="bar-hover"
            >
              <title>{{ item.hourLabel }}: {{ item.scans }} scans</title>
            </rect>
          </g>
          
          <!-- X-axis labels (every 2 hours) -->
          <template v-for="(item, index) in data" :key="`label-${index}`">
            <g v-if="index % 2 === 0">
              <text
                :x="padding + index * barWidth + barWidth / 2"
                :y="padding + chartHeight + 20"
                text-anchor="middle"
                class="axis-label"
              >
                {{ item.hourLabel }}
              </text>
            </g>
          </template>
          
          <!-- Y-axis labels -->
          <g v-for="i in 5" :key="`y-label-${i}`">
            <text
              :x="padding - 10"
              :y="padding + (i - 1) * (chartHeight / 4) + 4"
              text-anchor="end"
              class="axis-label"
            >
              {{ Math.round(maxOrders * (1 - (i - 1) / 4)) }}
            </text>
          </g>
        </svg>
      </div>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color legend-orders"></div>
          <span class="legend-text">Orders</span>
        </div>
        <div class="legend-item">
          <div class="legend-color legend-scans"></div>
          <span class="legend-text">Scans</span>
        </div>
      </div>
      
      <!-- Peak Hours Summary -->
      <div class="peak-summary">
        <h4 class="peak-title">📊 Peak Hours</h4>
        <div class="peak-metrics">
          <div class="peak-metric">
            <span class="peak-label">Busiest Hour:</span>
            <span class="peak-value">{{ peakHour.hourLabel }}</span>
          </div>
          <div class="peak-metric">
            <span class="peak-label">Total Activity:</span>
            <span class="peak-value">{{ peakHour.orders + peakHour.scans }} events</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="chart-empty">
      No hourly data available
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'

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

const chartContainer = ref(null)
const chartWidth = ref(800)

const updateChartWidth = () => {
  if (chartContainer.value) {
    const containerWidth = chartContainer.value.clientWidth || chartContainer.value.offsetWidth
    if (containerWidth && containerWidth > 0) {
      chartWidth.value = Math.max(containerWidth - 32, 400) // Account for padding
    } else {
      // Fallback: use default or parent width
      chartWidth.value = 400
    }
  }
}

onMounted(() => {
  // Use nextTick to ensure DOM is fully rendered
  nextTick(() => {
    updateChartWidth()
    // Also try again after a short delay to ensure layout is complete
    setTimeout(updateChartWidth, 100)
  })
  window.addEventListener('resize', updateChartWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartWidth)
})

const padding = 40
const chartAreaHeight = 300
const chartHeight = computed(() => chartAreaHeight - padding * 2)
const effectiveWidth = computed(() => chartWidth.value || 400)
const chartAreaWidth = computed(() => effectiveWidth.value - padding * 2)
const barWidth = computed(() => {
  if (!props.data || props.data.length === 0) return 0
  return chartAreaWidth.value > 0 ? chartAreaWidth.value / props.data.length : 0
})
const barSpacing = 2

const maxOrders = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.max(...props.data.map(item => item.orders || 0), 1)
})

const maxScans = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.max(...props.data.map(item => item.scans || 0), 1)
})

const peakHour = computed(() => {
  if (!props.data || props.data.length === 0) return { hourLabel: 'N/A', orders: 0, scans: 0 }
  return props.data.reduce((max, item) => {
    const total = (item.orders || 0) + (item.scans || 0)
    const maxTotal = (max.orders || 0) + (max.scans || 0)
    return total > maxTotal ? item : max
  }, props.data[0])
})
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

.bar-hover {
  transition: all 150ms ease-out;
  cursor: pointer;
}

.bar-hover:hover {
  opacity: 1 !important;
  filter: brightness(1.1);
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
  height: 16px;
  border-radius: 4px;
}

.legend-orders {
  background-color: #8A1222;
  opacity: 0.8;
}

.legend-scans {
  background-color: #E09F3E;
  opacity: 0.8;
}

.legend-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: #0b0706;
}

.peak-summary {
  background: linear-gradient(135deg, rgba(138, 18, 34, 0.08) 0%, rgba(244, 243, 239, 0.8) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(236, 234, 229, 0.6);
  border-radius: 12px;
  padding: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7),
              0 2px 8px rgba(0, 0, 0, 0.04);
}

.peak-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: #0b0706;
  margin: 0 0 12px 0;
}

.peak-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.peak-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.peak-label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: #6B7280;
}

.peak-value {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  color: #0b0706;
  font-variant-numeric: tabular-nums;
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
  .peak-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
