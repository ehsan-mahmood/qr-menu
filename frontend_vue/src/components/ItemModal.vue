<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" @click="closeModal">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Modal Content -->
      <div 
        class="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        :style="isDesignC ? 'background-color: #FFFFFF;' : ''"
        @click.stop
      >
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10 hover:opacity-80"
          :style="isDesignC ? 'background-color: #F5F5F5; color: #2F2A25;' : 'background-color: #F5F5F5;'"
          aria-label="Close"
        >
          <span class="text-2xl" :style="isDesignC ? 'color: #2F2A25;' : 'color: #666;'">×</span>
        </button>
        
        <!-- Item Image -->
        <div v-if="item?.image" class="w-full h-64 sm:h-80">
          <img 
            :src="item.image" 
            :alt="item.name"
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Item Details -->
        <div class="p-6">
          <div class="flex justify-between items-start gap-4 mb-4">
            <h2 
              class="text-2xl font-bold" 
              :style="isDesignC ? 'color: #2F2A25; letter-spacing: -0.3px; font-weight: 700;' : ''"
            >
              {{ item?.name }}
            </h2>
            <span 
              class="text-2xl font-semibold whitespace-nowrap"
              :style="isDesignC ? 'color: #2F2A25; font-weight: 600;' : ''"
            >
              ${{ item?.price.toFixed(2) }}
            </span>
          </div>
          
          <p 
            v-if="item?.description" 
            class="mb-6 leading-relaxed font-normal"
            :style="isDesignC ? 'color: #6E6159;' : 'color: #666;'"
          >
            {{ item.description }}
          </p>
          
          <!-- Category/Tags -->
          <div v-if="item?.category" class="mb-6">
            <span 
              class="inline-block px-3 py-1 rounded-full text-sm"
              :style="isDesignC ? 'background-color: #FAF8F3; color: #6E6159;' : 'background-color: #F5F5F5; color: #666;'"
            >
              {{ item.category }}
            </span>
          </div>
          
          <!-- Availability -->
          <div v-if="!item?.available" class="mb-6">
            <span 
              class="inline-block px-3 py-1 rounded-full text-sm font-medium"
              :style="isDesignC ? 'background-color: #F5F5F5; color: #6E6159;' : 'background-color: #FEE2E2; color: #991B1B;'"
            >
              Currently Unavailable
            </span>
          </div>
          
          <!-- Add to Basket Button -->
          <button
            v-if="item?.available"
            @click="handleAddToBasket"
            class="w-full py-4 text-lg font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-98"
            :style="isDesignC ? 'background-color: #2F2A25; font-weight: 600;' : ''"
          >
            Add to Order - ${{ item?.price.toFixed(2) }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useBasketStore } from '@/stores/basketStore'
import { useThemeStore } from '@/stores/themeStore'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'add-to-basket'])

const basketStore = useBasketStore()
const themeStore = useThemeStore()

const isDesignC = computed(() => themeStore.isDesignC)

const closeModal = () => {
  emit('close')
}

const handleAddToBasket = () => {
  if (props.item) {
    basketStore.addItem(props.item)
    emit('add-to-basket', props.item)
    closeModal()
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative {
  transform: translateY(100%);
}

.modal-leave-to .relative {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .relative {
    transform: translateY(0) scale(0.95);
  }
  
  .modal-leave-to .relative {
    transform: translateY(0) scale(0.95);
  }
}
</style>

