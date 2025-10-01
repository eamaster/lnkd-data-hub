#!/bin/bash
# Deploy Cloudflare Worker

set -e

echo "🚀 Deploying Cloudflare Worker..."

cd workers

# Check if logged in
if ! wrangler whoami > /dev/null 2>&1; then
  echo "❌ Not logged in to Wrangler. Run: wrangler login"
  exit 1
fi

# Verify secrets are set
echo "📝 Checking required secrets..."
SECRETS=$(wrangler secret list 2>/dev/null || echo "")

if ! echo "$SECRETS" | grep -q "RAPIDAPI_KEY"; then
  echo "⚠️  RAPIDAPI_KEY not set. Setting now..."
  echo "Please enter your RapidAPI key:"
  wrangler secret put RAPIDAPI_KEY
fi

if ! echo "$SECRETS" | grep -q "RAPIDAPI_HOST"; then
  echo "⚠️  RAPIDAPI_HOST not set. Setting now..."
  wrangler secret put RAPIDAPI_HOST <<< "linkedin-api-data.p.rapidapi.com"
fi

if ! echo "$SECRETS" | grep -q "JWT_SECRET"; then
  echo "⚠️  JWT_SECRET not set. Setting now..."
  echo "Please enter a secure JWT secret (min 32 characters):"
  wrangler secret put JWT_SECRET
fi

# Deploy
echo "📦 Deploying worker..."
wrangler deploy

echo "✅ Worker deployed successfully!"
echo "🔗 Your worker is now live"

