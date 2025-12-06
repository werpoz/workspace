# Frontend Integration Guide - Real-Time Auction System

## Overview

This guide explains how to integrate the auction system's WebSocket functionality and REST API into a frontend application.

---

## 🔌 **WebSocket Integration**

### Connection Setup

```javascript
import io from 'socket.io-client';

// Connect to the auction WebSocket namespace
const socket = io('http://localhost:8000/auctions', {
  transports: ['websocket'],
  // For authenticated connections (future enhancement):
  // auth: { token: 'your_jwt_token' }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to auction server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Joining an Auction

```javascript
function joinAuction(auctionId) {
  socket.emit('join-auction', auctionId, (response) => {
    console.log('Joined auction:', auctionId);
    // Start listening for auction events
  });
}

function leaveAuction(auctionId) {
  socket.emit('leave-auction', auctionId);
}
```

### Listening to Real-Time Events

#### **1. New Bid Event**

```javascript
socket.on('new-bid', (data) => {
  console.log('New bid received:', data);
  
  // Data structure:
  // {
  //   auctionId: string,
  //   bidId: string,
  //   amount: number,
  //   previousPrice: number,
  //   bidderId: string,
  //   timestamp: string (ISO 8601)
  // }
  
  // Update UI
  updateCurrentPrice(data.amount);
  addBidToHistory({
    id: data.bidId,
    amount: data.amount,
    bidderId: data.bidderId,
    time: data.timestamp
  });
  
  // Show notification if user was outbid
  if (data.bidderId !== currentUserId && previousHighBidder === currentUserId) {
    showNotification('You have been outbid!', {
      newPrice: data.amount,
      difference: data.amount - data.previousPrice
    });
  }
});
```

#### **2. Auction Published Event**

```javascript
socket.on('auction-published', (data) => {
  console.log('Auction published:', data);
  
  // Data structure:
  // {
  //   id: string,
  //   itemId: string,
  //   startingPrice: number,
  //   endsAt: string (ISO 8601)
  // }
  
  // Update auction status
  updateAuctionStatus(data.id, 'active');
  startCountdownTimer(data.endsAt);
});
```

#### **3. Auction Ended Event**

```javascript
socket.on('auction-ended', (data) => {
  console.log('Auction ended:', data);
  
  // Data structure:
  // {
  //   auctionId: string,
  //   winnerId?: string,
  //   finalPrice?: number
  // }
  
  // Update UI
  updateAuctionStatus(data.auctionId, 'closed');
  stopCountdownTimer();
  
  if (data.winnerId) {
    displayWinner({
      userId: data.winnerId,
      finalPrice: data.finalPrice,
      isCurrentUser: data.winnerId === currentUserId
    });
  } else {
    showMessage('Auction ended with no bids');
  }
});
```

---

## 🌐 **REST API Integration**

Base URL: `http://localhost:8000`

### Authentication

All auction endpoints require JWT authentication via Bearer token:

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

### Endpoints

#### **1. Create Item**

```javascript
POST /items

const createItem = async (itemData) => {
  const response = await fetch('http://localhost:8000/items', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: itemData.title,
      description: itemData.description,
      category: 'electronics', // electronics, art, collectibles, etc.
      condition: 'good', // new, like_new, good, fair, poor
      images: itemData.images || [] // array of image URLs
    })
  });
  
  const data = await response.json();
  // Returns: { success: true, data: { id, title, ... }, message }
  return data.data.id; // Item ID
};
```

#### **2. Create Auction**

```javascript
POST /auctions

const createAuction = async (itemId, startingPrice, endsAt) => {
  const response = await fetch('http://localhost:8000/auctions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      itemId,
      startingPrice,
      endsAt: endsAt.toISOString() // Must be future date
    })
  });
  
  const data = await response.json();
  return data.data.id; // Auction ID
};
```

#### **3. Publish Auction**

```javascript
POST /auctions/:id/publish

const publishAuction = async (auctionId) => {
  const response = await fetch(`http://localhost:8000/auctions/${auctionId}/publish`, {
    method: 'POST',
    headers
  });
  
  const data = await response.json();
  // Auction is now ACTIVE and bidding can begin
  // Real-time listeners will receive 'auction-published' event
  return data.data;
};
```

#### **4. Place Bid**

```javascript
POST /auctions/:id/bids

const placeBid = async (auctionId, amount) => {
  try {
    const response = await fetch(`http://localhost:8000/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    // Real-time listeners will receive 'new-bid' event
    return data.data;
  } catch (error) {
    // Handle business rule errors
    handleBidError(error.message);
  }
};
```

#### **5. Get Auction Details**

```javascript
GET /auctions/:id

const getAuction = async (auctionId) => {
  const response = await fetch(`http://localhost:8000/auctions/${auctionId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  const data = await response.json();
  
  // Returns full auction data:
  // {
  //   id, itemId, startingPrice, status,
  //   bids: [{ id, amount, bidderId, timestamp }],
  //   createdAt, endsAt
  // }
  
  return data.data;
};
```

---

## 🚨 **Business Rules & Error Handling**

### Bidding Rules

The backend enforces these rules (you should also validate in the frontend for better UX):

1. **Auction must be ACTIVE**
   - Error: `"Auction is not active"`
   - UI: Disable bid button if status !== 'active'

2. **Auction must not have ended**
   - Error: `"Auction has ended"`
   - UI: Show countdown timer and disable bids when time expires

3. **Bid must be higher than current price**
   - Error: `"Bid amount must be higher than current price"`
   - UI: Show minimum bid amount in input placeholder

4. **Minimum Increment (5% or $5, whichever is higher)**
   - Error: `"Bid must be at least $X higher than current price"`
   - UI: Calculate and show minimum next bid
   ```javascript
   const minIncrement = Math.max(5, currentPrice * 0.05);
   const minBid = currentPrice + minIncrement;
   ```

5. **No Self-Bidding**
   - Error: `"Cannot bid on your own bid"`
   - UI: Show message if user is current high bidder
   ```javascript
   if (lastBid.bidderId === currentUserId) {
     showMessage('You are already the highest bidder');
     disableBidButton();
   }
   ```

6. **Anti-Sniping (Auto-Extension)**
   - If a bid is placed in the last 2 minuts, the auction extends by 2 more minutes
   - UI: Update countdown timer when `endsAt` changes
   - **Note:** Currently implemented on backend but not emitted via WebSocket
   - **TODO:** Add `auction-extended` event to notify clients

---

## 📱 **Complete Frontend Example (React)**

```jsx
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function AuctionPage({ auctionId, currentUserId, accessToken }) {
  const [auction, setAuction] = useState(null);
  const [socket, setSocket] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // Initialize WebSocket
  useEffect(() => {
    const newSocket = io('http://localhost:8000/auctions', {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-auction', auctionId);
    });

    newSocket.on('new-bid', (data) => {
      setAuction(prev => ({
        ...prev,
        bids: [...prev.bids, data],
        currentPrice: data.amount
      }));

      // Notification for outbid
      if (data.bidderId !== currentUserId && isCurrentHighBidder()) {
        showNotification('You have been outbid!');
      }
    });

    newSocket.on('auction-ended', (data) => {
      setAuction(prev => ({ ...prev, status: 'closed' }));
      if (data.winnerId === currentUserId) {
        showNotification('Congratulations! You won the auction!');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-auction', auctionId);
      newSocket.close();
    };
  }, [auctionId]);

  // Fetch initial auction data
  useEffect(() => {
    fetchAuction();
  }, [auctionId]);

  const fetchAuction = async () => {
    const response = await fetch(`http://localhost:8000/auctions/${auctionId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    setAuction(data.data);
  };

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    const minBid = calculateMinBid(auction.currentPrice);

    // Frontend validation
    if (amount < minBid) {
      alert(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }

    if (isCurrentHighBidder()) {
      alert('You are already the highest bidder');
      return;
    }

    try {
      await fetch(`http://localhost:8000/auctions/${auctionId}/bids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      setBidAmount('');
      // UI will update via WebSocket event
    } catch (error) {
      alert(error.message);
    }
  };

  const calculateMinBid = (currentPrice) => {
    const minIncrement = Math.max(5, currentPrice * 0.05);
    return currentPrice + minIncrement;
  };

  const isCurrentHighBidder = () => {
    if (!auction?.bids?.length) return false;
    const lastBid = auction.bids[auction.bids.length - 1];
    return lastBid.bidderId === currentUserId;
  };

  if (!auction) return <div>Loading...</div>;

  return (
    <div>
      <h1>Auction {auction.id}</h1>
      <p>Status: {auction.status}</p>
      <p>Current Price: ${auction.currentPrice || auction.startingPrice}</p>
      
      {auction.status === 'active' && (
        <div>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`Min: $${calculateMinBid(auction.currentPrice || auction.startingPrice).toFixed(2)}`}
            disabled={isCurrentHighBidder()}
          />
          <button onClick={placeBid} disabled={isCurrentHighBidder()}>
            {isCurrentHighBidder() ? 'Highest Bidder' : 'Place Bid'}
          </button>
        </div>
      )}

      <h3>Bid History</h3>
      <ul>
        {auction.bids?.map(bid => (
          <li key={bid.id}>
            ${bid.amount} - {bid.bidderId === currentUserId ? 'You' : `User ${bid.bidderId.slice(0, 8)}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## ⏱️ **Countdown Timer Implementation**

```javascript
function CountdownTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endsAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calculateTimeLeft(endsAt);
      setTimeLeft(left);

      if (left.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  function calculateTimeLeft(endDate) {
    const difference = new Date(endDate) - new Date();
    
    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  const { days, hours, minutes, seconds, total } = timeLeft;

  if (total <= 0) {
    return <div className="ended">Auction Ended</div>;
  }

  // Highlight if less than 2 minutes (anti-sniping zone)
  const isAntiSnipingZone = total < 120000;

  return (
    <div className={isAntiSnipingZone ? 'urgent' : ''}>
      {days > 0 && `${days}d `}
      {hours}h {minutes}m {seconds}s
      {isAntiSnipingZone && <span> ⚠️ Last 2 minutes!</span>}
    </div>
  );
}
```

---

## 🐛 **Common Issues & Debugging**

### WebSocket not connecting

```javascript
// Check CORS issues
const socket = io('http://localhost:8000/auctions', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000
});

socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
});
```

### Events not received

```javascript
// Make sure you join the auction room first
socket.emit('join-auction', auctionId, (response) => {
  console.log('Joined successfully');
  // Now you'll receive events
});
```

### JWT expired

```javascript
// Refresh token before making requests
if (isTokenExpired(accessToken)) {
  accessToken = await refreshAuthToken();
}
```

---

## 🚀 **Production Considerations**

1. **Environment Variables**
   ```javascript
   const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:8000';
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
   ```

2. **Error Boundaries**
   - Wrap WebSocket components in React Error Boundaries
   - Implement reconnection logic

3. **Performance**
   - Debounce bid input
   - Throttle real-time updates if high frequency

4. **Security**
   - Never store JWT in localStorage (use httpOnly cookies)
   - Validate all inputs client-side
   - Sanitize user-generated content

5. **Future Enhancements**
   - WebSocket JWT authentication
   - Optimistic UI updates
   - Offline support with queue
   - Push notifications

---

## 📚 **Related Documentation**

- [WebSocket Quick Start](./WEBSOCKET_QUICKSTART.md)
- [API Documentation](http://localhost:8000/docs) (Swagger)
- [Project Status](./PROJECT_STATUS.md)
