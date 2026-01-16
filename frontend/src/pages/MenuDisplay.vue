<template>
  <div>
  <!-- Design C: Elegant Cafe Menu (New Default per Guidelines) -->
  <div v-if="themeStore.isDesignC" class="min-h-screen" style="background-color: #FEFDF9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <!-- Header -->
    <div class="sticky top-0 z-10" style="background-color: #FEFDF9; border-bottom: 1px solid #E8E4DD;">
      <div class="container mx-auto px-4 py-5">
        <div class="text-center">
          <h1 class="text-2xl font-bold" style="color: #2F2A25; letter-spacing: -0.3px; font-weight: 700;">
            {{ merchantName }}
          </h1>
          <p v-if="tableNumber" class="text-sm mt-1.5 font-normal" style="color: #6E6159;">Table {{ tableNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Sticky Category Navigation (Horizontal Scroll) -->
    <div v-if="sections.length > 0" class="sticky top-[73px] z-10" style="background-color: #FEFDF9; border-bottom: 1px solid #E8E4DD; backdrop-filter: blur(8px);">
      <div class="container mx-auto px-4 py-3">
        <div class="flex gap-2.5 overflow-x-auto scrollbar-hide">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="scrollToSection(section.id)"
            class="px-5 py-2.5 rounded-lg whitespace-nowrap font-semibold text-sm transition-all duration-200"
            :class="activeSection === section.id 
              ? 'text-white' 
              : 'hover:opacity-80'"
            :style="activeSection === section.id 
              ? 'background-color: #2F2A25;' 
              : 'background-color: #F5F5F5; color: #2F2A25;'"
          >
            {{ section.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-12 text-center">
      <div class="text-4xl mb-3">⏳</div>
      <p style="color: #6E6159;">Loading menu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-12 text-center">
      <div class="text-4xl mb-4">⚠️</div>
      <p class="mb-4" style="color: #B8715C;">{{ error }}</p>
      <button 
        @click="retryLoad" 
        class="px-6 py-2.5 rounded-lg text-white font-semibold transition-all hover:opacity-90"
        style="background-color: #2F2A25;"
      >
        Try Again
      </button>
    </div>

    <!-- Menu Content -->
    <div v-else class="container mx-auto px-4 py-6 pb-32">
      <div v-if="sections.length === 0" class="text-center py-12">
        <p style="color: #6E6159;">No menu items available</p>
      </div>

      <!-- Menu Sections -->
      <div v-for="section in sections" :key="section.id" :id="`section-${section.id}`" class="mb-10" style="scroll-margin-top: 130px;">
        <!-- Large Section Header -->
        <h2 class="text-3xl font-bold mb-6 pt-2 uppercase tracking-tight" style="color: #8B4513; font-weight: 700; letter-spacing: 0.5px;">
          {{ section.name }}
        </h2>

        <!-- Menu Items (Clean Card Grid) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-transparent hover:border-opacity-20"
            style="border-color: #E8E4DD;"
            @click="selectItem(item)"
          >
            <!-- Item Image -->
            <div class="relative h-48 bg-gradient-to-br" style="background: linear-gradient(135deg, #FAF8F3 0%, #E8E4DD 100%);">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="flex items-center justify-center h-full text-5xl opacity-30">
                🍽️
              </div>
              
              <!-- Add Button (Visible against images) -->
              <button
                v-if="item.available"
                @click.stop="addToBasket(item)"
                class="absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all active:scale-95 hover:opacity-90"
                style="background-color: #2F2A25; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.6); backdrop-filter: blur(4px);"
                aria-label="Add to order"
              >
                +
              </button>
            </div>

            <!-- Item Info -->
            <div class="p-4">
              <h3 class="font-bold text-base mb-1.5" style="color: #2F2A25; font-weight: 700;">{{ item.name }}</h3>
              <p v-if="item.description" class="text-sm mt-1.5 line-clamp-2 leading-relaxed font-normal" style="color: #6E6159;">
                {{ item.description }}
              </p>
              <div class="flex items-center justify-between mt-3 pt-3" style="border-top: 1px solid #E8E4DD;">
                <span class="font-semibold text-lg" style="color: #2F2A25; font-weight: 600;">${{ item.price.toFixed(2) }}</span>
                <span v-if="!item.available" class="text-xs px-2 py-1 rounded-full font-medium" style="background-color: #F5F5F5; color: #6E6159;">
                  Unavailable
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Order Bar (Contextual) -->
    <div
      v-if="basketCount > 0"
      class="fixed bottom-0 left-0 right-0 shadow-lg z-20 border-t"
      style="background-color: #FFFFFF; border-color: #E8E4DD;"
    >
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium" style="color: #6E6159;">{{ basketCount }} {{ basketCount === 1 ? 'item' : 'items' }}</p>
            <p class="font-bold text-lg mt-0.5" style="color: #2F2A25; font-weight: 700;">${{ basketTotal.toFixed(2) }}</p>
          </div>
          <button
            @click="goToBasket"
            class="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style="background-color: #2F2A25; font-weight: 600;"
          >
            View Order →
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Design B: Modern Food App -->
  <div v-else-if="themeStore.isDesignB" class="min-h-screen bg-cream pb-24">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <div class="text-center">
          <h1 class="text-2xl font-bold" style="color: #1F1F1F; font-family: 'Poppins', sans-serif;">
            {{ merchantName }}
          </h1>
          <p v-if="tableNumber" class="text-sm mt-1" style="color: #6F6F6F;">Table {{ tableNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Section Tabs (Horizontal Scroll) -->
    <div v-if="sections.length > 0" class="bg-white sticky top-16 z-10 border-b border-gray-100">
      <div class="container mx-auto px-4 py-3">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="scrollToSection(section.id)"
            class="px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all"
            :class="activeSection === section.id 
              ? 'bg-coral text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ section.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-8 text-center">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-gray-500">Loading menu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-8 text-center">
      <div class="text-4xl mb-4">⚠️</div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button @click="retryLoad" class="px-6 py-2 rounded-lg text-white" style="background-color: #FF6B57;">
        Try Again
      </button>
    </div>

    <!-- Menu Content -->
    <div v-else class="container mx-auto px-4 py-6">
      <div v-if="sections.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No menu items available</p>
      </div>

      <!-- Menu Sections -->
      <div v-for="section in sections" :key="section.id" :id="`section-${section.id}`" class="mb-8">
        <h2 class="text-xl font-bold mb-4" style="color: #1F1F1F; font-family: 'Poppins', sans-serif;">
          {{ section.name }}
        </h2>

        <!-- Menu Items (Card Grid) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            @click="selectItem(item)"
          >
            <!-- Item Image -->
            <div class="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="flex items-center justify-center h-full text-4xl">
                🍽️
              </div>
              
              <!-- Floating Add Button -->
              <button
                v-if="item.available"
                @click.stop="addToBasket(item)"
                class="absolute bottom-3 right-3 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xl transition-transform active:scale-95"
                style="background-color: #FF6B57;"
              >
                +
              </button>
            </div>

            <!-- Item Info -->
            <div class="p-4">
              <h3 class="font-semibold text-lg" style="color: #1F1F1F;">{{ item.name }}</h3>
              <p v-if="item.description" class="text-sm mt-1 line-clamp-2" style="color: #6F6F6F;">
                {{ item.description }}
              </p>
              <p class="font-bold mt-2" style="color: #FF6B57;">${{ item.price.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button (Basket FAB) -->
    <button
      v-if="basketCount > 0"
      @click="goToBasket"
      class="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center text-white font-bold transition-transform active:scale-95 z-20"
      style="background-color: #FF6B57;"
    >
      <span class="text-2xl">🛒</span>
      <span class="text-xs">{{ basketCount }}</span>
    </button>
  </div>

  <!-- Design A: Paper Menu -->
  <div v-else-if="themeStore.isDesignA" class="min-h-screen" style="background-color: #FAF7F2; font-family: 'Merriweather', Georgia, serif;">
    <!-- Header -->
    <div class="border-b" style="background-color: #FAF7F2; border-color: #E6E1DA;">
      <div class="container mx-auto px-4 py-4">
        <div class="text-center">
          <h1 class="text-2xl font-bold" style="color: #2F2A25;">{{ merchantName }}</h1>
          <p v-if="tableNumber" class="text-sm mt-1" style="color: #6E6259;">Table {{ tableNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div v-if="loading" class="container mx-auto px-4 py-8 text-center">
      <div class="text-4xl mb-4">⏳</div>
      <p style="color: #6E6259;">Loading menu...</p>
    </div>

    <div v-else-if="error" class="container mx-auto px-4 py-8 text-center">
      <div class="text-4xl mb-4">⚠️</div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button @click="retryLoad" class="px-6 py-2 rounded underline" style="color: #7A8F5B;">
        Try Again
      </button>
    </div>

    <!-- Menu Content -->
    <div v-else class="container mx-auto px-4 py-6 max-w-3xl pb-32">
      <div v-if="sections.length === 0" class="text-center py-12">
        <p style="color: #6E6259;">No menu items available</p>
      </div>

      <!-- Menu Sections -->
      <div v-for="section in sections" :key="section.id" class="mb-8">
        <!-- Section Divider -->
        <div class="border-t-2 py-3" style="border-color: #E6E1DA;">
          <h2 class="text-xl font-bold text-center" style="color: #2F2A25;">{{ section.name }}</h2>
        </div>

        <!-- Menu Items (List Style) -->
        <div class="space-y-4 mt-4">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="py-3 border-b cursor-pointer hover:opacity-80 transition-opacity"
            style="border-color: #E6E1DA;"
            @click="selectItem(item)"
          >
            <div class="flex justify-between items-start gap-4">
              <div class="flex-1">
                <h3 class="font-semibold" style="color: #2F2A25;">{{ item.name }}</h3>
                <p v-if="item.description" class="text-sm italic mt-1" style="color: #6E6259;">
                  {{ item.description }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-medium whitespace-nowrap" style="color: #2F2A25;">
                  ${{ item.price.toFixed(2) }}
                </span>
                <button
                  v-if="item.available"
                  @click.stop="addToBasket(item)"
                  class="text-sm underline"
                  style="color: #7A8F5B;"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Basket Footer (Receipt Style) -->
    <div
      v-if="basketCount > 0"
      class="fixed bottom-0 left-0 right-0 border-t shadow-lg"
      style="background-color: #FAF7F2; border-color: #E6E1DA;"
    >
      <div class="container mx-auto px-4 py-4 max-w-3xl">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm" style="color: #6E6259;">{{ basketCount }} items</p>
            <p class="font-bold" style="color: #2F2A25;">${{ basketTotal.toFixed(2) }}</p>
          </div>
          <button
            @click="goToBasket"
            class="px-6 py-2 rounded underline font-medium"
            style="color: #7A8F5B;"
          >
            View Order →
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Item Modal -->
  <ItemModal
    :is-open="showModal"
    :item="selectedItem"
    @close="closeModal"
    @add-to-basket="handleAddFromModal"
  />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'
import { useBasketStore } from '@/stores/basketStore'
import { useQRStore } from '@/stores/qrStore'
import { useThemeStore } from '@/stores/themeStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import ItemModal from '@/components/ItemModal.vue'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const basketStore = useBasketStore()
const qrStore = useQRStore()
const themeStore = useThemeStore()
const analyticsStore = useAnalyticsStore()

const showModal = ref(false)
const selectedItem = ref(null)
const activeSection = ref(null)

const loading = computed(() => menuStore.loading)
const error = computed(() => menuStore.error)
const sections = computed(() => menuStore.sections)
const merchantName = computed(() => menuStore.merchantName)
const tableNumber = computed(() => qrStore.tableNumber)
const basketCount = computed(() => basketStore.itemCount)
const basketTotal = computed(() => basketStore.totalAmount)

onMounted(async () => {
  const { merchantSlug, menuName, menuId } = route.params
  
  try {
    // Try to fetch by slug first (user-friendly URL)
    if (merchantSlug && menuName) {
      await menuStore.fetchMenuBySlug(merchantSlug, menuName)
      const fetchedMenu = menuStore.currentMenu
      if (fetchedMenu?.menuId) {
        await menuStore.fetchMenuConfig(fetchedMenu.menuId)
        
        analyticsStore.postEvent({
          eventType: 'menu_view',
          menuId: fetchedMenu.menuId,
          timestamp: new Date().toISOString(),
        })
      }
    }
    // Fall back to menuId if provided
    else if (menuId) {
      await menuStore.fetchMenuById(menuId)
      await menuStore.fetchMenuConfig(menuId)
      
      analyticsStore.postEvent({
        eventType: 'menu_view',
        menuId: menuId,
        timestamp: new Date().toISOString(),
      })
    }
    // Fall back to QR store menuId
    else if (qrStore.menuId) {
      await menuStore.fetchMenuById(qrStore.menuId)
      await menuStore.fetchMenuConfig(qrStore.menuId)
    }

    if (sections.value.length > 0) {
      activeSection.value = sections.value[0].id
    }
  } catch (err) {
    console.error('Failed to load menu:', err)
  }
})

const scrollToSection = (sectionId) => {
  activeSection.value = sectionId
  const element = document.getElementById(`section-${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const selectItem = (item) => {
  selectedItem.value = item
  showModal.value = true
  
  analyticsStore.postEvent({
    eventType: 'item_click',
    menuId: menuStore.currentMenu?.menuId,
    itemId: item.id,
    timestamp: new Date().toISOString(),
  })
}

const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
}

const addToBasket = (item) => {
  basketStore.addItem(item)
  
  analyticsStore.postEvent({
    eventType: 'item_added',
    menuId: menuStore.currentMenu?.menuId,
    itemId: item.id,
    timestamp: new Date().toISOString(),
  })
}

const handleAddFromModal = (item) => {
  addToBasket(item)
  closeModal()
}

const goToBasket = () => {
  router.push('/basket')
}

// Removed goBack - menu should be isolated for customers

const retryLoad = async () => {
  const menuId = route.params.menuId
  if (menuId) {
    await menuStore.fetchMenuById(menuId)
  }
}
</script>

<style scoped>
.bg-coral {
  background-color: #FF6B57;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
