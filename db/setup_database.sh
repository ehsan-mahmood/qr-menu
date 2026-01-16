#!/bin/bash

# Database Setup Script for QR Menu
# This script creates tables and loads demo data

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  QR Menu Database Setup${NC}"
echo "=============================="
echo ""

# Database connection details
DB_NAME="${DB_NAME:-qrmenu}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${BLUE}Running: $description${NC}"
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Success: $description${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed: $description${NC}"
        echo "Trying with verbose output..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file"
        return 1
    fi
}

# Ask for password
read -sp "Database password: " DB_PASSWORD
echo ""
echo ""

# Test connection
echo -e "${BLUE}Testing database connection...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected successfully${NC}"
else
    echo -e "${RED}❌ Failed to connect to database${NC}"
    exit 1
fi
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Step 1: Create tables
if [ -f "$SCRIPT_DIR/create_tables.sql" ]; then
    run_sql_file "$SCRIPT_DIR/create_tables.sql" "Creating tables"
else
    echo -e "${RED}❌ create_tables.sql not found${NC}"
    exit 1
fi

echo ""

# Step 2: Load demo data
read -p "Would you like to load demo data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$SCRIPT_DIR/seed_demo_data.sql" ]; then
        run_sql_file "$SCRIPT_DIR/seed_demo_data.sql" "Loading demo data"
        echo ""
        echo -e "${GREEN}✅ Demo data loaded!${NC}"
        echo ""
        echo "Demo Account Details:"
        echo "  Merchant: Cafe Delight"
        echo "  Email: demo@cafedelight.com"
        echo "  Location: Downtown"
        echo "  Menu Items: 40+ items across 6 categories"
        echo "  QR Codes: 5 table QR codes"
        echo "  Analytics: 350+ events"
    else
        echo -e "${RED}❌ seed_demo_data.sql not found${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Update your backend .env with database credentials"
echo "  2. Start your backend server"
echo "  3. Test the API endpoints"
echo ""

