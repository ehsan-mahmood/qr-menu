// Design A - "Paper Menu, But Better" (Familiar & Comfort-First)
export const designATheme = {
  name: 'Design A - Paper Menu',
  description: 'Familiar & Comfort-First',
  colors: {
    background: '#FAF7F2',      // Warm paper beige
    textPrimary: '#2F2A25',     // Espresso brown
    textSecondary: '#6E6259',   // Soft mocha
    primary: '#7A8F5B',         // Olive green
    accent: '#C47A5A',          // Terracotta
    divider: '#E6E1DA',         // Linen gray
  },
  typography: {
    fontFamily: '"Merriweather", "Georgia", serif',
    sectionFont: '"Merriweather", serif',
  },
  components: {
    menuLayout: 'list',         // Vertical list, not cards
    itemStyle: 'classic',       // Name left, price right, description below
    sectionStyle: 'divider',    // Full-width separators
    buttonStyle: 'text',        // Text buttons with underline
    basketStyle: 'receipt',     // Sticky footer, slides up like receipt
    animations: 'gentle',       // Gentle fade-ins only
  }
}

// Tailwind config for Design A
export const designATailwind = {
  colors: {
    'paper-beige': '#FAF7F2',
    'espresso': '#2F2A25',
    'mocha': '#6E6259',
    'olive': '#7A8F5B',
    'terracotta': '#C47A5A',
    'linen': '#E6E1DA',
  },
  fontFamily: {
    'serif': ['Merriweather', 'Georgia', 'serif'],
  }
}

