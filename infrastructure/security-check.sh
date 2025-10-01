#!/bin/bash
# Security Check Script - Verify no secrets in code

set -e

echo "🔐 Running Security Audit..."
echo ""

errors=0

# Check if sensitive files exist in git
echo "1️⃣  Checking for committed sensitive files..."
if git ls-files | grep -E '(\.dev\.vars$|^\.env$|\.env\.local$)'; then
    echo "❌ ERROR: Sensitive files found in git (see above)"
    ((errors++))
else
    echo "✅ No sensitive files in git"
fi

# Check for RapidAPI key patterns
echo ""
echo "2️⃣  Checking for hardcoded API keys..."
if git grep -E '[0-9a-f]{32}msh[0-9a-f]{16}jsn[0-9a-f]{16}' HEAD 2>/dev/null; then
    echo "❌ ERROR: RapidAPI key pattern found in code (see above)"
    ((errors++))
else
    echo "✅ No hardcoded API keys found"
fi

# Check .gitignore
echo ""
echo "3️⃣  Verifying .gitignore..."
required_patterns=('.env' '.dev.vars' 'node_modules' '.next')
for pattern in "${required_patterns[@]}"; do
    if ! grep -q "$pattern" .gitignore; then
        echo "⚠️  Missing in .gitignore: $pattern"
    fi
done
echo "✅ .gitignore check complete"

# Check if .env files exist locally
echo ""
echo "4️⃣  Checking local environment setup..."
if [ -f workers/.dev.vars ]; then
    echo "✅ workers/.dev.vars exists (for local dev)"
else
    echo "⚠️  workers/.dev.vars missing - copy from .dev.vars.example"
fi

if [ -f app/.env ]; then
    echo "✅ app/.env exists (for local dev)"
else
    echo "⚠️  app/.env missing - copy from .env.example"
fi

# Summary
echo ""
echo "====================================="
if [ $errors -gt 0 ]; then
    echo "❌ Security check FAILED with $errors error(s)"
    echo "Please fix the issues before committing!"
    exit 1
else
    echo "✅ Security check PASSED"
    echo "Safe to commit to GitHub!"
fi
echo "====================================="

