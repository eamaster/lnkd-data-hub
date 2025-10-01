#!/bin/bash
# Setup Script for LinkedIn Data Hub
# Run this after cloning the repository

set -e

echo "🚀 LinkedIn Data Hub - Setup Script"
echo "====================================="
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node --version)"
  exit 1
fi
echo "✅ Node.js $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Create env files
echo ""
echo "🔐 Setting up environment files..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env"
else
  echo "⚠️  .env already exists, skipping"
fi

if [ ! -f workers/.dev.vars ]; then
  cp workers/.dev.vars.example workers/.dev.vars
  echo "✅ Created workers/.dev.vars"
  echo ""
  echo "⚠️  IMPORTANT: Edit workers/.dev.vars and add your RapidAPI key!"
  echo "   Get your key from: https://rapidapi.com/"
else
  echo "⚠️  workers/.dev.vars already exists, skipping"
fi

if [ ! -f app/.env ]; then
  cp app/.env.example app/.env
  echo "✅ Created app/.env"
else
  echo "⚠️  app/.env already exists, skipping"
fi

# Initialize database
echo ""
echo "💾 Initializing database..."
cd app
npx prisma generate
echo "✅ Prisma client generated"
cd ..

echo ""
echo "====================================="
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit workers/.dev.vars and add your RapidAPI key"
echo "   2. Run worker: cd workers && npm run dev"
echo "   3. Run frontend: cd app && npm run dev"
echo "   4. Open http://localhost:3000"
echo ""
echo "📖 For deployment: See DEPLOYMENT.md"
echo ""

