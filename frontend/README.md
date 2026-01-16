# QR Menu - Vue.js Frontend

A modern, mobile-first QR menu system built with Vue.js 3, featuring merchant management and customer ordering capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Complete Documentation

For comprehensive documentation, see **[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)** which covers:
- Complete architecture overview
- All pages and routes detailed guide
- State management (Pinia stores)
- Components reference
- Services & API integration
- Deployment instructions
- Development workflows

### Other Documentation Files
- **[docs/API_SPECIFICATION.md](../backend/docs/API_SPECIFICATION.md)** - Backend API specification
- **[docs/THEME_GUIDE.md](./docs/THEME_GUIDE.md)** - UI themes and design system
- **[docs/TEST_MODE_GUIDE.md](./docs/TEST_MODE_GUIDE.md)** - Working without backend
- **[docs/tech_specs.md](../docs/tech_specs.md)** - Overall technical specification

## ✨ Features

### Customer Experience
- 📱 Mobile-first responsive menu
- 🎨 Two design themes (Paper Menu / Modern App)
- 🛒 Shopping basket with order placement
- 🔍 Item details modal
- 📊 Analytics event tracking

### Merchant Experience
- 🔐 Authentication (login/signup)
- 🎯 3-step onboarding flow
- 📸 OCR menu import (Tesseract.js)
- 📋 Menu management
- 🏷️ QR code generation
- 📈 Analytics dashboard
- 💳 Order management

## 🛠 Technology Stack

- **Framework**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios
- **OCR**: Tesseract.js (test mode)

## 📁 Project Structure

```
frontend_vue/
├── src/
│   ├── pages/         # Route-level components (9 pages)
│   ├── components/    # Reusable components (6 components)
│   ├── stores/        # Pinia stores (6 stores)
│   ├── services/      # API services (5 services)
│   ├── router/        # Vue Router config
│   ├── utils/         # Utilities & test data
│   └── config.js      # App configuration
├── public/            # Static assets
├── dist/              # Build output (gitignored)
└── docs/DOCUMENTATION.md   # Complete documentation
```

## 🎯 Key Pages

1. **Login** (`/`) - Merchant authentication (root page)
2. **Sign Up** (`/signup`) - Merchant registration  
3. **Onboarding** (`/onboarding`) - 3-step merchant setup
4. **Menu Display** (`/menu/:menuId`) - Customer menu (public, isolated)
5. **Basket** (`/basket`) - Shopping cart (public)
6. **Dashboard** (`/dashboard`) - Merchant analytics (protected)
7. **QR Management** (`/qr`) - QR code management (protected)
8. **OCR Import** (`/ocr`) - Menu photo import (protected)

## 🧪 Test Mode

The app works completely without a backend in test mode:

```env
# .env file
VITE_TEST_MODE=true
VITE_API_BASE_URL=/api
VITE_UI_THEME=design-b
VITE_QR_CODE_DOMAIN=https://menu.yourdomain.com  # Optional: Set custom domain for QR codes
```

### Features in Test Mode:
- ✅ All API calls mocked with realistic data
- ✅ Browser-based OCR (Tesseract.js)
- ✅ Full authentication flow
- ✅ Order placement
- ✅ Analytics tracking
- ✅ Console logging for debugging

See [docs/TEST_MODE_GUIDE.md](./docs/TEST_MODE_GUIDE.md) for details.

## 🎨 Design Themes

**Design A - "Paper Menu"**
- Traditional warm aesthetic
- List-based layout
- Cream background (#FAF7F2)

**Design B - "Modern Food App"** (Default)
- Modern card-based design  
- Vibrant colors
- White background

Switch themes in config:
```javascript
export const UI_THEME = 'design-b' // or 'design-a'
```

See [docs/THEME_GUIDE.md](./docs/THEME_GUIDE.md) for complete design documentation.

## 📦 State Management (Pinia)

- **authStore** - Authentication & user session
- **menuStore** - Menu data & configuration
- **basketStore** - Shopping cart
- **qrStore** - QR code data
- **analyticsStore** - Events & dashboard data
- **themeStore** - UI theme switching

## 🔌 API Services

All services in `src/services/`:
- **menuService** - Menu CRUD operations
- **orderService** - Order management
- **qrService** - QR code operations
- **analyticsService** - Event tracking
- **ocrService** - Menu image processing

Each service automatically switches between test mode and production mode.

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

The `dist/` folder can be deployed to:
- **Netlify** - Zero config deployment
- **Vercel** - Automatic deployments
- **AWS S3 + CloudFront** - Scalable hosting
- Any static hosting service

### Production Environment Variables
```env
VITE_API_BASE_URL=https://api.yourproject.com/api
VITE_TEST_MODE=false
VITE_UI_THEME=design-b
```

See [docs/DOCUMENTATION.md#deployment](./docs/DOCUMENTATION.md#deployment) for detailed deployment guides.

## 🔒 Route Protection

- **Public Routes**: `/menu/:menuId`, `/basket` (always accessible)
- **Guest Routes**: `/`, `/signup` (redirect to dashboard if authenticated)
- **Protected Routes**: `/dashboard`, `/qr`, `/ocr`, `/onboarding` (require authentication)

Navigation guards automatically handle authentication checks.

## 🔧 Development

```bash
# Dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Quick Development Tips
- Vue DevTools browser extension recommended
- Test mode enabled by default for development
- Hot Module Replacement for instant updates
- Check console for API call logs in test mode

## 🤝 Backend Integration

When ready to connect to a real backend:

1. ✅ Set `VITE_TEST_MODE=false` in `.env`
2. ✅ Configure `VITE_API_BASE_URL` to your backend URL
3. ✅ Ensure backend implements [docs/API_SPECIFICATION.md](../backend/docs/API_SPECIFICATION.md)
4. ✅ Configure CORS on backend for your frontend domain
5. ✅ Test authentication flow and JWT handling

The backend API specification document lists all 20+ endpoints the frontend expects.

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari, Chrome Mobile
- Modern browsers with ES6+ support

## 🐛 Troubleshooting

**Port already in use?**
```bash
npm run dev -- --port 3001
```

**Build errors?**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Hot reload not working?**
- Restart dev server
- Clear browser cache
- Check file watcher limits (Linux)

See [docs/DOCUMENTATION.md#common-issues](./docs/DOCUMENTATION.md#common-issues) for more solutions.

## 📚 Learn More

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vue Router](https://router.vuejs.org/)

## 📄 Project Documentation

| Document | Description |
|----------|-------------|
| [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) | Complete frontend architecture & development guide |
| [docs/API_SPECIFICATION.md](../backend/docs/API_SPECIFICATION.md) | Backend API endpoints specification |
| [docs/THEME_GUIDE.md](./docs/THEME_GUIDE.md) | UI design system & themes |
| [docs/TEST_MODE_GUIDE.md](./docs/TEST_MODE_GUIDE.md) | Development without backend |
| [docs/tech_specs.md](../docs/tech_specs.md) | Overall technical specification |

## 🎓 Getting Started Guide

1. **Read** [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) for architecture overview
2. **Install** dependencies with `npm install`
3. **Run** development server with `npm run dev`
4. **Explore** the app in test mode (no backend needed)
5. **Review** [docs/API_SPECIFICATION.md](../backend/docs/API_SPECIFICATION.md) for backend integration
6. **Deploy** to production when ready

## 📝 Available Scripts

```json
{
  "dev": "vite",              // Start dev server (http://localhost:3000)
  "build": "vite build",      // Build for production
  "preview": "vite preview"   // Preview production build locally
}
```

## 🙏 Support

For questions or issues:
1. Check [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) for detailed guides
2. Review browser console for error messages
3. Verify test mode is working correctly
4. Check API specification matches backend implementation

---

**Built with** ❤️ **using Vue.js 3, Vite, and Tailwind CSS**

**Version**: 1.0.0  
**Last Updated**: December 28, 2025
