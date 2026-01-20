<template>
  <div class="onboarding-page">
    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-content">
        <div class="progress-header">
          <h1 class="progress-title">Setup Your Menu</h1>
          <button
            v-if="currentStep > 1"
            @click="goBack"
            class="back-button"
          >
            ← Back
          </button>
        </div>
        <div class="progress-steps">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="progress-step"
            :class="{ 'progress-step-active': step <= currentStep }"
          ></div>
        </div>
        <p class="progress-text">Step {{ currentStep }} of {{ totalSteps }}</p>
      </div>
    </div>

    <div class="onboarding-content">
      <!-- Step 1: Restaurant/Company Name -->
      <div v-if="currentStep === 1" class="step-card">
        <div class="step-header">
          <div class="step-icon">🏪</div>
          <h2 class="step-title">Welcome!</h2>
          <p class="step-description">Let's start with your business details</p>
        </div>

        <div class="step-form">
          <div class="form-field">
            <label class="input-label">
              Restaurant/Company Name <span class="required">*</span>
            </label>
            <input
              v-model="onboardingData.restaurantName"
              type="text"
              required
              class="input-field"
              placeholder="e.g., The Coffee House"
            />
          </div>

          <div class="form-field">
            <label class="input-label">
              Business Type
            </label>
            <select v-model="onboardingData.businessType" class="input-field select-field">
              <option value="cafe">Café</option>
              <option value="restaurant">Restaurant</option>
              <option value="bar">Bar</option>
              <option value="food-truck">Food Truck</option>
              <option value="bakery">Bakery</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-field">
            <label class="input-label">
              Address (Optional)
            </label>
            <textarea
              v-model="onboardingData.address"
              rows="2"
              class="input-field textarea-field"
              placeholder="123 Main St, City, State"
            ></textarea>
          </div>

          <button
            @click="nextStep"
            class="btn-primary btn-full"
            :disabled="!onboardingData.restaurantName"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Step 2: Upload Menu -->
      <div v-if="currentStep === 2" class="card">
        <div class="text-center mb-6">
          <div class="text-5xl mb-4">📋</div>
          <h2 class="text-2xl font-bold text-charcoal mb-2">Upload Your Menu</h2>
          <p class="text-gray">Choose how you'd like to add your menu items</p>
        </div>

        <div class="space-y-3">
          <!-- OCR Upload -->
          <button
            @click="selectUploadMethod('ocr')"
            class="w-full p-4 border-2 rounded-lg transition-all text-left"
            :class="onboardingData.uploadMethod === 'ocr' 
              ? 'border-primary bg-primary/5' 
              : 'border-warm-gray hover:border-primary/50'"
          >
            <div class="flex items-start gap-4">
              <div class="text-3xl">📸</div>
              <div class="flex-1">
                <h3 class="font-bold text-charcoal mb-1">Photo/OCR Upload</h3>
                <p class="text-sm text-gray">Take a photo of your existing menu - we'll extract the items automatically</p>
              </div>
              <div v-if="onboardingData.uploadMethod === 'ocr'" class="text-primary text-xl">✓</div>
            </div>
          </button>

          <!-- CSV Upload -->
          <button
            @click="selectUploadMethod('csv')"
            class="w-full p-4 border-2 rounded-lg transition-all text-left"
            :class="onboardingData.uploadMethod === 'csv' 
              ? 'border-primary bg-primary/5' 
              : 'border-warm-gray hover:border-primary/50'"
          >
            <div class="flex items-start gap-4">
              <div class="text-3xl">📊</div>
              <div class="flex-1">
                <h3 class="font-bold text-charcoal mb-1">CSV Upload</h3>
                <p class="text-sm text-gray">Upload a spreadsheet with your menu items</p>
              </div>
              <div v-if="onboardingData.uploadMethod === 'csv'" class="text-primary text-xl">✓</div>
            </div>
          </button>

          <!-- Manual Entry -->
          <button
            @click="selectUploadMethod('manual')"
            class="w-full p-4 border-2 rounded-lg transition-all text-left"
            :class="onboardingData.uploadMethod === 'manual' 
              ? 'border-primary bg-primary/5' 
              : 'border-warm-gray hover:border-primary/50'"
          >
            <div class="flex items-start gap-4">
              <div class="text-3xl">✍️</div>
              <div class="flex-1">
                <h3 class="font-bold text-charcoal mb-1">Manual Entry</h3>
                <p class="text-sm text-gray">Add items one by one manually</p>
              </div>
              <div v-if="onboardingData.uploadMethod === 'manual'" class="text-primary text-xl">✓</div>
            </div>
          </button>
        </div>

        <!-- Upload Area (shown when method selected) -->
        <div v-if="onboardingData.uploadMethod" class="mt-6">
          <!-- OCR Upload Area with Enhanced Features -->
          <div v-if="onboardingData.uploadMethod === 'ocr'" class="space-y-4">
            <!-- Tabbed Interface -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <button
                @click="ocrSubMethod = 'live'"
                class="p-3 border-2 rounded-lg transition-all text-left text-sm"
                :class="ocrSubMethod === 'live' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-warm-gray hover:border-primary/50'"
              >
                <div class="text-xl mb-1">📷</div>
                <h4 class="font-semibold text-charcoal">Live OCR</h4>
                <p class="text-xs text-gray">Upload photo</p>
              </button>
              
              <button
                @click="ocrSubMethod = 'saved'"
                class="p-3 border-2 rounded-lg transition-all text-left text-sm"
                :class="ocrSubMethod === 'saved' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-warm-gray hover:border-primary/50'"
              >
                <div class="text-xl mb-1">🖼️</div>
                <h4 class="font-semibold text-charcoal">Saved Image</h4>
                <p class="text-xs text-gray">Use verified</p>
              </button>
              
              <button
                @click="ocrSubMethod = 'csv'"
                class="p-3 border-2 rounded-lg transition-all text-left text-sm"
                :class="ocrSubMethod === 'csv' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-warm-gray hover:border-primary/50'"
              >
                <div class="text-xl mb-1">📊</div>
                <h4 class="font-semibold text-charcoal">CSV Upload</h4>
                <p class="text-xs text-gray">Import file</p>
              </button>
            </div>
            
            <!-- Live OCR Upload -->
            <div v-if="ocrSubMethod === 'live'" class="space-y-4">
              <div
                class="border-2 border-dashed border-warm-gray rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                @click="triggerFileUpload('ocr')"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
              >
                <input
                  ref="ocrFileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleOCRUpload"
                />
                <div v-if="processingOCR" class="space-y-2">
                  <div class="text-4xl mb-3">⏳</div>
                  <p class="font-medium text-charcoal">Processing OCR... {{ ocrProgress }}%</p>
                  <div class="w-full bg-warm-gray rounded-full h-2">
                    <div 
                      class="bg-primary h-2 rounded-full transition-all"
                      :style="{ width: ocrProgress + '%' }"
                    ></div>
                  </div>
                </div>
                <div v-else-if="!selectedOCRFile" class="text-4xl mb-3">📷</div>
                <div v-else class="text-4xl mb-3">✅</div>
                <p class="font-medium text-charcoal">
                  {{ processingOCR ? 'Processing...' : (selectedOCRFile ? selectedOCRFile.name : 'Click or drag to upload menu photo') }}
                </p>
                <p class="text-sm text-gray mt-1">JPG, PNG up to 10MB</p>
              </div>
              
              <button
                v-if="selectedOCRFile && !parsedOCRText"
                @click="processOCRFile(selectedOCRFile)"
                :disabled="processingOCR"
                class="w-full btn btn-primary disabled:opacity-50"
              >
                <span v-if="processingOCR">Processing... {{ ocrProgress }}%</span>
                <span v-else>Parse Menu</span>
              </button>
            </div>
            
            <!-- Saved Images Library -->
            <div v-if="ocrSubMethod === 'saved'" class="space-y-4">
              <div v-if="savedOCRImages.length === 0" class="border-2 border-dashed border-warm-gray rounded-lg p-8 text-center">
                <div class="text-4xl mb-2">📚</div>
                <p class="text-gray-600 mb-2">No saved menu images yet</p>
                <p class="text-sm text-gray-500">Upload images using Live OCR to build your library</p>
              </div>
              <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="(img, idx) in savedOCRImages"
                  :key="idx"
                  @click="selectSavedOCRImage(img)"
                  class="border-2 rounded-lg p-3 cursor-pointer transition-all"
                  :class="selectedSavedOCRImage?.id === img.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-warm-gray hover:border-primary/50'"
                >
                  <img :src="img.preview" alt="Menu" class="w-full h-32 object-cover rounded mb-2" />
                  <p class="text-xs font-medium text-charcoal truncate">{{ img.name }}</p>
                  <p class="text-xs text-gray">{{ formatDate(img.date) }}</p>
                </div>
              </div>
              
              <button
                v-if="selectedSavedOCRImage"
                @click="loadSavedOCRImage"
                class="w-full btn btn-primary"
              >
                Load Selected Image
              </button>
            </div>
            
            <!-- CSV Upload -->
            <div v-if="ocrSubMethod === 'csv'" class="space-y-4">
              <div
                class="border-2 border-dashed border-warm-gray rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                @click="triggerFileUpload('csv')"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
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
                <p class="font-medium text-charcoal">
                  {{ selectedCSVFile ? selectedCSVFile.name : 'Click or drag to upload CSV file' }}
                </p>
                <p class="text-sm text-gray mt-1">CSV file with columns: name, price, description, category</p>
              </div>
              <a href="#" @click.prevent="downloadCSVTemplate" class="text-sm text-primary hover:underline block text-center">
                📥 Download CSV Template
              </a>
              
              <button
                v-if="selectedCSVFile && !parsedOCRText"
                @click="processCSVFile(selectedCSVFile)"
                class="w-full btn btn-primary"
              >
                Parse CSV
              </button>
            </div>
            
            <!-- Parsed Text Editor (shown after parsing) -->
            <div v-if="parsedOCRText" class="card mt-4">
              <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold text-charcoal">Extracted Text</h3>
                <span v-if="ocrConfidence" class="text-sm text-gray-600">
                  Confidence: {{ (ocrConfidence * 100).toFixed(0) }}%
                </span>
              </div>
              
              <textarea
                v-model="editableOCRText"
                rows="8"
                class="input font-mono text-sm resize-none mb-4"
                placeholder="Raw extracted text..."
              ></textarea>
              
              <!-- Structured Menu Preview -->
              <div v-if="parsedOCRSections && parsedOCRSections.length > 0" class="mt-4 border-t pt-4">
                <h4 class="font-bold text-charcoal mb-3">📋 Parsed Menu Structure</h4>
                <p class="text-sm text-gray-600 mb-3">
                  Found {{ parsedOCRSections.length }} section(s) with {{ totalParsedItems }} item(s)
                </p>
                
                <div class="space-y-4 max-h-96 overflow-y-auto">
                  <div v-for="(section, sIndex) in parsedOCRSections" :key="sIndex" class="bg-gray-50 rounded-lg p-3">
                    <h5 class="font-semibold text-charcoal mb-2">{{ section.name }}</h5>
                    <div class="space-y-2">
                      <div v-for="(item, iIndex) in section.items" :key="iIndex" class="text-sm bg-white p-2 rounded border border-gray-200">
                        <div class="flex justify-between items-start">
                          <div class="flex-1">
                            <p class="font-medium text-charcoal">{{ item.name }}</p>
                            <p v-if="item.description" class="text-xs text-gray-600 mt-1">{{ item.description }}</p>
                          </div>
                          <span class="font-semibold text-primary ml-2">${{ item.price.toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 flex gap-2">
                <button @click="confirmParsedMenu" class="flex-1 btn btn-primary">
                  Confirm & Continue
                </button>
                <button @click="clearParsedOCR" class="flex-1 btn btn-secondary">
                  Clear
                </button>
              </div>
            </div>
            
            <!-- OCR Error Message -->
            <div v-if="ocrError" class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
              <p class="text-sm text-red-700">{{ ocrError }}</p>
            </div>
            
            <!-- Success Message -->
            <div v-if="ocrSuccessMessage" class="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
              <p class="text-sm text-green-700">{{ ocrSuccessMessage }}</p>
            </div>
          </div>


          <!-- Manual Entry Option -->
          <div v-if="onboardingData.uploadMethod === 'manual'" class="text-center py-4">
            <p class="text-gray mb-4">You'll add menu items manually in the next step</p>
          </div>
        </div>

        <button
          @click="nextStep"
          class="w-full btn btn-primary mt-6"
          :disabled="!canProceedFromUpload"
        >
          Continue
        </button>
      </div>

      <!-- Step 3: Add Images to Menu Items -->
      <div v-if="currentStep === 3" class="card">
        <div class="text-center mb-6">
          <div class="text-5xl mb-4">🖼️</div>
          <h2 class="text-2xl font-bold text-charcoal mb-2">Add Item Images</h2>
          <p class="text-gray">Make your menu more appealing with photos</p>
        </div>

        <div v-if="menuItems.length === 0" class="text-center py-8">
          <p class="text-gray mb-4">No menu items yet. Let's add some!</p>
          <button @click="addMenuItem" class="btn btn-primary">
            Add Your First Item
          </button>
        </div>

        <div v-else class="space-y-4 mb-6">
          <div
            v-for="(item, index) in menuItems"
            :key="index"
            class="border border-warm-gray rounded-lg p-4"
          >
            <div class="flex gap-4">
              <!-- Image Upload -->
              <div class="flex-shrink-0">
                <div
                  class="w-24 h-24 rounded-lg border-2 border-dashed border-warm-gray flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  @click="triggerItemImageUpload(index)"
                >
                  <input
                    :ref="el => itemImageInputs[index] = el"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleItemImageUpload(index, $event)"
                  />
                  <img
                    v-if="item.image"
                    :src="item.imagePreview"
                    alt="Item preview"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-2xl">📷</span>
                </div>
              </div>

              <!-- Item Details -->
              <div class="flex-1 space-y-2">
                <input
                  v-model="item.name"
                  type="text"
                  placeholder="Item name"
                  class="input text-sm"
                />
                <input
                  v-model="item.price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  class="input text-sm"
                />
                <input
                  v-model="item.category"
                  type="text"
                  placeholder="Category (e.g., Coffee, Food)"
                  class="input text-sm"
                />
              </div>

              <!-- Remove Button -->
              <button
                @click="removeMenuItem(index)"
                class="text-gray-400 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <button
          @click="addMenuItem"
          class="w-full btn btn-secondary mb-4"
        >
          + Add Another Item
        </button>

        <button
          @click="completeOnboarding"
          class="w-full btn btn-primary"
          :disabled="!canCompleteOnboarding || completing"
        >
          <span v-if="completing">Setting up your menu...</span>
          <span v-else>Complete Setup</span>
        </button>

        <button
          @click="skipImages"
          class="w-full text-sm text-gray hover:text-charcoal mt-3"
        >
          Skip for now - I'll add images later
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import menuService from '@/services/menuService'
import ocrService from '@/services/ocrService'
import { parseCSV } from '@/utils/csvParser'
import { parseMenuText } from '@/utils/menuParser'
import { TEST_MODE } from '@/config'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const totalSteps = 3
const completing = ref(false)

const onboardingData = ref({
  restaurantName: '',
  businessType: 'cafe',
  address: '',
  uploadMethod: null,
  menuFile: null,
})

const menuItems = ref([])
const ocrFileInput = ref(null)
const csvFileInput = ref(null)
const itemImageInputs = ref([])
const processingOCR = ref(false)
const ocrProgress = ref(0)
const ocrError = ref('')
const ocrSuccessMessage = ref('')

// Enhanced OCR features
const ocrSubMethod = ref('live') // 'live', 'saved', 'csv'
const selectedOCRFile = ref(null)
const selectedCSVFile = ref(null)
const selectedSavedOCRImage = ref(null)
const parsedOCRText = ref('')
const editableOCRText = ref('')
const parsedOCRSections = ref([])
const ocrConfidence = ref(null)
const savedOCRImages = ref([]) // Library of verified menu images

const totalParsedItems = computed(() => {
  return parsedOCRSections.value.reduce((sum, section) => sum + section.items.length, 0)
})

const canProceedFromUpload = computed(() => {
  if (!onboardingData.value.uploadMethod) return false
  if (onboardingData.value.uploadMethod === 'manual') return true
  // For OCR method, we need parsed sections or menuItems populated
  if (onboardingData.value.uploadMethod === 'ocr') {
    return menuItems.value.length > 0 || parsedOCRSections.value.length > 0
  }
  return onboardingData.value.menuFile !== null || menuItems.value.length > 0
})

const canCompleteOnboarding = computed(() => {
  return menuItems.value.length > 0 && 
         menuItems.value.every(item => item.name && item.price)
})

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
    
    // If moving to step 3 and manual entry, add a default item
    if (currentStep.value === 3 && menuItems.value.length === 0) {
      if (onboardingData.value.uploadMethod === 'manual') {
        addMenuItem()
      } else {
        // Simulate processing uploaded file
        simulateMenuExtraction()
      }
    }
  }
}

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const selectUploadMethod = (method) => {
  onboardingData.value.uploadMethod = method
  onboardingData.value.menuFile = null
}

const triggerFileUpload = (type) => {
  if (type === 'ocr' && ocrFileInput.value) {
    ocrFileInput.value.click()
  } else if (type === 'csv' && csvFileInput.value) {
    csvFileInput.value.click()
  }
}

const handleOCRUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      ocrError.value = 'File size must be less than 10MB'
      return
    }
    selectedOCRFile.value = file
    onboardingData.value.menuFile = file
    ocrError.value = ''
    ocrSuccessMessage.value = ''
    parsedOCRText.value = ''
    parsedOCRSections.value = []
  }
}

const processOCRFile = async (file) => {
  if (!file) return
  
  processingOCR.value = true
  ocrProgress.value = 0
  ocrError.value = ''
  ocrSuccessMessage.value = ''
  
  try {
    console.log('🔍 Starting OCR processing...', { fileName: file.name, TEST_MODE })
    
    const response = await ocrService.parseMenuImage(
      file,
      (percent) => {
        console.log('OCR progress:', percent + '%')
        ocrProgress.value = percent
      }
    )
    
    console.log('✅ OCR completed:', response)
    
    parsedOCRText.value = response.data.parsedText || ''
    editableOCRText.value = parsedOCRText.value
    ocrConfidence.value = response.data.confidence || null
    parsedOCRSections.value = response.data.sections || []
    
    // Save to image library
    const imageData = {
      id: Date.now().toString(),
      name: file.name,
      date: new Date().toISOString(),
      preview: URL.createObjectURL(file),
      parsedText: parsedOCRText.value,
      sections: parsedOCRSections.value,
      confidence: ocrConfidence.value
    }
    savedOCRImages.value.unshift(imageData)
    // Keep only last 10 images
    if (savedOCRImages.value.length > 10) {
      savedOCRImages.value = savedOCRImages.value.slice(0, 10)
    }
    
    if (!parsedOCRText.value.trim()) {
      ocrError.value = 'No text found in image. Please try a clearer image with visible text.'
    } else if (parsedOCRSections.value.length === 0) {
      ocrSuccessMessage.value = 'Text extracted! Could not auto-parse menu structure. You can edit the text below.'
    } else {
      ocrSuccessMessage.value = `Successfully parsed ${parsedOCRSections.value.length} section(s) with ${totalParsedItems.value} item(s)!`
      setTimeout(() => {
        ocrSuccessMessage.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('❌ OCR processing failed:', err)
    ocrError.value = err.message || 'Failed to process image. Please try again with a clearer image.'
  } finally {
    processingOCR.value = false
    ocrProgress.value = 100
  }
}

const handleCSVUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.name.endsWith('.csv')) {
      ocrError.value = 'Please select a CSV file'
      return
    }
    selectedCSVFile.value = file
    onboardingData.value.menuFile = file
    ocrError.value = ''
    ocrSuccessMessage.value = ''
    parsedOCRText.value = ''
    parsedOCRSections.value = []
  }
}

const processCSVFile = async (file) => {
  if (!file) return
  
  ocrError.value = ''
  ocrSuccessMessage.value = ''
  
  try {
    const text = await file.text()
    const sections = parseCSV(text)
    
    parsedOCRSections.value = sections
    parsedOCRText.value = sections.map(s => 
      `${s.name}\n${s.items.map(i => `  ${i.name}${i.description ? ' - ' + i.description : ''} $${i.price.toFixed(2)}`).join('\n')}`
    ).join('\n\n')
    editableOCRText.value = parsedOCRText.value
    
    if (sections.length === 0) {
      ocrError.value = 'No valid menu items found in CSV. Please check the format.'
    } else {
      ocrSuccessMessage.value = `Successfully parsed ${sections.length} section(s) with ${totalParsedItems.value} item(s)!`
      setTimeout(() => {
        ocrSuccessMessage.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('CSV parsing failed:', err)
    ocrError.value = err.message || 'Failed to parse CSV file. Please check the format.'
  }
}

const selectSavedOCRImage = (img) => {
  selectedSavedOCRImage.value = img
}

const loadSavedOCRImage = () => {
  if (!selectedSavedOCRImage.value) return
  
  parsedOCRText.value = selectedSavedOCRImage.value.parsedText || ''
  editableOCRText.value = parsedOCRText.value
  parsedOCRSections.value = selectedSavedOCRImage.value.sections || []
  ocrConfidence.value = selectedSavedOCRImage.value.confidence || null
  ocrSuccessMessage.value = 'Loaded saved menu image!'
  setTimeout(() => {
    ocrSuccessMessage.value = ''
  }, 3000)
}

const confirmParsedMenu = () => {
  if (!editableOCRText.value.trim() && parsedOCRSections.value.length === 0) {
    ocrError.value = 'Menu text is empty'
    return
  }
  
  // If text was edited, re-parse it
  if (editableOCRText.value.trim() && editableOCRText.value !== parsedOCRText.value) {
    parsedOCRSections.value = parseMenuText(editableOCRText.value)
    parsedOCRText.value = editableOCRText.value
  }
  
  // Convert parsed sections to menu items format
  const items = []
  parsedOCRSections.value.forEach(section => {
    section.items.forEach(item => {
      const price = parseFloat(item.price) || 0
      if (price > 0 && item.name && item.name.trim().length > 2) {
        items.push({
          name: item.name.trim(),
          price: price.toString(),
          category: section.name || 'Menu Items',
          description: (item.description || '').trim(),
          image: null,
          imagePreview: null,
        })
      }
    })
  })
  
  if (items.length > 0) {
    menuItems.value = items
    ocrSuccessMessage.value = `✅ Confirmed! ${items.length} menu item(s) ready for step 3.`
    setTimeout(() => {
      ocrSuccessMessage.value = ''
    }, 3000)
  } else {
    ocrError.value = 'No valid menu items found. Please edit the text and try again.'
  }
}

const clearParsedOCR = () => {
  parsedOCRText.value = ''
  editableOCRText.value = ''
  parsedOCRSections.value = []
  ocrConfidence.value = null
  selectedOCRFile.value = null
  selectedCSVFile.value = null
  selectedSavedOCRImage.value = null
  ocrError.value = ''
  ocrSuccessMessage.value = ''
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const downloadCSVTemplate = () => {
  const csvContent = 'name,price,description,category\nEspresso,3.50,Rich and bold coffee,Coffee\nCappuccino,4.50,Espresso with steamed milk,Coffee\nCroissant,3.00,Buttery French pastry,Pastry'
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'menu_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    if (ocrSubMethod.value === 'csv') {
      if (!file.name.endsWith('.csv')) {
        ocrError.value = 'Please drop a CSV file'
        return
      }
      selectedCSVFile.value = file
    } else {
      if (file.size > 10 * 1024 * 1024) {
        ocrError.value = 'File size must be less than 10MB'
        return
      }
      selectedOCRFile.value = file
    }
    onboardingData.value.menuFile = file
    ocrError.value = ''
  }
}

const simulateMenuExtraction = () => {
  // Only simulate if no items were extracted from OCR/CSV
  if (menuItems.value.length === 0) {
    console.log('⚠️ No items extracted, using simulated data')
    menuItems.value = [
      { name: 'Espresso', price: '3.50', category: 'Coffee', image: null, imagePreview: null },
      { name: 'Cappuccino', price: '4.50', category: 'Coffee', image: null, imagePreview: null },
      { name: 'Croissant', price: '3.00', category: 'Pastry', image: null, imagePreview: null },
    ]
  } else {
    console.log('✅ Using extracted items:', menuItems.value.length)
  }
}

const addMenuItem = () => {
  menuItems.value.push({
    name: '',
    price: '',
    category: '',
    image: null,
    imagePreview: null,
  })
}

const removeMenuItem = (index) => {
  menuItems.value.splice(index, 1)
}

const triggerItemImageUpload = (index) => {
  if (itemImageInputs.value[index]) {
    itemImageInputs.value[index].click()
  }
}

const handleItemImageUpload = (index, event) => {
  const file = event.target.files[0]
  if (file) {
    menuItems.value[index].image = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      menuItems.value[index].imagePreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const completeOnboarding = async () => {
  completing.value = true

  try {
    const merchantId = authStore.merchantId || authStore.user?.merchantId
    if (!merchantId) {
      throw new Error('Merchant ID not found. Please log in again.')
    }

    // Group menu items by category to create sections
    const sectionsMap = new Map()
    
    menuItems.value.forEach((item) => {
      const category = item.category || 'Other'
      if (!sectionsMap.has(category)) {
        sectionsMap.set(category, [])
      }
      sectionsMap.get(category).push({
        name: item.name,
        description: null, // Can be extended later
        price: parseFloat(item.price) || 0,
        is_available: true,
      })
    })

    // Convert map to sections array
    const sections = Array.from(sectionsMap.entries()).map(([categoryName, items]) => ({
      name: categoryName,
      items: items,
    }))

    // If no sections, create a default one
    if (sections.length === 0) {
      sections.push({
        name: 'Menu Items',
        items: [],
      })
    }

    // Create menu name from restaurant name or default
    const menuName = onboardingData.value.restaurantName || 'Main Menu'

    // Call backend API to create/update menu
    const response = await menuService.createOrUpdateMenu({
      merchantId,
      menuName,
      orderEnabled: true,
      sections,
    })

    // Update user profile with restaurant name
    authStore.updateUserProfile({
      restaurantName: onboardingData.value.restaurantName,
      businessType: onboardingData.value.businessType,
      onboardingCompleted: true,
    })

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    const errorMessage = error.response?.data?.error || error.message || 'Failed to complete setup. Please try again.'
    alert(errorMessage)
  } finally {
    completing.value = false
  }
}

const skipImages = () => {
  completeOnboarding()
}
</script>

<style scoped>
/* Light Theme - Updated Design Handoff */
.onboarding-page {
  min-height: 100vh;
  background-color: #F8F8F7;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
}

/* Progress Bar */
.progress-bar {
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E4;
  position: sticky;
  top: 0;
  z-index: 20;
}

.progress-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px 24px;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 18px;
  font-weight: 600;
  color: #0b0706;
  margin: 0;
}

.back-button {
  background: none;
  border: none;
  color: #0b0706;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: all 120ms ease-out;
}

.back-button:hover {
  opacity: 0.7;
}

.progress-steps {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-step {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background-color: #E5E5E4;
  transition: all 120ms ease-out;
}

.progress-step-active {
  background-color: #4A1A28;
}

.progress-text {
  font-size: 13px;
  color: #737373;
  margin: 0;
}

/* Content */
.onboarding-content {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Step Card */
.step-card {
  background-color: #FEFEFE;
  border: 2px solid #E5E5E4;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.step-title {
  font-size: 24px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 8px 0;
}

.step-description {
  font-size: 15px;
  color: #737373;
  margin: 0;
}

.step-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0b0706;
}

.required {
  color: #DC2626;
}

.input-field {
  width: 100%;
  background-color: #FFFFFF;
  border: 1px solid #D4D4D3;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
  min-height: 48px;
  transition: all 120ms ease-out;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #0b0706;
}

.input-field::placeholder {
  color: #737373;
}

.select-field {
  cursor: pointer;
}

.textarea-field {
  min-height: 80px;
  resize: vertical;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #4A1A28 0%, #5D1F33 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  transition: all 120ms ease-out;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 26, 40, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5D1F33 0%, #4A1A28 100%);
  box-shadow: 0 4px 12px rgba(74, 26, 40, 0.3);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #FFFFFF;
  color: #0b0706;
  border: 1px solid #D4D4D3;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  transition: all 120ms ease-out;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  border-color: #4A1A28;
  background-color: #FAFAF9;
}

.btn-full {
  width: 100%;
}

/* Override Tailwind classes with design system */
:deep(.card) {
  background-color: #FEFEFE;
  border: 2px solid #E5E5E4;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.input) {
  width: 100%;
  background-color: #FFFFFF;
  border: 1px solid #D4D4D3;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
  min-height: 48px;
  transition: all 120ms ease-out;
  box-sizing: border-box;
}

:deep(.btn) {
  min-height: 48px;
  font-family: 'Inter', system-ui, sans-serif;
  transition: all 120ms ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .onboarding-content {
    padding: 24px 16px;
  }
  
  .step-card {
    padding: 24px;
  }
}
</style>