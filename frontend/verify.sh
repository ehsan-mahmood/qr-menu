#!/bin/bash

# Quick verification script for QR Menu Frontend

echo "🔍 Verifying QR Menu Frontend Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the frontend_vue directory"
    exit 1
fi

echo -e "${GREEN}✅ Found package.json${NC}"

# Check critical files
FILES=(
    "index.html"
    "vite.config.js"
    "tailwind.config.js"
    "src/main.js"
    "src/App.vue"
    "src/config.js"
    "src/utils/testData.js"
)

MISSING_FILES=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

# Count components
COMPONENT_COUNT=$(find src/components -name "*.vue" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Components: $COMPONENT_COUNT${NC}"

# Count pages
PAGE_COUNT=$(find src/pages -name "*.vue" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Pages: $PAGE_COUNT${NC}"

# Count stores
STORE_COUNT=$(find src/stores -name "*.js" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Stores: $STORE_COUNT${NC}"

# Count services
SERVICE_COUNT=$(find src/services -name "*.js" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Services: $SERVICE_COUNT${NC}"

echo ""
echo "📊 Summary:"
echo "  - Components: $COMPONENT_COUNT (expected: 6)"
echo "  - Pages: $PAGE_COUNT (expected: 6)"
echo "  - Stores: $STORE_COUNT (expected: 4)"
echo "  - Services: $SERVICE_COUNT (expected: 5)"
echo ""

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}❌ Verification FAILED: $MISSING_FILES missing files${NC}"
    exit 1
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "Run: npm install"
    echo ""
fi

# Check test mode setting
if grep -q "TEST_MODE = true" src/config.js 2>/dev/null; then
    echo -e "${GREEN}✅ Test mode is ENABLED${NC}"
else
    echo -e "${YELLOW}⚠️  Test mode may be disabled${NC}"
fi

echo ""
echo -e "${GREEN}✅ Verification PASSED${NC}"
echo ""
echo "🚀 Next steps:"
echo "  1. npm install          (if not already done)"
echo "  2. npm run dev          (start development server)"
echo "  3. Open http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  - README.md           (Complete guide)"
echo "  - QUICKSTART.md       (Quick reference)"
echo "  - TEST_MODE_GUIDE.md  (Test mode details)"
echo "  - PROJECT_SUMMARY.md  (What was built)"
echo ""

