import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UI_THEME } from '@/config'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(UI_THEME)

  const isDesignA = computed(() => currentTheme.value === 'design-a')
  const isDesignB = computed(() => currentTheme.value === 'design-b')
  const isDesignC = computed(() => currentTheme.value === 'design-c')

  // Design A - "Paper Menu, But Better"
  const designA = {
    name: 'Design A - Paper Menu',
    colors: {
      background: '#FAF7F2',
      textPrimary: '#2F2A25',
      textSecondary: '#6E6259',
      primary: '#7A8F5B',
      accent: '#C47A5A',
      divider: '#E6E1DA',
    },
    layout: {
      menuStyle: 'list',
      basketStyle: 'footer',
      sectionStyle: 'divider',
    }
  }

  // Design B - "Modern Food App" 
  const designB = {
    name: 'Design B - Modern Food App',
    colors: {
      background: '#FFFFFF',
      primary: '#FF6B57',
      secondary: '#3ECF8E',
      accent: '#FFD23F',
      textPrimary: '#1F1F1F',
      textSecondary: '#6F6F6F',
    },
    layout: {
      menuStyle: 'cards',
      basketStyle: 'fab',
      sectionStyle: 'tabs',
    }
  }

  // Design C - "Elegant Cafe Menu" (New default per guidelines)
  const designC = {
    name: 'Design C - Elegant Cafe Menu',
    colors: {
      background: '#FEFDF9', // Warm off-white / cream
      backgroundAlt: '#FAF8F3', // Soft beige
      textPrimary: '#3E2723', // Deep espresso brown
      textSecondary: '#6E6159', // Muted brown-gray
      primary: '#5D4037', // Deep espresso brown (buttons/active states)
      accent: '#B8715C', // Muted terracotta / clay red
      accentGreen: '#7A8F5B', // Olive / herb green (used sparingly)
      divider: '#E8E4DD', // Light sand/beige divider
      cardBackground: '#FFFFFF', // Card backgrounds (slightly warmer than pure white)
    },
    layout: {
      menuStyle: 'cards',
      basketStyle: 'bottom-bar',
      sectionStyle: 'sticky-tabs',
    }
  }

  const theme = computed(() => {
    if (isDesignA.value) return designA
    if (isDesignB.value) return designB
    if (isDesignC.value) return designC
    return designC // Default to design C
  })

  function setTheme(themeName) {
    currentTheme.value = themeName
  }

  return {
    currentTheme,
    theme,
    isDesignA,
    isDesignB,
    isDesignC,
    setTheme,
  }
})

