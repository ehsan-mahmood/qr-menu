#!/bin/bash

# QR Menu Frontend Setup Script

echo "🚀 Setting up QR Menu Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env.local file
echo ""
echo "⚙️ Creating .env.local file..."
cat > .env.local << EOF
# Test Mode Configuration
# Set to 'true' to use static data without backend
VITE_TEST_MODE=true

# API Base URL (used when TEST_MODE is false)
VITE_API_BASE_URL=http://localhost:8080/api
EOF

echo "✅ Created .env.local with test mode enabled"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Quick Start:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npm run preview      - Preview production build"
echo ""
echo "🧪 Test Mode is ENABLED by default"
echo "   The app will work with static data without a backend"
echo ""
echo "🌐 Development server will run at: http://localhost:3000"
echo ""

