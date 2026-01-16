/**
 * Image preprocessing utilities for OCR
 * Applies various image enhancement techniques to improve OCR accuracy
 */

/**
 * Preprocess image for better OCR results
 * @param {File|HTMLImageElement|HTMLCanvasElement} imageSource - The image to preprocess
 * @param {Object} options - Preprocessing options
 * @returns {Promise<Blob>} - Preprocessed image as Blob
 */
export async function preprocessImageForOCR(imageSource, options = {}) {
  const {
    grayscale = true,
    enhanceContrast = true,
    denoise = true,
    threshold = true,
    resize = true,
    maxWidth = 2000,
    maxHeight = 2000,
    thresholdValue = 128,
    contrastLevel = 1.2,
  } = options

  console.log('🖼️ Starting image preprocessing...', { options })

  return new Promise((resolve, reject) => {
    try {
      // Create image element if we have a file
      const img = new Image()
      
      img.onload = () => {
        try {
          // Create canvas
          let canvas = document.createElement('canvas')
          let ctx = canvas.getContext('2d')

          // Calculate optimal size
          let width = img.width
          let height = img.height

          if (resize && (width > maxWidth || height > maxHeight)) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          canvas.width = width
          canvas.height = height

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height)

          // Get image data
          let imageData = ctx.getImageData(0, 0, width, height)
          let data = imageData.data

          // Apply preprocessing steps
          if (grayscale) {
            data = convertToGrayscale(data)
          }

          if (enhanceContrast) {
            data = enhanceContrastFunc(data, contrastLevel)
          }

          if (denoise) {
            data = applyDenoise(data, width, height)
          }

          if (threshold && grayscale) {
            data = applyThreshold(data, thresholdValue)
          }

          // Put processed data back
          imageData.data.set(data)
          ctx.putImageData(imageData, 0, 0)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log('✅ Image preprocessing complete')
                resolve(blob)
              } else {
                reject(new Error('Failed to create blob from processed image'))
              }
            },
            'image/png',
            0.95
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      // Load image from different sources
      if (imageSource instanceof File) {
        const reader = new FileReader()
        reader.onload = (e) => {
          img.src = e.target.result
        }
        reader.onerror = () => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(imageSource)
      } else if (imageSource instanceof HTMLImageElement) {
        img.src = imageSource.src
      } else if (imageSource instanceof HTMLCanvasElement) {
        img.src = imageSource.toDataURL()
      } else {
        reject(new Error('Unsupported image source type'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Convert image to grayscale
 */
function convertToGrayscale(data) {
  for (let i = 0; i < data.length; i += 4) {
    // Weighted grayscale conversion (better than simple average)
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i] = gray     // R
    data[i + 1] = gray // G
    data[i + 2] = gray // B
    // data[i + 3] is alpha, keep as is
  }
  return data
}

/**
 * Enhance contrast
 */
function enhanceContrastFunc(data, level) {
  const factor = (259 * (level * 255 + 255)) / (255 * (259 - level * 255))
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128)     // R
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128) // G
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128) // B
  }
  return data
}

/**
 * Apply median filter for noise reduction
 */
function applyDenoise(data, width, height) {
  const newData = new Uint8ClampedArray(data.length)
  const radius = 1 // 3x3 kernel

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const pixels = []

      // Collect neighboring pixels
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx
          const ny = y + dy
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4
            pixels.push(data[nIdx]) // Use red channel (grayscale)
          }
        }
      }

      // Calculate median
      pixels.sort((a, b) => a - b)
      const median = pixels[Math.floor(pixels.length / 2)]

      newData[idx] = median     // R
      newData[idx + 1] = median // G
      newData[idx + 2] = median // B
      newData[idx + 3] = data[idx + 3] // Alpha
    }
  }

  return newData
}

/**
 * Apply binary threshold
 */
function applyThreshold(data, threshold) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i]
    const value = gray > threshold ? 255 : 0
    data[i] = value     // R
    data[i + 1] = value // G
    data[i + 2] = value // B
  }
  return data
}

/**
 * Clamp value to 0-255 range
 */
function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

/**
 * Adaptive threshold - calculates optimal threshold for different image regions
 * More advanced than simple threshold
 */
function applyAdaptiveThreshold(data, width, height, blockSize = 15, C = 10) {
  const newData = new Uint8ClampedArray(data.length)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      
      // Calculate local mean
      let sum = 0
      let count = 0
      
      for (let dy = -blockSize / 2; dy <= blockSize / 2; dy++) {
        for (let dx = -blockSize / 2; dx <= blockSize / 2; dx++) {
          const nx = x + dx
          const ny = y + dy
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4
            sum += data[nIdx]
            count++
          }
        }
      }
      
      const mean = sum / count
      const threshold = mean - C
      const value = data[idx] > threshold ? 255 : 0
      
      newData[idx] = value
      newData[idx + 1] = value
      newData[idx + 2] = value
      newData[idx + 3] = data[idx + 3]
    }
  }
  
  return newData
}

/**
 * Sharpen image for better edge detection
 */
function applySharpening(data, width, height) {
  const newData = new Uint8ClampedArray(data.length)
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const kernelIdx = (ky + 1) * 3 + (kx + 1)
          sum += data[idx] * kernel[kernelIdx]
        }
      }
      
      const idx = (y * width + x) * 4
      const value = clamp(sum)
      newData[idx] = value
      newData[idx + 1] = value
      newData[idx + 2] = value
      newData[idx + 3] = data[idx + 3]
    }
  }
  
  return newData
}

/**
 * Detect and correct image skew (rotation)
 * Returns rotation angle in degrees
 */
function detectSkew(data, width, height) {
  // Simplified skew detection - in production, use Hough transform or similar
  // This is a placeholder for future enhancement
  return 0
}

export {
  applyAdaptiveThreshold,
  applySharpening,
}

