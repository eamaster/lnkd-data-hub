# Setup Script for LinkedIn Data Hub
# Run this after cloning the repository

Write-Host "🚀 LinkedIn Data Hub - Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)\.") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js 18+ required. Current: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Create env files
Write-Host ""
Write-Host "🔐 Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env already exists, skipping" -ForegroundColor Yellow
}

if (-not (Test-Path workers/.dev.vars)) {
    Copy-Item workers/.dev.vars.example workers/.dev.vars
    Write-Host "✅ Created workers/.dev.vars" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit workers/.dev.vars and add your RapidAPI key!" -ForegroundColor Red
    Write-Host "   Get your key from: https://rapidapi.com/" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  workers/.dev.vars already exists, skipping" -ForegroundColor Yellow
}

if (-not (Test-Path app/.env)) {
    Copy-Item app/.env.example app/.env
    Write-Host "✅ Created app/.env" -ForegroundColor Green
} else {
    Write-Host "⚠️  app/.env already exists, skipping" -ForegroundColor Yellow
}

# Initialize database
Write-Host ""
Write-Host "💾 Initializing database..." -ForegroundColor Yellow
Set-Location app
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma client generated" -ForegroundColor Green
}
Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit workers/.dev.vars and add your RapidAPI key" -ForegroundColor White
Write-Host "   2. Run worker: cd workers && npm run dev" -ForegroundColor White
Write-Host "   3. Run frontend: cd app && npm run dev" -ForegroundColor White
Write-Host "   4. Open http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📖 For deployment: See DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

