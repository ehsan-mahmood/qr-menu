// CSV Parser for menu import
export function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0)
  if (lines.length === 0) return []
  
  // Parse header row
  const headerLine = lines[0].trim()
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim())
  
  // Find column indices
  const nameIndex = findColumnIndex(headers, ['name', 'item', 'item name', 'product'])
  const priceIndex = findColumnIndex(headers, ['price', 'cost', 'amount'])
  const descriptionIndex = findColumnIndex(headers, ['description', 'desc', 'details'])
  const categoryIndex = findColumnIndex(headers, ['category', 'section', 'type', 'group'])
  
  if (nameIndex === -1) {
    throw new Error('CSV must have a "name" column')
  }
  
  // Parse data rows
  const sectionsMap = new Map()
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    const name = values[nameIndex]?.trim()
    if (!name || name.length === 0) continue
    
    const priceStr = priceIndex >= 0 ? values[priceIndex]?.trim() : '0'
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
    
    const description = descriptionIndex >= 0 ? values[descriptionIndex]?.trim() : ''
    const category = categoryIndex >= 0 ? values[categoryIndex]?.trim() : 'Menu Items'
    
    // Group by category
    if (!sectionsMap.has(category)) {
      sectionsMap.set(category, [])
    }
    
    sectionsMap.get(category).push({
      name,
      description,
      price,
      available: true
    })
  }
  
  // Convert to sections array
  const sections = Array.from(sectionsMap.entries()).map(([name, items]) => ({
    name,
    items
  }))
  
  return sections
}

function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current)
  return values.map(v => v.trim().replace(/^"|"$/g, ''))
}

function findColumnIndex(headers, possibleNames) {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name) || name.includes(h))
    if (index !== -1) return index
  }
  return -1
}

