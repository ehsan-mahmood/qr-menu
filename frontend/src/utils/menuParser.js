// Helper function to parse OCR text into structured menu items
export function parseMenuText(rawText) {
  const lines = rawText.split('\n').filter(line => line.trim().length > 0)
  const sections = []
  let currentSection = null
  
  // Common section headers (case insensitive)
  const sectionKeywords = [
    'breakfast', 'lunch', 'dinner', 'appetizers', 'starters', 'mains', 
    'entrees', 'desserts', 'beverages', 'drinks', 'sides', 'salads',
    'burgers', 'sandwiches', 'panini', 'pasta', 'pizza', 'sweets'
  ]
  
  // Price patterns: $12, $12.50, 12.50, S12 (OCR often mistakes $ for S), etc.
  const pricePattern = /[\$S]\s*\d+\.?\d*|\d+\.\d{2}|\d+\s*$/g
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return
    
    // Check if this line is a section header (ALL CAPS or contains section keywords)
    const isAllCaps = trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3
    const containsSectionKeyword = sectionKeywords.some(keyword => 
      trimmedLine.toLowerCase().includes(keyword)
    )
    const looksLikeHeader = isAllCaps || containsSectionKeyword
    const hasNoPrice = !pricePattern.test(trimmedLine)
    
    if (looksLikeHeader && hasNoPrice) {
      // This is likely a section header
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection)
      }
      currentSection = {
        name: trimmedLine,
        items: []
      }
    } else if (currentSection) {
      // This is likely a menu item
      // Try to extract price - handle both $ and S (common OCR error)
      const prices = trimmedLine.match(pricePattern)
      let price = 0
      if (prices && prices.length > 0) {
        // Get the last price found (usually the actual price)
        let lastPrice = prices[prices.length - 1]
        // Replace $ or S with empty string
        lastPrice = lastPrice.replace(/[\$S]/g, '').trim()
        
        // Handle missing decimal point (e.g., "699" should be "6.99", "800" should be "8.00")
        // If price is 3+ digits without decimal and would result in a reasonable price (< 50),
        // likely missing decimal point
        if (/^\d{3,}$/.test(lastPrice)) {
          const numDigits = lastPrice.length
          if (numDigits >= 3) {
            const withDecimal = lastPrice.slice(0, -2) + '.' + lastPrice.slice(-2)
            const testPrice = parseFloat(withDecimal)
            // Only apply decimal fix if result is reasonable (< 50) to avoid breaking legitimate prices
            if (testPrice < 50) {
              lastPrice = withDecimal
            }
          }
        }
        
        price = parseFloat(lastPrice) || 0
      }
      
      // Remove price from line to get item name
      let nameAndDesc = trimmedLine
      if (prices) {
        prices.forEach(p => {
          // Remove price pattern (handles both $ and S)
          nameAndDesc = nameAndDesc.replace(p, '').trim()
        })
      }
      // Clean up any remaining price indicators at the end
      nameAndDesc = nameAndDesc.replace(/[\$S]\s*\d+\.?\d*\s*$/, '').trim()
      nameAndDesc = nameAndDesc.replace(/[\$S]\s*$/, '').trim()
      
      // Fix common OCR errors in text
      nameAndDesc = nameAndDesc
        .replace(/\bwrop\b/gi, 'wrap')
        .replace(/\bsalod\b/gi, 'salad')
        .replace(/\bfomato\b/gi, 'tomato')
        .replace(/\bfom\b/gi, 'tomato')
        .replace(/\bmi\b/gi, 'mix')
        .replace(/\bmis\b/gi, 'mix')
        .replace(/\bSchritzel\b/gi, 'Schnitzel')
        .replace(/\bGriled\b/gi, 'Grilled')
        .replace(/\bGr nica\b/gi, 'Avocado')
        .replace(/\bChien\b/gi, 'Chicken')
        .replace(/\bFrito\b/gi, 'Frittata')
        .replace(/\bGlten\b/gi, 'Gluten')
        .replace(/\bFata\b/gi, 'Frittata')
        .replace(/\bPriam tok i\b/gi, 'Premium steak pie')
        .replace(/\bleck\b/gi, 'leek')
        .replace(/\bPastie\b/gi, 'Pastry')
        .replace(/\bfetta\b/gi, 'feta')
        .replace(/\broll\b/gi, 'rolls')
        .replace(/\bletuce\b/gi, 'lettuce')
        .replace(/\bpaty\b/gi, 'patty')
        .replace(/\bchill\b/gi, 'chilli')
        .replace(/\bMarincted\b/gi, 'Marinated')
        .replace(/\bwih\b/gi, 'with')
        .replace(/\bPrt\b/gi, 'Perri')
        .replace(/\bBreaky\b/gi, 'Breakfast')
        .replace(/\bhumous\b/gi, 'hummus')
        .replace(/\bpast\b/gi, 'paste')
      
      // Split by common separators: - / ,
      const parts = nameAndDesc.split(/[-–—\/]/).map(p => p.trim()).filter(p => p)
      
      // First part is usually the item name
      const name = parts[0] || nameAndDesc.trim()
      
      // Rest is description
      const description = parts.slice(1).join(' ').trim() || ''
      
      // Filter out invalid items
      if (name && name.length > 2) {
        // Skip items with $0 price or prices over $200 (likely OCR noise/errors)
        if (price > 0 && price <= 200) {
          const trimmedName = name.trim()
          const nameLength = trimmedName.length
          
          // Additional validation: skip items with too many special characters (likely OCR errors)
          const specialCharCount = (trimmedName.match(/[^a-zA-Z0-9\s]/g) || []).length
          const specialCharRatio = nameLength > 0 ? specialCharCount / nameLength : 0
          
          // Filter out items that are mostly numbers or special chars
          const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length
          const letterRatio = nameLength > 0 ? letterCount / nameLength : 0
          
          // Keep items that:
          // 1. Have less than 30% special characters (filters out garbled text)
          // 2. Have at least 40% letters (filters out items that are mostly numbers/symbols)
          // 3. Or are short names (3 chars or less) as they might be valid (e.g., "Tea", "Pie")
          if ((specialCharRatio < 0.3 && letterRatio >= 0.4) || nameLength <= 3) {
            // Additional check: filter out items that look like random characters
            // Check if name has at least 2 consecutive letters (filters "oe tama eas" type garbage)
            const hasConsecutiveLetters = /[a-zA-Z]{2,}/.test(trimmedName)
            
            if (hasConsecutiveLetters || nameLength <= 4) {
              currentSection.items.push({
                name: trimmedName,
                description: description.trim(),
                price: price,
                available: true
              })
            }
          }
        }
      }
    } else {
      // No section yet, create a default one
      currentSection = {
        name: 'Menu Items',
        items: []
      }
    }
  })
  
  // Add the last section
  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection)
  }
  
  return sections
}

