<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="text-left py-3 px-4 font-semibold text-gray-700"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, index) in data" 
            :key="index"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td 
              v-for="column in columns" 
              :key="column.key"
              class="py-3 px-4 text-gray-900"
            >
              {{ formatValue(row[column.key], column.format) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="data.length === 0" class="text-center py-8 text-gray-500">
      No data available
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Analytics',
  },
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
})

const formatValue = (value, format) => {
  if (!format) return value
  
  switch (format) {
    case 'currency':
      return `$${Number(value).toFixed(2)}`
    case 'number':
      return Number(value).toLocaleString()
    default:
      return value
  }
}
</script>

