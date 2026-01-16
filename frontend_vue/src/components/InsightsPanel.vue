<template>
  <div class="card">
    <!-- Collapsed: Just the headline -->
    <div
      v-if="!expanded"
      @click="expanded = true"
      class="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-4 p-4 rounded-lg transition-colors"
    >
      <h3 class="text-lg font-bold flex items-center gap-2">
        <span>{{ title.split(' ')[0] === '💡' ? '💡' : '' }}</span>
        <span>{{ title.replace('💡 ', '') }}</span>
      </h3>
      <span class="text-gray-400 text-sm flex items-center gap-1">
        <span>{{ insights && insights.length > 0 ? `${insights.length} insights` : '' }}</span>
        <span class="text-xs">▼</span>
      </span>
    </div>
    
    <!-- Expanded: Show insights -->
    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">{{ title }}</h3>
        <button
          @click="expanded = false"
          class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <span>Collapse</span>
          <span class="text-xs">▲</span>
        </button>
      </div>
      
      <div v-if="insights && insights.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="(insight, index) in insights"
          :key="index"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border-l-4 transition-all hover:shadow-md hover:scale-105"
          :class="getInsightClasses(insight)"
        >
          <span class="text-lg">{{ getInsightIcon(insight.type) }}</span>
          <span class="font-semibold text-sm whitespace-nowrap" :class="getTitleClass(insight)">
            {{ insight.title }}
          </span>
          <span
            class="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
            :class="getPriorityClass(insight.priority)"
          >
            {{ insight.priority }}
          </span>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        No insights available
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Insights & Recommendations',
  },
  insights: {
    type: Array,
    default: () => [],
  },
})

const expanded = ref(false)

const getInsightIcon = (type) => {
  const icons = {
    high_demand: '📈',
    trending_item: '🔥',
    low_performance: '⚠️',
    prep_time: '⏱️',
    recommendation: '💡',
  }
  return icons[type] || '📊'
}

const getInsightClasses = (insight) => {
  const baseClasses = 'bg-opacity-10'
  if (insight.priority === 'high') {
    return `bg-red-500 border-red-500 ${baseClasses}`
  }
  if (insight.priority === 'medium') {
    return `bg-yellow-500 border-yellow-500 ${baseClasses}`
  }
  return `bg-blue-500 border-blue-500 ${baseClasses}`
}

const getTitleClass = (insight) => {
  if (insight.priority === 'high') return 'text-red-900'
  if (insight.priority === 'medium') return 'text-yellow-900'
  return 'text-blue-900'
}

const getMessageClass = (insight) => {
  if (insight.priority === 'high') return 'text-red-700'
  if (insight.priority === 'medium') return 'text-yellow-700'
  return 'text-blue-700'
}

const getPriorityClass = (priority) => {
  if (priority === 'high') return 'bg-red-100 text-red-800'
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-800'
  return 'bg-blue-100 text-blue-800'
}
</script>
