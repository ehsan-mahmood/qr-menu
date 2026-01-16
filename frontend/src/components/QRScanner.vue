<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">Scan QR Code</h3>
    
    <!-- Tabs for different scan methods -->
    <div class="mb-4 flex gap-2 border-b border-gray-200">
      <button
        @click="scanMethod = 'camera'"
        class="px-3 py-2 text-sm font-medium transition-colors"
        :class="scanMethod === 'camera' 
          ? 'text-primary-600 border-b-2 border-primary-600' 
          : 'text-gray-600 hover:text-gray-900'"
      >
        📷 Camera
      </button>
      <button
        @click="scanMethod = 'upload'"
        class="px-3 py-2 text-sm font-medium transition-colors"
        :class="scanMethod === 'upload' 
          ? 'text-primary-600 border-b-2 border-primary-600' 
          : 'text-gray-600 hover:text-gray-900'"
      >
        📁 Upload Image
      </button>
      <button
        @click="scanMethod = 'manual'"
        class="px-3 py-2 text-sm font-medium transition-colors"
        :class="scanMethod === 'manual' 
          ? 'text-primary-600 border-b-2 border-primary-600' 
          : 'text-gray-600 hover:text-gray-900'"
      >
        ⌨️ Manual
      </button>
    </div>
    
    <!-- Camera Scan Method -->
    <div v-if="scanMethod === 'camera'">
      <div v-if="!hasCamera" class="text-center py-8">
        <p class="text-gray-500 mb-4">{{ cameraErrorMessage }}</p>
        
        <!-- Info about camera access -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
          <p class="text-sm font-semibold text-yellow-900 mb-2">📱 Camera Access Notes:</p>
          <ul class="text-xs text-yellow-800 space-y-1 list-disc list-inside">
            <li>Camera access requires HTTPS or localhost</li>
            <li>If using IP address (not localhost), camera won't work</li>
            <li>Use the upload image option or manual input instead</li>
          </ul>
        </div>
        
        <button @click="requestCamera" class="btn btn-primary mb-4">
          Try Enable Camera
        </button>
        
        <!-- Suggest alternative methods -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
          <p class="text-sm font-semibold text-blue-900 mb-1">💡 Alternative Options:</p>
          <p class="text-xs text-blue-800">
            You can use the <strong>"Upload Image"</strong> tab to scan a QR code from a photo, 
            or use the <strong>"Manual"</strong> tab to enter the QR code token directly.
          </p>
        </div>
      </div>
      
      <div v-else class="space-y-4">
        <!-- Video Preview -->
        <div class="relative bg-gray-900 rounded-lg overflow-hidden" style="aspect-ratio: 4/3;">
          <video
            ref="videoRef"
            class="w-full h-full object-cover"
            autoplay
            playsinline
          ></video>
          
          <!-- Scanning Overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-64 h-64 border-4 border-primary-500 rounded-lg"></div>
          </div>
          
          <div v-if="scanning" class="absolute top-4 left-4 right-4">
            <div class="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-center">
              Scanning...
            </div>
          </div>
        </div>
        
        <!-- Canvas for QR detection (hidden) -->
        <canvas ref="canvasRef" class="hidden"></canvas>
        
        <!-- Controls -->
        <div class="flex gap-2">
          <button
            v-if="!scanning"
            @click="startScanning"
            class="flex-1 btn btn-primary"
          >
            Start Scanning
          </button>
          <button
            v-else
            @click="stopScanning"
            class="flex-1 btn btn-secondary"
          >
            Stop Scanning
          </button>
        </div>
      </div>
    </div>
    
    <!-- Upload Image Method -->
    <div v-if="scanMethod === 'upload'" class="space-y-4">
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
        @click="triggerFileUpload"
        @dragover.prevent
        @drop.prevent="handleFileDrop"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />
        <div v-if="!selectedFile" class="space-y-2">
          <div class="text-4xl mb-2">📁</div>
          <p class="text-gray-600 font-medium">Click to upload QR code image</p>
          <p class="text-sm text-gray-500">or drag and drop</p>
          <p class="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
        </div>
        <div v-else class="space-y-2">
          <div class="text-4xl mb-2">✅</div>
          <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
          <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
          <div v-if="uploadedImagePreview" class="mt-4">
            <img 
              :src="uploadedImagePreview" 
              alt="Uploaded QR code" 
              class="max-w-full max-h-64 mx-auto rounded-lg border border-gray-300"
            />
          </div>
        </div>
      </div>
      
      <button
        v-if="selectedFile && !processingUpload"
        @click="processUploadedImage"
        class="w-full btn btn-primary"
      >
        Scan QR Code from Image
      </button>
      
      <div v-if="processingUpload" class="text-center py-4">
        <div class="text-2xl mb-2">⏳</div>
        <p class="text-gray-600">Processing image...</p>
      </div>
      
      <div v-if="uploadError" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-sm text-red-700">{{ uploadError }}</p>
      </div>
    </div>
    
    <!-- Manual Input Method -->
    <div v-if="scanMethod === 'manual'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Enter QR Code Token
        </label>
        <input
          v-model="manualCode"
          type="text"
          placeholder="Enter QR code token (e.g., token-1234567890)"
          class="input w-full font-mono"
          @keyup.enter="handleManualSubmit"
        />
        <p class="text-xs text-gray-500 mt-1">
          If you have the QR code token, enter it here directly
        </p>
      </div>
      
      <button @click="handleManualSubmit" class="w-full btn btn-primary">
        Submit
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import jsQR from 'jsqr'

const emit = defineEmits(['scan-success', 'scan-error'])

const videoRef = ref(null)
const canvasRef = ref(null)
const fileInputRef = ref(null)
const hasCamera = ref(false)
const scanning = ref(false)
const manualCode = ref('')
const cameraErrorMessage = ref('Camera access is required to scan QR codes')
const scanMethod = ref('camera') // 'camera', 'upload', 'manual'
const selectedFile = ref(null)
const uploadedImagePreview = ref(null)
const processingUpload = ref(false)
const uploadError = ref('')

let stream = null
let scanInterval = null

onMounted(() => {
  checkCameraAvailability()
})

onUnmounted(() => {
  stopScanning()
})

const checkCameraAvailability = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    hasCamera.value = devices.some(device => device.kind === 'videoinput')
  } catch (err) {
    console.error('Error checking camera:', err)
    hasCamera.value = false
  }
}

const requestCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
    hasCamera.value = true
    cameraErrorMessage.value = ''
  } catch (err) {
    console.error('Error accessing camera:', err)
    
    // Provide specific error messages
    if (err.name === 'NotAllowedError') {
      cameraErrorMessage.value = '❌ Camera access was denied. Please allow camera access in your browser settings.'
    } else if (err.name === 'NotFoundError') {
      cameraErrorMessage.value = '❌ No camera found on this device.'
    } else if (err.name === 'NotSupportedError' || err.name === 'TypeError') {
      cameraErrorMessage.value = '❌ Camera access not supported. This usually happens when accessing via IP address (not localhost). Use HTTPS or enter QR code manually below.'
    } else {
      cameraErrorMessage.value = `❌ Failed to access camera: ${err.message || 'Unknown error'}`
    }
    
    emit('scan-error', cameraErrorMessage.value)
  }
}

const startScanning = async () => {
  if (!stream) {
    await requestCamera()
  }
  
  if (!hasCamera.value || !videoRef.value || !canvasRef.value) {
    return
  }
  
  scanning.value = true
  
  // Real-time QR code scanning from video stream
  scanInterval = setInterval(() => {
    if (!videoRef.value || !canvasRef.value) return
    
    const video = videoRef.value
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')
    
    // Set canvas dimensions to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Detect QR code using jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code) {
      console.log('QR Code detected:', code.data)
      stopScanning()
      emit('scan-success', code.data)
    }
  }, 100) // Check every 100ms
}

const stopScanning = () => {
  scanning.value = false
  
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

const handleManualSubmit = () => {
  if (manualCode.value.trim()) {
    emit('scan-success', manualCode.value.trim())
    manualCode.value = ''
  }
}

// File upload methods
const triggerFileUpload = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = 'File size must be less than 10MB'
      return
    }
    selectedFile.value = file
    uploadError.value = ''
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = 'File size must be less than 10MB'
      return
    }
    selectedFile.value = file
    uploadError.value = ''
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const processUploadedImage = async () => {
  if (!selectedFile.value) return
  
  processingUpload.value = true
  uploadError.value = ''
  
  try {
    // Create image element
    const img = new Image()
    
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      // Set canvas dimensions
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image to canvas
      context.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Detect QR code using jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        console.log('QR Code detected from image:', code.data)
        emit('scan-success', code.data)
        // Reset after successful scan
        selectedFile.value = null
        uploadedImagePreview.value = null
        if (fileInputRef.value) {
          fileInputRef.value.value = ''
        }
      } else {
        uploadError.value = 'No QR code found in the image. Please try a clearer image or ensure the QR code is visible.'
      }
      
      processingUpload.value = false
    }
    
    img.onerror = () => {
      uploadError.value = 'Failed to load image. Please try another file.'
      processingUpload.value = false
    }
    
    // Load image from file
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.readAsDataURL(selectedFile.value)
  } catch (error) {
    console.error('Error processing uploaded image:', error)
    uploadError.value = 'Failed to process image. Please try again.'
    processingUpload.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

