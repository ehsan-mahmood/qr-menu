# Theme Configuration Guide

## Overview
The QR Menu frontend supports two distinct UI themes that can be configured via environment variables or the config file.

## Available Themes

### Design B - Modern Food App (Default)
- **Visual Style**: Image-forward, engaging, modern food delivery app aesthetic
- **Colors**: Vibrant coral (#FF6B57), mint green, lemon yellow
- **Layout**: Card grid with large images, horizontal section tabs
- **Basket**: Floating Action Button (FAB) in bottom right
- **Best For**: Restaurants, casual dining, bars with photogenic dishes

### Design A - Paper Menu
- **Visual Style**: Familiar paper menu aesthetic, comfort-first
- **Colors**: Warm beige (#FAF7F2), olive green, terracotta
- **Layout**: Vertical list (name left, price right), serif fonts
- **Basket**: Sticky footer receipt-style
- **Best For**: Cafés, bakeries, breakfast spots, traditional eateries

## Configuration

### Method 1: Environment Variable (Recommended)
Create or edit `.env.local` in the `frontend_vue` directory:

```bash
# Set theme to Design B (default - Modern Food App)
VITE_UI_THEME=design-b

# OR set theme to Design A (Paper Menu)
VITE_UI_THEME=design-a
```

### Method 2: Config File
Edit `src/config.js`:

```javascript
// UI Theme Configuration
// Options: 'design-b' (Modern Food App - default) or 'design-a' (Paper Menu)
export const UI_THEME = 'design-b' // Change to 'design-a' for Paper Menu theme
```

## How It Works

1. **Theme Store** (`src/stores/themeStore.js`): Manages the current theme and provides theme data
2. **Config** (`src/config.js`): Reads theme from environment variable or uses default
3. **Components**: MenuDisplay and other components check `themeStore.isDesignA` or `themeStore.isDesignB` to render appropriate UI

## Testing Themes

### Test Design B (Default):
```bash
npm run dev
# Visit http://localhost:3000
```

### Test Design A:
```bash
# In .env.local
VITE_UI_THEME=design-a

npm run dev
# Visit http://localhost:3000
```

## Theme Differences Summary

| Feature | Design A (Paper Menu) | Design B (Modern Food App) |
|---------|----------------------|---------------------------|
| Background | Warm beige | Pure white |
| Menu Layout | Vertical list | Card grid |
| Item Images | Optional/minimal | Prominent, large |
| Section Style | Full-width dividers | Horizontal scroll tabs |
| Buttons | Text with underline | Rounded pills |
| Basket | Footer receipt | FAB (floating button) |
| Typography | Serif (Merriweather) | Sans-serif (Poppins) |
| Animation | Gentle fades | Micro-animations |

## Future Customization

The theme system is designed to be extensible. Additional themes can be added by:
1. Adding new theme config in `themeStore.js`
2. Adding conditional rendering in components
3. Updating the `UI_THEME` options in `config.js`

