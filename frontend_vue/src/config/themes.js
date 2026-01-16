// Theme configurations for the three distinct designs

export const themes = {
  // DESIGN A — "Paper Menu, But Better" (Familiar & Comfort‑First)
  designA: {
    id: 'designA',
    name: 'Paper Menu',
    description: 'Familiar & Comfort-First',
    colors: {
      background: '#FAF7F2', // Warm paper beige
      textPrimary: '#2F2A25', // Espresso brown
      textSecondary: '#6E6259', // Soft mocha
      primary: '#7A8F5B', // Olive green
      accent: '#C47A5A', // Terracotta
      divider: '#E6E1DA', // Linen gray
    },
    layout: 'list', // Vertical list layout
    showImages: false, // No images by default
  },
  
  // DESIGN B — "Modern Food App" (Visual & Engaging)
  designB: {
    id: 'designB',
    name: 'Modern Food App',
    description: 'Visual & Engaging',
    colors: {
      background: '#FFFFFF', // Pure white
      textPrimary: '#1F1F1F', // Almost black
      textSecondary: '#6F6F6F', // Neutral gray
      primary: '#FF6B57', // Vibrant coral
      secondary: '#3ECF8E', // Mint green
      accent: '#FFD23F', // Lemon yellow
    },
    layout: 'cards', // Image cards layout
    sectionsLayout: 'horizontal', // Horizontal scroll chips
  },
  
  // DESIGN C — "Calm Premium" (Minimal & Elegant)
  designC: {
    id: 'designC',
    name: 'Calm Premium',
    description: 'Minimal & Elegant',
    colors: {
      background: '#F9FAF9', // Soft off-white
      textPrimary: '#222222', // Near-black
      textSecondary: '#8A8F8C', // Slate gray
      primary: '#1F3D2B', // Deep forest green
      accent: '#C8B87A', // Champagne gold
      divider: '#ECECEC', // Hairline gray
    },
    layout: 'minimal', // Minimal rows with spacing
  },
}

// Default theme (can be changed via localStorage or URL param)
export const DEFAULT_THEME = 'designA'

// Get current theme
export function getCurrentTheme() {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const themeParam = urlParams.get('theme')
    if (themeParam && themes[themeParam]) {
      return themeParam
    }
    const stored = localStorage.getItem('selectedTheme')
    if (stored && themes[stored]) {
      return stored
    }
  }
  return DEFAULT_THEME
}

// Set theme
export function setTheme(themeId) {
  if (typeof window !== 'undefined' && themes[themeId]) {
    localStorage.setItem('selectedTheme', themeId)
    // Apply theme class to document
    document.documentElement.setAttribute('data-theme', themeId)
    return true
  }
  return false
}

// Get theme config
export function getThemeConfig(themeId = null) {
  const id = themeId || getCurrentTheme()
  return themes[id] || themes[DEFAULT_THEME]
}

