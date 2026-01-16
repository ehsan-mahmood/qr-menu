<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-xl font-bold text-gray-900">Edit Menu</h1>
            <p v-if="menuName" class="text-sm text-gray-500 mt-1">{{ menuName }}</p>
          </div>
          <button
            @click="router.push('/dashboard')"
            class="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Loading menu...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border border-red-200 text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <h3 class="text-lg font-bold text-red-900 mb-2">Failed to Load Menu</h3>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button @click="loadMenu" class="btn btn-primary">
          Try Again
        </button>
      </div>

      <!-- Menu Edit Form -->
      <div v-else class="space-y-6">
        <!-- Menu Name -->
        <div class="card">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Menu Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="menuName"
            type="text"
            class="input"
            placeholder="e.g., Main Menu, Breakfast Menu"
          />
        </div>

        <!-- Upload Method Tabs -->
        <div class="card">
          <h3 class="font-bold text-gray-900 mb-4">📋 Update Menu Items</h3>
          <p class="text-sm text-gray-600 mb-4">Choose how you'd like to update your menu</p>
          
          <div class="flex gap-2 border-b border-gray-200 mb-4">
            <button
              @click="uploadMethod = 'ocr'"
              class="px-4 py-2 font-medium transition-colors"
              :class="uploadMethod === 'ocr' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'"
            >
              📷 OCR Upload
            </button>
            <button
              @click="uploadMethod = 'csv'"
              class="px-4 py-2 font-medium transition-colors"
              :class="uploadMethod === 'csv' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'"
            >
              📊 CSV Upload
            </button>
            <button
              @click="uploadMethod = 'manual'"
              class="px-4 py-2 font-medium transition-colors"
              :class="uploadMethod === 'manual' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'"
            >
              ✏️ Manual Entry
            </button>
          </div>

          <!-- OCR Upload -->
          <div v-if="uploadMethod === 'ocr'" class="space-y-4">
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
              @click="ocrFileInput?.click()"
            >
              <input
                ref="ocrFileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleOCRUpload"
              />
              <div v-if="!selectedOCRFile" class="text-4xl mb-3">📷</div>
              <div v-else class="text-4xl mb-3">✅</div>
              <p class="font-medium text-gray-900">
                {{ selectedOCRFile ? selectedOCRFile.name : 'Click to upload menu image' }}
              </p>
              <p class="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
            
            <button
              v-if="selectedOCRFile && !parsedOCRText"
              @click="processOCRFile"
              :disabled="processingOCR"
              class="w-full btn btn-primary disabled:opacity-50"
            >
              <span v-if="processingOCR">Processing... {{ ocrProgress }}%</span>
              <span v-else>Parse Menu</span>
            </button>

            <!-- OCR Results -->
            <div v-if="parsedOCRText" class="space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm font-semibold text-blue-900 mb-2">✅ OCR Results</p>
                <p class="text-xs text-blue-800">
                  Found {{ totalParsedItems }} items. Review and edit below if needed.
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Editable OCR Text
                </label>
                <textarea
                  v-model="editableOCRText"
                  rows="10"
                  class="input font-mono text-sm"
                  placeholder="Edit the extracted text here..."
                ></textarea>
                <button
                  @click="reparseOCRText"
                  class="mt-2 btn btn-secondary text-sm"
                >
                  Re-parse Text
                </button>
              </div>

              <!-- Parsed Sections Preview -->
              <div v-if="parsedOCRSections.length > 0" class="border rounded-lg p-4">
                <h4 class="font-bold text-gray-900 mb-3">📋 Parsed Menu Structure</h4>
                <div v-for="(section, idx) in parsedOCRSections" :key="idx" class="mb-4 last:mb-0">
                  <p class="font-semibold text-gray-900 mb-2">{{ section.name }} ({{ section.items.length }} items)</p>
                  <ul class="text-sm text-gray-700 space-y-1 ml-4">
                    <li v-for="(item, itemIdx) in section.items" :key="itemIdx">
                      • {{ item.name }} - ${{ item.price.toFixed(2) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- CSV Upload -->
          <div v-if="uploadMethod === 'csv'" class="space-y-4">
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
              @click="csvFileInput?.click()"
            >
              <input
                ref="csvFileInput"
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleCSVUpload"
              />
              <div v-if="!selectedCSVFile" class="text-4xl mb-3">📊</div>
              <div v-else class="text-4xl mb-3">✅</div>
              <p class="font-medium text-gray-900">
                {{ selectedCSVFile ? selectedCSVFile.name : 'Click to upload CSV file' }}
              </p>
              <p class="text-sm text-gray-500 mt-1">CSV file with columns: name, price, description, category</p>
            </div>
            <a href="#" @click.prevent="downloadCSVTemplate" class="text-sm text-primary-600 hover:underline block text-center">
              📥 Download CSV Template
            </a>
          </div>

          <!-- Manual Entry -->
          <div v-if="uploadMethod === 'manual'" class="space-y-4">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p class="text-sm text-gray-700 mb-4">
                Add or edit menu items manually. Items are organized by sections.
              </p>
              
              <!-- Sections -->
              <div v-for="(section, sectionIdx) in menuSections" :key="sectionIdx" class="mb-6 last:mb-0">
                <div class="flex items-center justify-between mb-3">
                  <input
                    v-model="section.name"
                    type="text"
                    class="input flex-1 font-semibold"
                    placeholder="Section Name (e.g., Breakfast, Lunch)"
                  />
                  <button
                    @click="removeSection(sectionIdx)"
                    class="ml-2 text-red-600 hover:text-red-800"
                  >
                    × Remove
                  </button>
                </div>
                
                <!-- Items in Section -->
                <div v-for="(item, itemIdx) in section.items" :key="itemIdx" class="mb-3 p-3 bg-white border rounded-lg">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      v-model="item.name"
                      type="text"
                      placeholder="Item name"
                      class="input text-sm"
                    />
                    <input
                      v-model.number="item.price"
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      class="input text-sm"
                    />
                    <input
                      v-model="item.category"
                      type="text"
                      placeholder="Category"
                      class="input text-sm"
                    />
                  </div>
                  <textarea
                    v-model="item.description"
                    rows="2"
                    placeholder="Description (optional)"
                    class="input text-sm mb-2"
                  ></textarea>
                  <button
                    @click="removeItem(sectionIdx, itemIdx)"
                    class="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove Item
                  </button>
                </div>
                
                <button
                  @click="addItem(sectionIdx)"
                  class="text-sm btn btn-secondary"
                >
                  + Add Item to {{ section.name || 'Section' }}
                </button>
              </div>
              
              <button
                @click="addSection"
                class="w-full btn btn-secondary mt-4"
              >
                + Add New Section
              </button>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="card bg-blue-50 border border-blue-200">
          <button
            @click="saveMenu"
            :disabled="saving || !canSave"
            class="w-full btn btn-primary disabled:opacity-50"
          >
            <span v-if="saving">Saving menu...</span>
            <span v-else>💾 Save Menu Changes</span>
          </button>
          <p v-if="!canSave" class="text-xs text-gray-600 mt-2 text-center">
            Please add at least one menu item before saving
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import menuService from '@/services/menuService'
import qrService from '@/services/qrService'
import ocrService from '@/services/ocrService'
import { parseCSV } from '@/utils/csvParser'
import { parseMenuText } from '@/utils/menuParser'
import { TEST_MODE } from '@/config'
import { testMenu } from '@/utils/testData'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const menuId = ref(null)
const menuName = ref('')
const uploadMethod = ref('manual') // 'ocr', 'csv', 'manual'

// OCR state
const ocrFileInput = ref(null)
const selectedOCRFile = ref(null)
const processingOCR = ref(false)
const ocrProgress = ref(0)
const parsedOCRText = ref('')
const editableOCRText = ref('')
const parsedOCRSections = ref([])

// CSV state
const csvFileInput = ref(null)
const selectedCSVFile = ref(null)

// Manual entry state
const menuSections = ref([])

const totalParsedItems = computed(() => {
  return parsedOCRSections.value.reduce((sum, section) => sum + section.items.length, 0)
})

const canSave = computed(() => {
  if (uploadMethod.value === 'manual') {
    return menuSections.value.length > 0 && 
           menuSections.value.some(s => s.items.length > 0)
  } else if (uploadMethod.value === 'ocr') {
    return parsedOCRSections.value.length > 0
  } else if (uploadMethod.value === 'csv') {
    return menuSections.value.length > 0
  }
  return false
})

onMounted(async () => {
  await loadMenu()
})

const loadMenu = async () => {
  loading.value = true
  error.value = null
  
  try {
    const merchantId = authStore.merchantId || authStore.user?.merchantId || 'merchant-001'
    
    // Get menu ID from merchant's QR codes
    let currentMenuId = null
    try {
      const qrResponse = await qrService.getMerchantQRCodes(merchantId)
      const qrCodes = qrResponse.data || []
      if (qrCodes.length > 0) {
        currentMenuId = qrCodes[0].menuId
      }
    } catch (err) {
      console.log('Could not get menu ID from QR codes:', err)
    }
    
    // Fallback: use test menu ID in test mode
    if (!currentMenuId && TEST_MODE) {
      currentMenuId = testMenu.menuId
    }
    
    if (!currentMenuId) {
      error.value = 'No menu found. Please create a menu first.'
      loading.value = false
      return
    }
    
    menuId.value = currentMenuId
    
    // Load menu data
    const response = await menuService.getMenuById(currentMenuId)
    const menuData = response.data?.data || response.data
    
    menuName.value = menuData.menuName || 'Main Menu'
    
    // Convert menu data to sections format
    if (menuData.sections && menuData.sections.length > 0) {
      menuSections.value = menuData.sections.map(section => ({
        name: section.name,
        items: section.items.map(item => ({
          name: item.name,
          description: item.description || '',
          price: item.price,
          category: item.category || '',
        }))
      }))
    } else {
      // Initialize with empty section
      menuSections.value = [{
        name: 'Menu Items',
        items: []
      }]
    }
  } catch (err) {
    console.error('Failed to load menu:', err)
    error.value = err.message || 'Failed to load menu. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleOCRUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedOCRFile.value = file
    parsedOCRText.value = ''
    editableOCRText.value = ''
    parsedOCRSections.value = []
  }
}

const processOCRFile = async () => {
  if (!selectedOCRFile.value) return
  
  processingOCR.value = true
  ocrProgress.value = 0
  
  try {
    const response = await ocrService.parseMenuImage(
      selectedOCRFile.value,
      (progress) => { ocrProgress.value = progress }
    )
    
    const data = response.data?.data || response.data
    parsedOCRText.value = data.parsedText || ''
    editableOCRText.value = data.parsedText || ''
    parsedOCRSections.value = data.sections || []
    
    if (parsedOCRSections.value.length === 0 && editableOCRText.value) {
      // Try to parse the text
      parsedOCRSections.value = parseMenuText(editableOCRText.value)
    }
  } catch (err) {
    console.error('OCR processing error:', err)
    error.value = err.message || 'Failed to process image. Please try again.'
  } finally {
    processingOCR.value = false
  }
}

const reparseOCRText = () => {
  if (!editableOCRText.value.trim()) return
  parsedOCRSections.value = parseMenuText(editableOCRText.value)
}

const handleCSVUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  selectedCSVFile.value = file
  
  try {
    const text = await file.text()
    const sections = parseCSV(text)
    menuSections.value = sections
  } catch (err) {
    console.error('CSV parsing error:', err)
    error.value = err.message || 'Failed to parse CSV file. Please check the format.'
  }
}

const downloadCSVTemplate = () => {
  const csv = 'name,price,description,category\nEspresso,3.50,Strong Italian coffee,Coffee\nCappuccino,4.50,Espresso with steamed milk,Coffee\nCroissant,3.00,Buttery French pastry,Pastry'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'menu_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const addSection = () => {
  menuSections.value.push({
    name: '',
    items: []
  })
}

const removeSection = (index) => {
  menuSections.value.splice(index, 1)
}

const addItem = (sectionIdx) => {
  menuSections.value[sectionIdx].items.push({
    name: '',
    description: '',
    price: 0,
    category: ''
  })
}

const removeItem = (sectionIdx, itemIdx) => {
  menuSections.value[sectionIdx].items.splice(itemIdx, 1)
}

const saveMenu = async () => {
  if (!canSave.value) return
  
  saving.value = true
  error.value = null
  
  try {
    const merchantId = authStore.merchantId || authStore.user?.merchantId || 'merchant-001'
    
    // Prepare sections data
    let sections = []
    
    if (uploadMethod.value === 'ocr' && parsedOCRSections.value.length > 0) {
      sections = parsedOCRSections.value
    } else {
      sections = menuSections.value.map(section => ({
        name: section.name,
        items: section.items.map(item => ({
          name: item.name,
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          category: item.category || '',
          available: true
        }))
      }))
    }
    
    // Filter out empty sections and items
    sections = sections.filter(s => s.name && s.items.length > 0)
    
    if (sections.length === 0) {
      error.value = 'Please add at least one menu item before saving.'
      saving.value = false
      return
    }
    
    const response = await menuService.createOrUpdateMenu({
      merchantId,
      menuName: menuName.value || 'Main Menu',
      orderEnabled: true,
      sections
    })
    
    // Success - redirect to dashboard
    alert('✅ Menu saved successfully!')
    router.push('/dashboard')
  } catch (err) {
    console.error('Failed to save menu:', err)
    error.value = err.message || 'Failed to save menu. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
