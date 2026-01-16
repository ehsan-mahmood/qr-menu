<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button @click="goToDashboard" class="text-gray-600 hover:text-gray-900">
            <span class="text-2xl">←</span>
          </button>
          <h1 class="text-xl font-bold text-gray-900">OCR Menu Import</h1>
          <div class="w-8"></div>
        </div>
      </div>
    </div>
    
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <!-- Instructions -->
      <div class="card bg-blue-50 border border-blue-200 mb-6">
        <h3 class="font-bold text-blue-900 mb-2">📸 Menu Import Options</h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• <strong>Live OCR Scan:</strong> Upload a photo and extract text automatically</li>
          <li>• <strong>Pre-Tested Image:</strong> Use a previously verified menu image</li>
          <li>• <strong>CSV Upload:</strong> Import from a spreadsheet file</li>
          <li>• Review and edit the parsed menu before saving</li>
        </ul>
      </div>
      
      <!-- Upload Method Selection -->
      <div class="card mb-6">
        <h3 class="font-bold text-gray-900 mb-4">Select Import Method</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <button
            @click="uploadMethod = 'ocr'"
            class="p-4 border-2 rounded-lg transition-all text-left"
            :class="uploadMethod === 'ocr' 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-300'"
          >
            <div class="text-2xl mb-2">📷</div>
            <h4 class="font-semibold text-gray-900 mb-1">Live OCR Scan</h4>
            <p class="text-xs text-gray-600">Upload photo for text extraction</p>
          </button>
          
          <button
            @click="uploadMethod = 'image'"
            class="p-4 border-2 rounded-lg transition-all text-left"
            :class="uploadMethod === 'image' 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-300'"
          >
            <div class="text-2xl mb-2">🖼️</div>
            <h4 class="font-semibold text-gray-900 mb-1">Pre-Tested Image</h4>
            <p class="text-xs text-gray-600">Use verified menu image</p>
          </button>
          
          <button
            @click="uploadMethod = 'csv'"
            class="p-4 border-2 rounded-lg transition-all text-left"
            :class="uploadMethod === 'csv' 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-300'"
          >
            <div class="text-2xl mb-2">📊</div>
            <h4 class="font-semibold text-gray-900 mb-1">CSV Upload</h4>
            <p class="text-xs text-gray-600">Import from spreadsheet</p>
          </button>
        </div>
      </div>
      
      <!-- Upload Section -->
      <div class="card mb-6">
        <h3 class="font-bold text-gray-900 mb-4">
          <span v-if="uploadMethod === 'ocr'">Upload Menu Image for OCR</span>
          <span v-else-if="uploadMethod === 'image'">Select Pre-Tested Image</span>
          <span v-else-if="uploadMethod === 'csv'">Upload CSV File</span>
          <span v-else>Upload Menu</span>
        </h3>
        
        <!-- Pre-Tested Image Library (if image method selected) -->
        <div v-if="uploadMethod === 'image'" class="mb-4">
          <div v-if="savedImages.length === 0" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div class="text-4xl mb-2">📚</div>
            <p class="text-gray-600 mb-2">No saved menu images yet</p>
            <p class="text-sm text-gray-500">Upload images using OCR Scan to build your library</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="(img, idx) in savedImages"
              :key="idx"
              @click="selectSavedImage(img)"
              class="border-2 rounded-lg p-3 cursor-pointer transition-all"
              :class="selectedSavedImage?.id === img.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-300'"
            >
              <img :src="img.preview" alt="Menu" class="w-full h-32 object-cover rounded mb-2" />
              <p class="text-xs font-medium text-gray-900 truncate">{{ img.name }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(img.date) }}</p>
            </div>
          </div>
        </div>
        
        <!-- File Input (for OCR and CSV) -->
        <div v-if="uploadMethod === 'ocr' || uploadMethod === 'csv'" class="mb-4">
          <label
            class="block w-full cursor-pointer"
            :class="{ 'opacity-50': processing }"
          >
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <div v-if="!selectedFile" class="space-y-2">
                <div class="text-4xl">{{ uploadMethod === 'csv' ? '📊' : '📷' }}</div>
                <p class="text-gray-600">
                  {{ uploadMethod === 'csv' ? 'Click to upload CSV file' : 'Click to upload menu image' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ uploadMethod === 'csv' ? 'CSV file (name, price, description, category)' : 'PNG, JPG up to 10MB' }}
                </p>
              </div>
              <div v-else class="space-y-2">
                <div class="text-4xl">✅</div>
                <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <input
              type="file"
              :accept="uploadMethod === 'csv' ? '.csv' : 'image/*'"
              class="hidden"
              @change="handleFileSelect"
              :disabled="processing"
            />
          </label>
          <div v-if="uploadMethod === 'csv'" class="mt-2 text-center">
            <a href="#" @click.prevent="downloadCSVTemplate" class="text-sm text-primary-600 hover:underline">
              📥 Download CSV Template
            </a>
          </div>
        </div>
        
        <!-- Upload/Process Button -->
        <button
          v-if="(selectedFile && !parsedText) || (uploadMethod === 'image' && selectedSavedImage)"
          @click="handleProcessClick"
          :disabled="processing"
          class="w-full btn btn-primary disabled:opacity-50"
        >
          <span v-if="processing">Processing... {{ progress }}%</span>
          <span v-else-if="uploadMethod === 'image'">Load Selected Image</span>
          <span v-else-if="uploadMethod === 'csv'">Parse CSV</span>
          <span v-else>Parse Menu</span>
        </button>
        
        <!-- Debug Info (visible on page) -->
        <div v-if="selectedFile" class="mt-2 p-2 bg-gray-100 rounded text-xs">
          <p><strong>Debug:</strong> File: {{ selectedFile.name }}, Method: {{ uploadMethod }}, TEST_MODE: {{ TEST_MODE }}</p>
        </div>
      </div>
      
      <!-- Processing Status -->
      <div v-if="processing" class="card bg-yellow-50 border border-yellow-200 mb-6">
        <div class="text-center">
          <div class="text-4xl mb-2">⏳</div>
          <p class="font-medium text-yellow-900">Processing your menu...</p>
          <p class="text-sm text-yellow-700">This may take a few moments</p>
          <div class="mt-4 bg-yellow-200 rounded-full h-2 overflow-hidden">
            <div
              class="bg-yellow-600 h-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Parsed Text -->
      <div v-if="parsedText" class="card mb-6">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-900">Extracted Text</h3>
          <span v-if="confidence" class="text-sm text-gray-600">
            Confidence: {{ (confidence * 100).toFixed(0) }}%
          </span>
        </div>
        
        <textarea
          v-model="editableText"
          rows="8"
          class="input font-mono text-sm resize-none mb-4"
          placeholder="Raw extracted text..."
        ></textarea>
        
        <!-- Structured Menu Preview -->
        <div v-if="parsedSections && parsedSections.length > 0" class="mt-4 border-t pt-4">
          <h4 class="font-bold text-gray-900 mb-3">📋 Parsed Menu Structure</h4>
          <p class="text-sm text-gray-600 mb-3">
            Found {{ parsedSections.length }} section(s) with {{ totalItems }} item(s)
          </p>
          
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div v-for="(section, sIndex) in parsedSections" :key="sIndex" class="bg-gray-50 rounded-lg p-3">
              <h5 class="font-semibold text-gray-900 mb-2">{{ section.name }}</h5>
              <div class="space-y-2">
                <div v-for="(item, iIndex) in section.items" :key="iIndex" class="text-sm bg-white p-2 rounded border border-gray-200">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">{{ item.name }}</p>
                      <p v-if="item.description" class="text-xs text-gray-600 mt-1">{{ item.description }}</p>
                    </div>
                    <span class="font-semibold text-primary-600 ml-2">${{ item.price.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex gap-2">
          <button @click="saveMenu" class="flex-1 btn btn-primary">
            Save Menu
          </button>
          <button @click="clearParsedText" class="flex-1 btn btn-secondary">
            Clear
          </button>
        </div>
      </div>
      
      <!-- Success Message -->
      <Transition name="fade">
        <div v-if="successMessage" class="card bg-green-50 border border-green-200">
          <div class="text-center">
            <div class="text-4xl mb-2">✅</div>
            <p class="font-medium text-green-900">{{ successMessage }}</p>
          </div>
        </div>
      </Transition>
      
      <!-- Error Message -->
      <Transition name="fade">
        <div v-if="errorMessage" class="card bg-red-50 border border-red-200">
          <div class="text-center">
            <div class="text-4xl mb-2">⚠️</div>
            <p class="font-medium text-red-900">{{ errorMessage }}</p>
          </div>
        </div>
      </Transition>
      
      <!-- Tips -->
      <div class="card bg-gray-50">
        <h3 class="font-bold text-gray-900 mb-2">💡 Tips for Best Results</h3>
        <ul class="text-sm text-gray-700 space-y-1">
          <li>• Ensure good lighting and focus</li>
          <li>• Avoid shadows and glare</li>
          <li>• Capture text horizontally</li>
          <li>• Use high resolution images</li>
          <li>• Review and edit the parsed text before saving</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ocrService from '@/services/ocrService'
import { parseCSV } from '@/utils/csvParser'
import { parseMenuText } from '@/utils/menuParser'
import { TEST_MODE } from '@/config'

const router = useRouter()

const uploadMethod = ref('ocr') // 'ocr', 'image', 'csv'
const selectedFile = ref(null)
const selectedSavedImage = ref(null)
const processing = ref(false)
const progress = ref(0)
const parsedText = ref('')
const editableText = ref('')
const confidence = ref(null)
const successMessage = ref('')
const errorMessage = ref('')
const parsedSections = ref([])
const savedImages = ref([]) // Library of verified menu images

const totalItems = computed(() => {
  return parsedSections.value.reduce((sum, section) => sum + section.items.length, 0)
})

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (uploadMethod.value === 'csv') {
      if (!file.name.endsWith('.csv')) {
        errorMessage.value = 'Please select a CSV file'
        return
      }
    } else {
      if (file.size > 10 * 1024 * 1024) {
        errorMessage.value = 'File size must be less than 10MB'
        return
      }
    }
    selectedFile.value = file
    selectedSavedImage.value = null
    errorMessage.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleProcessClick = () => {
  // Show alert to confirm button click
  console.log('🔴 BUTTON CLICKED - handleProcessClick')
  console.log('Method:', uploadMethod.value)
  console.log('File:', selectedFile.value?.name)
  console.log('TEST_MODE:', TEST_MODE)
  
  processMenu()
}

const processMenu = async () => {
  console.log('=== processMenu called ===')
  console.log('uploadMethod:', uploadMethod.value)
  console.log('selectedFile:', selectedFile.value?.name)
  console.log('selectedSavedImage:', selectedSavedImage.value?.name)
  console.log('TEST_MODE:', TEST_MODE)
  
  if (uploadMethod.value === 'image') {
    if (!selectedSavedImage.value) {
      errorMessage.value = 'Please select a saved image'
      return
    }
    // Load saved image data
    parsedText.value = selectedSavedImage.value.parsedText || ''
    editableText.value = parsedText.value
    parsedSections.value = selectedSavedImage.value.sections || []
    confidence.value = selectedSavedImage.value.confidence || null
    successMessage.value = 'Loaded saved menu image!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    return
  }
  
  if (uploadMethod.value === 'csv') {
    await processCSV()
    return
  }
  
  // OCR processing - make sure we have a file
  if (!selectedFile.value) {
    errorMessage.value = 'Please select an image file first'
    console.error('❌ No file selected')
    return
  }
  
  // Ensure we're using OCR method
  if (uploadMethod.value !== 'ocr') {
    console.log('⚠️ Upload method was not OCR, switching to OCR')
    uploadMethod.value = 'ocr'
  }
  
  console.log('✅ Calling uploadAndParse...')
  await uploadAndParse()
}

const processCSV = async () => {
  if (!selectedFile.value) return
  
  processing.value = true
  errorMessage.value = ''
  successMessage.value = ''
  parsedSections.value = []
  
  try {
    const text = await selectedFile.value.text()
    const sections = parseCSV(text)
    
    parsedSections.value = sections
    parsedText.value = sections.map(s => 
      `${s.name}\n${s.items.map(i => `  ${i.name}${i.description ? ' - ' + i.description : ''} $${i.price.toFixed(2)}`).join('\n')}`
    ).join('\n\n')
    editableText.value = parsedText.value
    
    if (sections.length === 0) {
      errorMessage.value = 'No valid menu items found in CSV. Please check the format.'
    } else {
      successMessage.value = `Successfully parsed ${sections.length} section(s) with ${totalItems.value} item(s)!`
      setTimeout(() => { successMessage.value = '' }, 3000)
    }
  } catch (err) {
    console.error('CSV parsing failed:', err)
    errorMessage.value = err.message || 'Failed to parse CSV file. Please check the format.'
  } finally {
    processing.value = false
  }
}

const uploadAndParse = async () => {
  console.log('=== uploadAndParse START ===')
  
  if (!selectedFile.value) {
    errorMessage.value = 'Please select an image file first'
    console.error('❌ No file selected')
    return
  }
  
  console.log('File selected:', selectedFile.value.name, selectedFile.value.size, 'bytes')
  console.log('TEST_MODE value:', TEST_MODE)
  console.log('TEST_MODE type:', typeof TEST_MODE)
  
  // Check if we're in test mode
  if (!TEST_MODE) {
    const errorMsg = 'OCR in test mode requires TEST_MODE to be enabled. Current value: ' + TEST_MODE + '. Please check your .env file has VITE_TEST_MODE=true'
    errorMessage.value = errorMsg
    console.error('❌ TEST_MODE is false:', errorMsg)
    return
  }
  
  console.log('✅ TEST_MODE is enabled, proceeding with OCR...')
  
  processing.value = true
  progress.value = 0
  errorMessage.value = ''
  successMessage.value = ''
  parsedSections.value = []
  
  try {
    console.log('📸 Starting OCR processing for file:', selectedFile.value.name, 'TEST_MODE:', TEST_MODE)
    
    // Pass progress callback to update progress bar
    const response = await ocrService.parseMenuImage(
      selectedFile.value, 
      (percent) => {
        console.log('OCR progress:', percent + '%')
        progress.value = percent
      }
    )
    
    console.log('OCR response received:', response)
    
    progress.value = 100
    
    parsedText.value = response.data.parsedText || ''
    editableText.value = parsedText.value
    confidence.value = response.data.confidence || null
    parsedSections.value = response.data.sections || []
    
    // Save to image library
    const imageData = {
      id: Date.now().toString(),
      name: selectedFile.value.name,
      date: new Date().toISOString(),
      preview: URL.createObjectURL(selectedFile.value),
      parsedText: parsedText.value,
      sections: parsedSections.value,
      confidence: confidence.value
    }
    savedImages.value.unshift(imageData)
    // Keep only last 10 images
    if (savedImages.value.length > 10) {
      savedImages.value = savedImages.value.slice(0, 10)
    }
    
    if (!parsedText.value.trim()) {
      errorMessage.value = 'No text found in image. Please try a clearer image with visible text.'
    } else if (parsedSections.value.length === 0) {
      successMessage.value = 'Text extracted! Could not auto-parse menu structure. You can edit the text below.'
    } else {
      successMessage.value = `Successfully parsed ${parsedSections.value.length} section(s) with ${totalItems.value} item(s)!`
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('OCR parsing failed:', err)
    errorMessage.value = err.message || 'Failed to parse menu. Please try again with a clearer image.'
  } finally {
    processing.value = false
  }
}

const selectSavedImage = (img) => {
  selectedSavedImage.value = img
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const clearParsedText = () => {
  if (confirm('Clear the parsed text?')) {
    parsedText.value = ''
    editableText.value = ''
    confidence.value = null
    selectedFile.value = null
    selectedSavedImage.value = null
    progress.value = 0
    parsedSections.value = []
  }
}

const saveMenu = () => {
  if (!editableText.value.trim() && parsedSections.value.length === 0) {
    errorMessage.value = 'Menu text is empty'
    return
  }
  
  // If we have parsed sections, re-parse the edited text to update sections
  if (editableText.value.trim() && editableText.value !== parsedText.value) {
    // Re-parse if text was edited
    parsedSections.value = parseMenuText(editableText.value)
    parsedText.value = editableText.value
  }
  
  // Show success message - the parsed menu is already displayed
  successMessage.value = `Menu parsed successfully! Found ${parsedSections.value.length} section(s) with ${totalItems.value} item(s). You can edit the text above if needed.`
  
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
  
  // Optionally, you can navigate to onboarding to create the menu
  // For now, we'll keep the user on this page to review/edit
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToOnboarding = () => {
  // Navigate to onboarding to create the menu from parsed data
  router.push('/onboarding')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

