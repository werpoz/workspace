#!/bin/bash

# 🎯 Auction Demo - With Debug
set -e

API_URL="http://localhost:8000"
TOKEN=""
ITEM_ID=""
AUCTION_ID=""

echo "🚀 Auction Demo (Debug Mode)"
echo "=============================="
echo ""

# Step 1: Register
echo "Step 1: Register user..."
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@auction.com", "password": "Demo123!"}' > /dev/null
echo "✅ Done"
echo ""

# Step 2: Verify
echo "Step 2: Verify account"
echo "⚠️  Check server console for 6-digit code"
read -p "Enter code: " CODE

curl -s -X POST "$API_URL/auth/verify/code" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"demo@auction.com\", \"code\": \"$CODE\"}" > /dev/null
echo "✅ Verified"
echo ""

# Step 3: Login
echo "Step 3: Login..."
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@auction.com", "password": "Demo123!"}')

echo "DEBUG - Login response:"
echo "$RESPONSE" | jq '.'
echo ""

TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Logged in"
echo "Token: ${TOKEN:0:30}..."
echo ""

# Step 4: Create Item
echo "Step 4: Create item..."
ITEM_RESPONSE=$(curl -s -X POST "$API_URL/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vintage Camera 📷",
    "description": "1960s camera",
    "category": "electronics",
    "condition": "good"
  }')

echo "DEBUG - Item response:"
echo "$ITEM_RESPONSE" | jq '.'
echo ""

ITEM_ID=$(echo $ITEM_RESPONSE | jq -r '.data.id')
echo "✅ Item created"
echo "   ID: $ITEM_ID"

if [ "$ITEM_ID" = "null" ] || [ -z "$ITEM_ID" ]; then
  echo "❌ Item ID is null - stopping"
  exit 1
fi
echo ""

# Step 5: Create Auction
echo "Step 5: Create auction (1 min)..."
END_TIME=$(date -u -v+1M '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '+1 minute' '+%Y-%m-%dT%H:%M:%SZ')

AUCTION_RESPONSE=$(curl -s -X POST "$API_URL/auctions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"itemId\": \"$ITEM_ID\",
    \"startingPrice\": 100,
    \"endsAt\": \"$END_TIME\"
  }")

echo "DEBUG - Auction response:"
echo "$AUCTION_RESPONSE" | jq '.'
echo ""

AUCTION_ID=$(echo $AUCTION_RESPONSE | jq -r '.data.id')
echo "✅ Auction created"
echo "   ID: $AUCTION_ID"

if [ "$AUCTION_ID" = "null" ] || [ -z "$AUCTION_ID" ]; then
  echo "❌ Auction ID is null - stopping"
  exit 1
fi
echo ""

# Step 6: Publish
echo "Step 6: Publish..."
curl -s -X POST "$API_URL/auctions/$AUCTION_ID/publish" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✅ Published"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Auction ID: $AUCTION_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Open examples/auction-demo.html and paste this ID:"
echo "$AUCTION_ID"
echo ""
read -p "Press ENTER to place bids..."

# Place bids
echo ""
for BID in 150 200 250 300 350; do
  echo "💰 Bid: \$$BID"
  curl -s -X POST "$API_URL/auctions/$AUCTION_ID/bids" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"amount\": $BID}" > /dev/null
  sleep 2
done

echo ""
echo "✅ Done!"
