# Security Check Script - Verify no secrets in code

Write-Host "🔐 Running Security Audit..." -ForegroundColor Cyan
Write-Host ""

$errors = 0

# Check if sensitive files exist in git
Write-Host "1️⃣ Checking for committed sensitive files..." -ForegroundColor Yellow
$sensitiveFiles = git ls-files | Select-String -Pattern '(\.dev\.vars$|^\.env$|\.env\.local$)'
if ($sensitiveFiles) {
    Write-Host "❌ ERROR: Sensitive files found in git:" -ForegroundColor Red
    $sensitiveFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    $errors++
} else {
    Write-Host "✅ No sensitive files in git" -ForegroundColor Green
}

# Check for RapidAPI key patterns
Write-Host ""
Write-Host "2️⃣ Checking for hardcoded API keys..." -ForegroundColor Yellow
$apiKeyPattern = git grep -E '[0-9a-f]{32}msh[0-9a-f]{16}jsn[0-9a-f]{16}' 2>$null
if ($apiKeyPattern) {
    Write-Host "❌ ERROR: RapidAPI key pattern found in code:" -ForegroundColor Red
    Write-Host $apiKeyPattern -ForegroundColor Red
    $errors++
} else {
    Write-Host "✅ No hardcoded API keys found" -ForegroundColor Green
}

# Check .gitignore
Write-Host ""
Write-Host "3️⃣ Verifying .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
$requiredPatterns = @('.env', '.dev.vars', 'node_modules', '.next')
$missing = @()
foreach ($pattern in $requiredPatterns) {
    if ($gitignoreContent -notmatch [regex]::Escape($pattern)) {
        $missing += $pattern
    }
}
if ($missing.Count -gt 0) {
    Write-Host "⚠️  Missing patterns in .gitignore:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
} else {
    Write-Host "✅ .gitignore properly configured" -ForegroundColor Green
}

# Check if .env files exist locally
Write-Host ""
Write-Host "4️⃣ Checking local environment setup..." -ForegroundColor Yellow
if (Test-Path workers/.dev.vars) {
    Write-Host "✅ workers/.dev.vars exists (for local dev)" -ForegroundColor Green
} else {
    Write-Host "⚠️  workers/.dev.vars missing - copy from .dev.vars.example" -ForegroundColor Yellow
}

if (Test-Path app/.env) {
    Write-Host "✅ app/.env exists (for local dev)" -ForegroundColor Green
} else {
    Write-Host "⚠️  app/.env missing - copy from .env.example" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
if ($errors -gt 0) {
    Write-Host "❌ Security check FAILED with $errors error(s)" -ForegroundColor Red
    Write-Host "Please fix the issues before committing!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Security check PASSED" -ForegroundColor Green
    Write-Host "Safe to commit to GitHub!" -ForegroundColor Green
}
Write-Host "=====================================" -ForegroundColor Cyan

