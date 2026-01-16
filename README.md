# QR Menu System

A modern, mobile-first digital menu system that allows restaurants and cafés to create, manage, and share QR code-based menus. Customers can browse menus, place orders, and merchants can track analytics and manage orders through an intuitive dashboard.

## 🏗️ Project Structure

```
qrmenu/
├── backend/          # Node.js/TypeScript REST API backend
├── frontend_vue/     # Vue.js 3 SPA frontend
├── db/              # PostgreSQL database scripts and documentation
└── docs/            # Project-wide documentation
```

## 📋 Overview

This is a full-stack application consisting of:

- **Backend**: RESTful API built with Node.js, TypeScript, Express, and PostgreSQL
- **Frontend**: Vue.js 3 SPA with Pinia state management and Tailwind CSS
- **Database**: PostgreSQL with comprehensive schema for merchants, menus, orders, and analytics

### Key Features

- 📱 **Mobile-first** customer menu experience
- 🎨 **Dual design themes** (Paper Menu / Modern App)
- 📸 **OCR menu import** using AWS Textract or Tesseract.js
- 🛒 **Shopping basket** and order placement
- 📊 **Analytics dashboard** with real-time metrics
- 🔐 **JWT authentication** for merchants
- 🏷️ **QR code generation** and management
- 📈 **Event tracking** and insights

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- AWS account (optional, for Textract OCR)

### Getting Started

1. **Clone the repository** (when ready):
   ```bash
   git clone <repository-url>
   cd qrmenu
   ```

2. **Set up the database**:
   ```bash
   cd db
   ./setup_database.sh
   ```

3. **Set up the backend**:
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   # Edit .env with your database and AWS credentials
   npm run dev
   ```

4. **Set up the frontend**:
   ```bash
   cd ../frontend_vue
   npm install
   npm run dev
   ```

## 📚 Documentation

### Project Documentation
- **[Technical Specifications](./docs/tech_specs.md)** - Complete technical specification
- **[Features Roadmap](./docs/features_to_add.md)** - Planned features and enhancements
- **[Demo Rundown](./docs/demo_rundown.md)** - Demo workflow guide

### Backend Documentation
- **[Backend README](./backend/README.md)** - Backend setup and API overview
- **[API Specification](./backend/docs/API_SPECIFICATION.md)** - Complete API endpoint documentation
- **[Testing Guide](./backend/docs/TESTING.md)** - Backend testing instructions

### Frontend Documentation
- **[Frontend README](./frontend_vue/README.md)** - Frontend setup and features
- **[Complete Documentation](./frontend_vue/docs/DOCUMENTATION.md)** - Comprehensive frontend guide
- **[Theme Guide](./frontend_vue/docs/THEME_GUIDE.md)** - UI design system
- **[Test Mode Guide](./frontend_vue/docs/TEST_MODE_GUIDE.md)** - Development without backend

### Database Documentation
- **[Database README](./db/README.md)** - Database setup guide
- **[Schema Documentation](./db/db_documentation.md)** - Complete database schema
- **[Demo Data Reference](./db/DEMO_DATA_REFERENCE.md)** - Demo data details

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **OCR**: AWS Textract (optional)

### Frontend
- **Framework**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios

## 🏃 Development

### Backend Development
```bash
cd backend
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
```

### Frontend Development
```bash
cd frontend_vue
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

The frontend includes a **test mode** that works completely without a backend, using mocked APIs and browser-based OCR (Tesseract.js).

## 📁 Directory Structure

```
qrmenu/
├── .gitignore              # Git ignore rules
├── README.md               # This file
│
├── backend/                # Backend API
│   ├── src/               # Source code
│   ├── docs/              # Backend documentation
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend README
│
├── frontend_vue/          # Frontend SPA
│   ├── src/               # Source code
│   ├── docs/              # Frontend documentation
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── README.md          # Frontend README
│
├── db/                    # Database
│   ├── create_tables.sql  # Schema creation
│   ├── seed_demo_data.sql # Demo data
│   ├── setup_database.sh  # Setup script
│   └── README.md          # Database README
│
└── docs/                  # Project documentation
    ├── tech_specs.md      # Technical specification
    ├── features_to_add.md # Feature roadmap
    └── demo_rundown.md    # Demo guide
```

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/qrmenu
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
AWS_S3_BUCKET=qrmenu-images
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_TEST_MODE=false
VITE_UI_THEME=design-b
```

## 🧪 Testing

The frontend includes a comprehensive test mode that works without a backend:
- All API calls are mocked
- Browser-based OCR using Tesseract.js
- Full authentication flow simulation
- Realistic test data

Set `VITE_TEST_MODE=true` in the frontend `.env` to enable test mode.

## 🚢 Deployment

### Frontend
Build the frontend and deploy to any static hosting:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

### Backend
Deploy to:
- AWS Lambda (serverless)
- Heroku
- DigitalOcean
- Railway
- Render
- Any Node.js hosting

Ensure PostgreSQL database is accessible and environment variables are configured.

## 📊 Architecture

```
Mobile Browser (Customer/Merchant)
        ↓
Cloudflare CDN (cache public menu pages)
        ↓
Vue.js SPA (Frontend)
        ↓
RESTful API (Backend)
        ↓
PostgreSQL (Database)
        ↓
S3 (Images & QR codes)
```

## 🤝 Contributing

1. Review the [Technical Specifications](./docs/tech_specs.md)
2. Check the [API Specification](./backend/docs/API_SPECIFICATION.md) for backend integration
3. Follow the coding standards in each component's README
4. Test thoroughly before submitting

## 📄 License

ISC

## 🙏 Support

For questions or issues:
1. Check the relevant documentation in each component's `docs/` folder
2. Review the technical specifications
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Built with** ❤️ **using Vue.js 3, Node.js, TypeScript, and PostgreSQL**

