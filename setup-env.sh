#!/bin/bash

# Property Management App - Environment Setup Script
# Run this script to set up your environment variables

echo "🔧 Setting up environment variables for Property Management App..."

# Export environment variables
export DATABASE_URL="postgresql://max@localhost:5432/property_dev"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="your-local-development-secret-key"

echo "✅ Environment variables set:"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   NEXTAUTH_URL: $NEXTAUTH_URL"
echo "   NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

echo ""
echo "🚀 You can now run:"
echo "   npm run dev          # Start development server"
echo "   npx tsx scripts/seed-properties.ts  # Run seed script"
echo "   npx prisma studio    # Open database browser"
echo ""
echo "🔐 Login credentials:"
echo "   Email: m@m.com"
echo "   Password: password123"
