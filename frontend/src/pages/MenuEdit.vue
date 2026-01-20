<template>
  <div class="menu-edit-page">
    <!-- Header -->
    <div class="header-bar">
      <div class="header-content">
        <div class="header-top">
          <div>
            <h1 class="page-title">Edit Menu</h1>
            <p v-if="menuName" class="menu-subtitle">{{ menuName }}</p>
          </div>
          <button
            @click="router.push('/dashboard')"
            class="btn-link"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>

    <div class="content">
      <!-- Loading State -->
      <div v-if="loading" class="empty-state">
        <div class="empty-icon">⏳</div>
        <p class="empty-text">Loading menu...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-card">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Failed to Load Menu</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="loadMenu" class="btn-primary">
          Try Again
        </button>
      </div>

      <!-- Menu Edit Form -->
      <div v-else class="form-container">
        <!-- Menu Name -->
        <div class="section-card">
          <label class="input-label">
            Menu Name <span class="required">*</span>
          </label>
          <input
            v-model="menuName"
            type="text"
            class="input-field"
            placeholder="e.g., Main Menu, Breakfast Menu"
          />
        </div>

        <!-- Upload Method Tabs -->
        <div class="section-card">
          <h3 class="section-title">📋 Update Menu Items</h3>
          <p class="section-description">Choose how you'd like to update your menu</p>
          
          <div class="tabs-container">
            <button
              @click="uploadMethod = 'ocr'"
              class="tab-button"
              :class="{ 'tab-button-active': uploadMethod === 'ocr' }"
            >
              📷 OCR Upload
            </button>
            <button
              @click="uploadMethod = 'csv'"
              class="tab-button"
              :class="{ 'tab-button-active': uploadMethod === 'csv' }"
            >
              📊 CSV Upload
            </button>
            <button
              @click="uploadMethod = 'manual'"
              class="tab-button"
              :class="{ 'tab-button-active': uploadMethod === 'manual' }"
            >
              ✏️ Manual Entry
            </button>
          </div>

          <!-- OCR Upload -->
          <div v-if="uploadMethod === 'ocr'" class="upload-section">
            <div
              class="upload-area"
              @click="ocrFileInput?.click()"
            >
              <input
                ref="ocrFileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleOCRUpload"
              />
              <div v-if="!selectedOCRFile" class="upload-icon">📷</div>
              <div v-else class="upload-icon">✅</div>
              <p class="upload-text">
                {{ selectedOCRFile ? selectedOCRFile.name : 'Click to upload menu image' }}
              </p>
              <p class="upload-hint">PNG, JPG up to 10MB</p>
            </div>
            
            <button
              v-if="selectedOCRFile && !parsedOCRText"
              @click="processOCRFile"
              :disabled="processingOCR"
              class="btn-primary btn-full"
            >
              <span v-if="processingOCR">Processing... {{ ocrProgress }}%</span>
              <span v-else>Parse Menu</span>
            </button>

            <!-- OCR Results -->
            <div v-if="parsedOCRText" class="ocr-results">
              <div class="info-banner info-banner-success">
                <p class="info-banner-title">✅ OCR Results</p>
                <p class="info-banner-text">
                  Found {{ totalParsedItems }} items. Review and edit below if needed.
                </p>
              </div>
              
              <div class="form-group">
                <label class="input-label">
                  Editable OCR Text
                </label>
                <textarea
                  v-model="editableOCRText"
                  rows="10"
                  class="input-field textarea-field"
                  placeholder="Edit the extracted text here..."
                ></textarea>
                <button
                  @click="reparseOCRText"
                  class="btn-secondary"
                >
                  Re-parse Text
                </button>
              </div>

              <!-- Parsed Sections Preview -->
              <div v-if="parsedOCRSections.length > 0" class="parsed-preview">
                <h4 class="parsed-preview-title">📋 Parsed Menu Structure</h4>
                <div v-for="(section, idx) in parsedOCRSections" :key="idx" class="parsed-section">
                  <p class="parsed-section-name">{{ section.name }} ({{ section.items.length }} items)</p>
                  <ul class="parsed-items-list">
                    <li v-for="(item, itemIdx) in section.items" :key="itemIdx">
                      • {{ item.name }} - ${{ item.price.toFixed(2) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- CSV Upload -->
          <div v-if="uploadMethod === 'csv'" class="upload-section">
            <div
              class="upload-area"
              @click="csvFileInput?.click()"
            >
              <input
                ref="csvFileInput"
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleCSVUpload"
              />
              <div v-if="!selectedCSVFile" class="upload-icon">📊</div>
              <div v-else class="upload-icon">✅</div>
              <p class="upload-text">
                {{ selectedCSVFile ? selectedCSVFile.name : 'Click to upload CSV file' }}
              </p>
              <p class="upload-hint">CSV file with columns: name, price, description, category</p>
            </div>
            <a href="#" @click.prevent="downloadCSVTemplate" class="download-link">
              📥 Download CSV Template
            </a>
          </div>

          <!-- Manual Entry -->
          <div v-if="uploadMethod === 'manual'" class="manual-entry-section">
            <div class="manual-entry-info">
              <p class="manual-entry-text">
                Add or edit menu items manually. Items are organized by sections.
              </p>
              
              <!-- Sections -->
              <div v-for="(section, sectionIdx) in menuSections" :key="sectionIdx" class="section-item">
                <div class="section-header">
                  <input
                    v-model="section.name"
                    type="text"
                    class="input-field section-name-input"
                    placeholder="Section Name (e.g., Breakfast, Lunch)"
                  />
                  <button
                    @click="removeSection(sectionIdx)"
                    class="btn-remove"
                  >
                    × Remove
                  </button>
                </div>
                
                <!-- Items in Section -->
                <div v-for="(item, itemIdx) in section.items" :key="itemIdx" class="item-row">
                  <div class="item-inputs">
                    <input
                      v-model="item.name"
                      type="text"
                      placeholder="Item name"
                      class="input-field item-input"
                    />
                    <input
                      v-model.number="item.price"
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      class="input-field item-input"
                    />
                    <input
                      v-model="item.category"
                      type="text"
                      placeholder="Category"
                      class="input-field item-input"
                    />
                  </div>
                  <textarea
                    v-model="item.description"
                    rows="2"
                    placeholder="Description (optional)"
                    class="input-field textarea-field"
                  ></textarea>
                  <button
                    @click="removeItem(sectionIdx, itemIdx)"
                    class="btn-remove-small"
                  >
                    Remove Item
                  </button>
                </div>
                
                <button
                  @click="addItem(sectionIdx)"
                  class="btn-secondary"
                >
                  + Add Item to {{ section.name || 'Section' }}
                </button>
              </div>
              
              <button
                @click="addSection"
                class="btn-secondary btn-full"
              >
                + Add New Section
              </button>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="section-card save-section">
          <button
            @click="saveMenu"
            :disabled="saving || !canSave"
            class="btn-primary btn-full"
          >
            <span v-if="saving">Saving menu...</span>
            <span v-else>💾 Save Menu Changes</span>
          </button>
          <p v-if="!canSave" class="save-hint">
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

<style scoped>
/* Light Theme - Updated Design Handoff */
.menu-edit-page {
  min-height: 100vh;
  background-color: #F8F8F7;
  font-family: 'Inter', system-ui, sans-serif;
  color: #0b0706;
}

/* Header */
.header-bar {
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E4;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 4px 0;
}

.menu-subtitle {
  font-size: 14px;
  color: #737373;
  margin: 0;
}

.btn-link {
  background: none;
  border: none;
  color: #0b0706;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: underline;
  transition: all 120ms ease-out;
}

.btn-link:hover {
  opacity: 0.7;
}

/* Content */
.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 16px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 15px;
  color: #737373;
  margin: 0;
}

/* Error Card */
.error-card {
  background-color: #FEFEFE;
  border: 2px solid #DC2626;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #DC2626;
  margin: 0 0 8px 0;
}

.error-message {
  font-size: 15px;
  color: #737373;
  margin: 0 0 16px 0;
}

/* Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section Card */
.section-card {
  background-color: #FEFEFE;
  border: 2px solid #E5E5E4;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #737373;
  margin: 0 0 16px 0;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #E5E5E4;
  margin-bottom: 16px;
}

.tab-button {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #737373;
  cursor: pointer;
  transition: all 120ms ease-out;
  font-family: 'Inter', system-ui, sans-serif;
}

.tab-button:hover {
  color: #0b0706;
}

.tab-button-active {
  color: #4A1A28;
  border-bottom-color: #4A1A28;
}

/* Input Fields */
.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0b0706;
  margin-bottom: 8px;
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

.textarea-field {
  min-height: 120px;
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

/* Upload Area */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-area {
  border: 2px dashed #D4D4D3;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 120ms ease-out;
  background-color: #FFFFFF;
}

.upload-area:hover {
  border-color: #4A1A28;
  background-color: #FAFAF9;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 15px;
  font-weight: 500;
  color: #0b0706;
  margin: 0 0 4px 0;
}

.upload-hint {
  font-size: 13px;
  color: #737373;
  margin: 0;
}

.download-link {
  font-size: 14px;
  color: #4A1A28;
  text-decoration: underline;
  text-align: center;
  display: block;
  transition: all 120ms ease-out;
}

.download-link:hover {
  opacity: 0.7;
}

/* OCR Results */
.ocr-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-banner {
  border-radius: 8px;
  padding: 12px 16px;
}

.info-banner-success {
  background-color: #E3F2FD;
  border: 1px solid #90CAF9;
}

.info-banner-title {
  font-size: 13px;
  font-weight: 600;
  color: #1976D2;
  margin: 0 0 4px 0;
}

.info-banner-text {
  font-size: 13px;
  color: #1565C0;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Parsed Preview */
.parsed-preview {
  border: 1px solid #E5E5E4;
  border-radius: 12px;
  padding: 16px;
  background-color: #FFFFFF;
}

.parsed-preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 12px 0;
}

.parsed-section {
  margin-bottom: 16px;
}

.parsed-section:last-child {
  margin-bottom: 0;
}

.parsed-section-name {
  font-size: 15px;
  font-weight: 600;
  color: #0b0706;
  margin: 0 0 8px 0;
}

.parsed-items-list {
  font-size: 14px;
  color: #0b0706;
  margin: 0 0 0 16px;
  padding: 0;
  list-style: disc;
}

.parsed-items-list li {
  margin: 4px 0;
}

/* Manual Entry */
.manual-entry-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manual-entry-info {
  background-color: #F5F5F4;
  border: 1px solid #E5E5E4;
  border-radius: 12px;
  padding: 16px;
}

.manual-entry-text {
  font-size: 14px;
  color: #0b0706;
  margin: 0 0 16px 0;
}

.section-item {
  margin-bottom: 24px;
}

.section-item:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-name-input {
  flex: 1;
  font-weight: 600;
}

.btn-remove {
  background: none;
  border: none;
  color: #DC2626;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 120ms ease-out;
}

.btn-remove:hover {
  opacity: 0.8;
}

.item-row {
  background-color: #FFFFFF;
  border: 1px solid #E5E5E4;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.item-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.item-input {
  min-height: 40px;
  font-size: 14px;
}

.btn-remove-small {
  background: none;
  border: none;
  color: #DC2626;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  padding: 4px 0;
  transition: all 120ms ease-out;
}

.btn-remove-small:hover {
  opacity: 0.8;
}

/* Save Section */
.save-section {
  background-color: #E3F2FD;
  border-color: #90CAF9;
}

.save-hint {
  font-size: 13px;
  color: #737373;
  margin: 8px 0 0 0;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .item-inputs {
    grid-template-columns: 1fr;
  }
  
  .tabs-container {
    overflow-x: auto;
    scrollbar-width: none;
  }
  
  .tabs-container::-webkit-scrollbar {
    display: none;
  }
  
  .tab-button {
    white-space: nowrap;
  }
}
</style>
