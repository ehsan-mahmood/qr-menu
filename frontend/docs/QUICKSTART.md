# QR Menu Frontend - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# → http://localhost:3000
```

## 🧪 Test Mode

**Status**: ✅ ENABLED by default

Works completely **without backend**. All features functional with static data.

## 📱 Features

- ✅ Browse demo menu (12 items)
- ✅ Add items to basket
- ✅ Place orders
- ✅ View analytics
- ✅ QR code scanning/generation
- ✅ OCR menu import
- ✅ Mobile-first responsive UI

## 🗂️ Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Main pages (Landing, Menu, Basket, etc.)
├── stores/         # Pinia state management
├── services/       # API layer with test mode support
├── router/         # Vue Router config
└── utils/          # Test data and helpers
```

## 🔧 Configuration

**Test Mode**: `src/config.js`
```javascript
export const TEST_MODE = true  // Enable/disable
```

**API URL**: `.env.local`
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📄 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Home with quick actions |
| `/menu/:id` | Menu Display | Browse menu items |
| `/basket` | Basket | Review and order |
| `/qr` | QR Management | Scan/generate QR |
| `/ocr` | OCR Import | Upload menu images |
| `/dashboard` | Analytics | View insights |

## 🧩 Key Components

- **MenuItem** - Single menu item card
- **MenuSection** - Collapsible section with items
- **ItemModal** - Item detail popup
- **QRScanner** - Camera QR scanning
- **AnalyticsTable** - Data table
- **TopItems** - Top items display

## 📦 Stores (Pinia)

- **menuStore** - Menu data
- **basketStore** - Cart items
- **qrStore** - QR token & table
- **analyticsStore** - Analytics data

## 🎨 Styling

- **Framework**: TailwindCSS
- **Theme**: Mobile-first responsive
- **Components**: Utility-first classes
- **Transitions**: Smooth Vue transitions

## 🧪 Testing Features

### Demo Menu
Use QR token: `test-qr-token-001`

### Test Flow
1. Landing → "View Demo Menu"
2. Add items to basket
3. Place order → See success modal
4. View analytics dashboard
5. Try QR scanner/generator
6. Upload image for OCR

### Test Data
- 4 menu sections
- 12 items with images
- Table #5
- Café Demo merchant
- 1,247 total scans

## 📚 Documentation

- `README.md` - Complete documentation
- `TEST_MODE_GUIDE.md` - Detailed test mode guide
- `vue_frontend_guidelines.md` - Development guidelines

## 🔨 Build Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

## 🌐 Stack

- Vue 3 (Composition API)
- Vite (Build tool)
- Pinia (State management)
- Vue Router (Routing)
- TailwindCSS (Styling)
- Axios (HTTP client)

## 💡 Tips

- Hot reload works automatically
- Vue DevTools recommended
- Mobile viewport for best experience
- Check browser console for logs
- All images from Unsplash (CDN)

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Edit vite.config.js to change port
server: { port: 3001 }
```

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Test mode not working?**
- Check `src/config.js`
- Clear browser cache
- Restart dev server

## 🎯 Demo Script (2 min)

1. Open app → Landing page
2. Click "View Demo Menu"
3. Add 2-3 items to basket
4. View basket → Place order
5. See order confirmation
6. Navigate to dashboard
7. Show analytics and insights

## 📝 Next Steps

- [ ] Connect to real backend (disable test mode)
- [ ] Customize test data
- [ ] Add your brand colors
- [ ] Deploy to hosting
- [ ] Add more menu items
- [ ] Integrate payment

## 🔗 Links

- Vue 3: https://vuejs.org
- Vite: https://vitejs.dev
- Pinia: https://pinia.vuejs.org
- TailwindCSS: https://tailwindcss.com

---

**Made with Vue 3 + Vite + Pinia + TailwindCSS**

