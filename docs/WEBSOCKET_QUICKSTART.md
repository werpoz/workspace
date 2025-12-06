# WebSocket + BullMQ - Quick Start Guide

## Prerequisites

1. **Redis** must be running (port 6379)
2. **Node.js** 18+ installed
3. **pnpm** package manager

---

## Step 1: Start Redis

### Option A: Docker (Recommended)

```bash
# Start Redis container
docker-compose up -d redis

# Verify Redis is running
docker-compose ps

# Check logs
docker-compose logs redis
```

### Option B: Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Verify
redis-cli ping
# Should return: PONG
```

---

## Step 2: Configure Environment

```bash
# Copy example env file if you haven't
cp .env.example .env

# Verify Redis configuration in .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# WebSocket configuration
WEBSOCKET_CORS_ORIGIN=http://localhost:3000
WEBSOCKET_ENABLED=true

# BullMQ configuration
BULLMQ_CONCURRENCY=5
BULLMQ_MAX_RETRIES=5
BULLMQ_ENABLED=true
```

---

## Step 3: Start the Server

```bash
# Development mode
pnpm start:dev

# You should see:
# - BullMQ Service initialized
# - EmailNotificationWorker initialized
# - AuctionClosingWorker initialized
# - WebSocket server listening
```

---

## Step 4: Test WebSocket Connection

### Option A: Using the Test Client (Easiest)

1. Open `examples/websocket-client.html` in your browser
2. The client will auto-connect
3. Enter an auction ID (e.g., `test-auction-123`)
4. Click "Join Auction"
5. You should see "Joined auction" event

### Option B: Using `wscat`

```bash
# Install wscat globally
npm install -g wscat

# Connect to WebSocket server
wscat -c ws://localhost:8000/auctions

# Once connected, join an auction
> {"event": "join-auction", "data": "test-auction-123"}

# You should receive a success response
```

---

## Step 5: Test Real-Time Bidding

### Terminal 1: Start the server

```bash
pnpm start:dev
```

### Terminal 2: Open WebSocket client

1. Open `examples/websocket-client.html` in browser
2. Join auction: `test-auction-123`

### Terminal 3: Place a bid via API

```bash
# First, register and login to get a JWT token
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "bidder@example.com", "password": "password123"}'

# Verify the account (get code from console logs)
curl -X POST http://localhost:8000/auth/verify/code \
  -H "Content-Type: application/json" \
  -d '{"email": "bidder@example.com", "code": "123456"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "bidder@example.com", "password": "password123"}'

# Save the JWT token from response
export TOKEN="your-jwt-token-here"

# Create an item
curl -X POST http://localhost:8000/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Item",
    "description": "Test description",
    "category": "electronics",
    "condition": "new"
  }'

# Save the item ID
export ITEM_ID="item-id-from-response"

# Create an auction
curl -X POST http://localhost:8000/auctions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "'$ITEM_ID'",
    "startingPrice": 100,
    "endsAt": "2025-12-31T23:59:59Z"
  }'

# Save the auction ID
export AUCTION_ID="test-auction-123"

# Publish the auction
curl -X POST http://localhost:8000/auctions/$AUCTION_ID/publish \
  -H "Authorization: Bearer $TOKEN"

# Place a bid
curl -X POST http://localhost:8000/auctions/$AUCTION_ID/bids \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150}'
```

**Expected Result:**
- WebSocket client receives `new-bid` event immediately
- BullMQ queues email notification job
- Console shows "BidPlacedEvent handled"

---

## Step 6: Verify BullMQ Workers

### Check Queue Status

```typescript
// Add this to a test controller or run in Node.js console
const bullmq = app.get(BullMQService);
const counts = await bullmq.getQueueCounts('email-notifications');
console.log(counts);
// { waiting: 1, active: 0, completed: 0, failed: 0, delayed: 0 }
```

### Monitor Redis Queues

```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS *

# Check queue details
LRANGE bull:email-notifications:waiting 0 -1

# Monitor real-time commands
MONITOR
```

---

##Troubleshooting

### Redis Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Fix:**
```bash
# Check if Redis is running
redis-cli ping

# If not running
docker-compose up -d redis
# or
brew services start redis
```

### WebSocket Connection Failed

**Error:** `Connection error: xhr poll error`

**Fix:**
1. Check server is running: `pnpm start:dev`
2. Check CORS configuration in `.env`
3. Verify WebSocket namespace: `http://localhost:8000/auctions`

### Jobs Not Processing

**Error:** Jobs stuck in `waiting` state

**Fix:**
1. Check worker logs: Should see "EmailNotificationWorker initialized"
2. Verify Redis connection
3. Check job data format matches worker expectations

---

## Architecture Overview

```
Client (Browser)
    ↓ WebSocket
AuctionGateway (Socket.io)
    ↓ Event
BidPlacedEventHandler
    ↓ Broadcast + Queue Job
┌──────────────────┬──────────────────┐
│  WebSocket Emit  │   BullMQ Job     │
│  (Real-time)     │   (Async)        │
└──────────────────┴──────────────────┘
         ↓                    ↓
    Other Clients      EmailWorker
                            ↓
                      Send Email
```

---

## Next Steps

- [ ] Add authentication to WebSocket (JWT validation)
- [ ] Implement full email notification templates
- [ ] Add auction auto-close logic (close() method on Auction)
- [ ] Create Bull Board UI for queue monitoring
- [ ] Add rate limiting
- [ ] Implement real database (Prisma + PostgreSQL)

---

## Useful Commands

```bash
# Start Redis
docker-compose up -d redis

# Stop Redis
docker-compose down

# View Redis logs
docker-compose logs -f redis

# Start server
pnpm start:dev

# Build project
pnpm run build

# Run tests
pnpm test

# Monitor Redis
redis-cli MONITOR
```

---

**Status:** ✅ MVP WebSocket + BullMQ implementation complete!

For questions, check `/docs/INTERNAL_FLOWS.md` for detailed architecture documentation.
