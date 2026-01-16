#!/bin/bash

# GitHub Pages Deployment Script
# This script builds the frontend and prepares it for GitHub Pages deployment

set -e  # Exit on error

echo "🚀 Starting GitHub Pages deployment preparation..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist/ directory not found."
    exit 1
fi

echo "✅ Build successful!"

# Create .nojekyll file to prevent GitHub Pages from processing Jekyll
echo "📝 Creating .nojekyll file..."
touch dist/.nojekyll

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. If deploying to gh-pages branch:"
echo "      git checkout --orphan gh-pages"
echo "      git rm -rf ."
echo "      cp -r dist/* ."
echo "      git add ."
echo "      git commit -m 'Deploy to GitHub Pages'"
echo "      git push origin gh-pages"
echo ""
echo "   2. Or use GitHub Actions (recommended):"
echo "      See deploy-gh-pages.yml workflow"
echo ""
echo "   3. After deployment, enable GitHub Pages in repository settings:"
echo "      Settings > Pages > Source: gh-pages branch"
echo ""
