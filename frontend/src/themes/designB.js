// Design B - "Modern Food App" (Visual & Engaging)
export const designBTheme = {
  name: 'Design B - Modern Food App',
  description: 'Visual & Engaging',
  colors: {
    background: '#FFFFFF',      // Pure white
    primary: '#FF6B57',         // Vibrant coral
    secondary: '#3ECF8E',       // Mint green
    accent: '#FFD23F',          // Lemon yellow
    textPrimary: '#1F1F1F',     // Almost black
    textSecondary: '#6F6F6F',   // Neutral gray
  },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
    sectionFont: '"Poppins", sans-serif',
  },
  components: {
    menuLayout: 'cards',        // Image cards
    itemStyle: 'modern',        // Large image, overlay text, floating add button
    sectionStyle: 'tabs',       // Horizontal scroll chips
    buttonStyle: 'pill',        // Rounded pill buttons
    basketStyle: 'fab',         // Floating action button, expands to modal
    animations: 'playful',      // Micro-animations, fly effects
  }
}

// Tailwind config for Design B
export const designBTailwind = {
  colors: {
    'vibrant-coral': '#FF6B57',
    'mint-green': '#3ECF8E',
    'lemon-yellow': '#FFD23F',
    'near-black': '#1F1F1F',
    'neutral-gray': '#6F6F6F',
  },
  fontFamily: {
    'sans': ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
  }
}

