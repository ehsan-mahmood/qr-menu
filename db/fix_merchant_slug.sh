#!/bin/bash

# Quick fix to add merchant slug to existing database

echo "🔧 Adding merchant slug field..."

DB_NAME="${DB_NAME:-qrmenu}"
DB_USER="${DB_USER:-dev}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

read -sp "Database password: " DB_PASSWORD
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/add_merchant_slug.sql"

echo ""
echo "✅ Done! Now you can access: http://192.168.1.13:3000/m/cafe-delight"

