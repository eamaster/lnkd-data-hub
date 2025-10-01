# Deploy Cloudflare Worker (PowerShell)

Write-Host "🚀 Deploying Cloudflare Worker..." -ForegroundColor Cyan

Set-Location workers

# Check if logged in
try {
    wrangler whoami 2>&1 | Out-Null
} catch {
    Write-Host "❌ Not logged in to Wrangler. Run: wrangler login" -ForegroundColor Red
    exit 1
}

# Verify secrets are set
Write-Host "📝 Checking required secrets..." -ForegroundColor Yellow

$secrets = wrangler secret list 2>&1

if ($secrets -notmatch "RAPIDAPI_KEY") {
    Write-Host "⚠️  RAPIDAPI_KEY not set. Setting now..." -ForegroundColor Yellow
    Write-Host "Please enter your RapidAPI key:" -ForegroundColor Cyan
    wrangler secret put RAPIDAPI_KEY
}

if ($secrets -notmatch "RAPIDAPI_HOST") {
    Write-Host "⚠️  RAPIDAPI_HOST not set. Setting now..." -ForegroundColor Yellow
    "linkedin-api-data.p.rapidapi.com" | wrangler secret put RAPIDAPI_HOST
}

if ($secrets -notmatch "JWT_SECRET") {
    Write-Host "⚠️  JWT_SECRET not set. Setting now..." -ForegroundColor Yellow
    Write-Host "Please enter a secure JWT secret (min 32 characters):" -ForegroundColor Cyan
    wrangler secret put JWT_SECRET
}

# Deploy
Write-Host "📦 Deploying worker..." -ForegroundColor Cyan
wrangler deploy

Write-Host "✅ Worker deployed successfully!" -ForegroundColor Green
Write-Host "🔗 Your worker is now live" -ForegroundColor Green

