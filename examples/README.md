# 🎬 Quick Demo Guide

## Start Demo (2 minutes)

### 1. Start Server
```bash
pnpm start:dev
```

### 2. Run Demo Script
```bash
./examples/demo.sh
```

### 3. Follow Prompts
- Enter verification code (from server console)
- Paste Auction ID in browser
- Click "Join Auction"
- Watch bids appear!

---

## What You'll See

**Terminal:**
```
🚀 Auction Demo
===============

Step 1: Register user...
✅ Done

Step 2: Verify account
⚠️  Check server console for 6-digit code
Enter code: 123456
✅ Verified

...

💰 Bid: $150
💰 Bid: $200
💰 Bid: $250
```

**Browser (Alpine.js + Tailwind):**
- Clean, simple UI
- Live stats (Bids / Price / Events)
- Real-time event feed
- Color-coded events

---

## Files

- `examples/auction-demo.html` - WebSocket client (Alpine.js + Tailwind)
- `examples/demo.sh` - Automated demo script
- Open client: `open examples/auction-demo.html`

---

## Troubleshooting

**"Connection refused"**
→ Make sure server is running: `pnpm start:dev`

**"Login failed"**
→ User exists. Try restarting server (in-memory DB)

**"Can't find auction"**
→ Copy the exact Auction ID from terminal

---

**Duration:** ~2 minutes  
**Result:** See 5 bids appear in real-time!
