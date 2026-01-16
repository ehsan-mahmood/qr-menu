import api from '@/utils/api'
import { TEST_MODE } from '@/config'
import Tesseract from 'tesseract.js'
import { parseMenuText } from '@/utils/menuParser'
import { preprocessImageForOCR } from '@/utils/imagePreprocessor'

export const ocrService = {
  // Upload and parse menu image using Tesseract.js in browser
  async parseMenuImage(imageFile, onProgress, options = {}) {
    const {
      enablePreprocessing = true, // Enable image preprocessing by default
      preprocessingOptions = {}, // Custom preprocessing options
    } = options
    console.log('=== OCR Service Called ===')
    console.log('TEST_MODE:', TEST_MODE)
    console.log('Image file:', imageFile?.name, imageFile?.size)
    
    if (TEST_MODE) {
      console.log('✅ Using TEST_MODE - Tesseract.js OCR')
      // Use Tesseract.js to actually OCR the image in the browser
      try {
        console.log('Starting OCR with Tesseract.js...', { fileName: imageFile.name, fileSize: imageFile.size })
        
        // Report initial progress
        if (onProgress) onProgress(5)
        
        // Preprocess image for better OCR results (if enabled)
        let processedImageFile = imageFile
        
        if (enablePreprocessing) {
          console.log('🖼️ Preprocessing image for OCR...')
          if (onProgress) onProgress(8)
          
          try {
            const defaultPreprocessingOptions = {
              grayscale: true,
              enhanceContrast: true,
              denoise: true,
              threshold: true,
              resize: true,
              maxWidth: 2000,
              maxHeight: 2000,
              thresholdValue: 128,
              contrastLevel: 1.2,
              ...preprocessingOptions, // Allow override
            }
            
            const preprocessedBlob = await preprocessImageForOCR(imageFile, defaultPreprocessingOptions)
            
            // Create a new File from the preprocessed blob
            processedImageFile = new File([preprocessedBlob], imageFile.name, {
              type: 'image/png',
              lastModified: Date.now(),
            })
            
            console.log('✅ Image preprocessing complete')
            if (onProgress) onProgress(10)
          } catch (preprocessError) {
            console.warn('⚠️ Image preprocessing failed, using original image:', preprocessError)
            // Continue with original image if preprocessing fails
            processedImageFile = imageFile
          }
        } else {
          console.log('⏭️ Image preprocessing disabled, using original image')
          if (onProgress) onProgress(10)
        }
        
        const result = await Tesseract.recognize(
          processedImageFile,
          'eng',
          {
            logger: (m) => {
              console.log('Tesseract progress:', m)
              // Report progress for all statuses
              if (onProgress) {
                let progressPercent = 10 // Start from 10% after preprocessing
                
                if (m.status === 'loading tesseract core') {
                  progressPercent = 15
                } else if (m.status === 'initializing tesseract') {
                  progressPercent = 25
                } else if (m.status === 'loading language traineddata') {
                  progressPercent = 35
                } else if (m.status === 'initializing api') {
                  progressPercent = 45
                } else if (m.status === 'recognizing text') {
                  // Progress from 50% to 95% during recognition
                  progressPercent = 50 + Math.round(m.progress * 45)
                } else if (m.status === 'complete') {
                  progressPercent = 100
                }
                
                if (progressPercent > 0) {
                  onProgress(progressPercent)
                }
              }
            }
          }
        )
        
        console.log('OCR completed:', { textLength: result.data.text.length, confidence: result.data.confidence })
        
        const rawText = result.data.text
        
        if (!rawText || rawText.trim().length === 0) {
          throw new Error('No text could be extracted from the image. Please try a clearer image with visible text.')
        }
        
        // Parse the text into structured menu data
        const sections = parseMenuText(rawText)
        
        return {
          data: {
            messageId: 'OCR_PARSED',
            receivingId: `ocr-${Date.now()}`,
            parsedText: rawText,
            confidence: result.data.confidence / 100, // Convert to 0-1 range
            sections: sections, // Structured menu data
          },
        }
      } catch (err) {
        console.error('OCR Error:', err)
        throw new Error(err.message || 'Failed to extract text from image. Please try a clearer image.')
      }
    }
    
    // Production mode - send to backend
    console.log('⚠️ TEST_MODE is FALSE - Using backend API (this will fail without backend)')
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await api.post('/ocr/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    })
    return response
  },

  // Get OCR processing status
  async getOCRStatus(ocrId) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { 
        data: { 
          status: 'completed', 
          progress: 100 
        } 
      }
    }
    
    const response = await api.get(`/ocr/status/${ocrId}`)
    return response
  },
}

export default ocrService

