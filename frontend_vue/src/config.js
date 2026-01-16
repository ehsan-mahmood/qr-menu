// Test mode configuration
// Set TEST_MODE to true to use static data without backend
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || false

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// UI Theme Configuration
// Options: 'design-c' (Elegant Cafe Menu - default), 'design-b' (Modern Food App), or 'design-a' (Paper Menu)
export const UI_THEME = import.meta.env.VITE_UI_THEME || 'design-c'

// QR Code Domain Configuration
// Set this to your production domain for QR codes (e.g., 'https://menu.yourdomain.com')
// If not set, will use current window.location.origin
export const QR_CODE_DOMAIN = import.meta.env.VITE_QR_CODE_DOMAIN || null

