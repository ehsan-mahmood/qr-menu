// Test/Demo mode configuration
// Auto-detect if running on GitHub Pages (demo mode)
// Can also be explicitly set via VITE_TEST_MODE environment variable
const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname === 'github.io' ||
  window.location.hostname.endsWith('.github.io') ||
  window.location.hostname.includes('github-pages') ||
  window.location.hostname.includes('gh-pages')
)

// Enable TEST_MODE if explicitly set OR if on GitHub Pages
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || isGitHubPages || false

// Demo mode flag (specifically for GitHub Pages deployment)
export const DEMO_MODE = isGitHubPages || import.meta.env.VITE_DEMO_MODE === 'true' || false

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// UI Theme Configuration
// Options: 'design-c' (Elegant Cafe Menu - default), 'design-b' (Modern Food App), or 'design-a' (Paper Menu)
export const UI_THEME = import.meta.env.VITE_UI_THEME || 'design-c'

// QR Code Domain Configuration
// Set this to your production domain for QR codes (e.g., 'https://menu.yourdomain.com')
// If not set, will use current window.location.origin
export const QR_CODE_DOMAIN = import.meta.env.VITE_QR_CODE_DOMAIN || null

