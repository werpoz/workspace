# Auction SaaS - Implementation Plan

This document outlines the roadmap to transform the current template into a fully functional Auction SaaS platform.

## 🗺️ Roadmap Overview

The project will be executed in phases, adhering to the existing DDD and Hexagonal Architecture.

### Phase 1: Core Domain Modeling (The "Auction" Context)
- [ ] **Define Aggregates**:
    - `Auction` (Start/End time, Status, Current Price)
    - `Item` (Title, Description, Images)
    - `Bid` (Amount, Bidder, Timestamp)
- [ ] **Define Value Objects**:
    - `Money` (Currency, Amount)
    - `AuctionStatus` (Draft, Active, Finished, Cancelled)
- [ ] **Implement Use Cases**:
    - `CreateAuctionUseCase`
    - `PlaceBidUseCase` (with business rules: higher than current, auction active, etc.)
    - `CloseAuctionUseCase`

### Phase 2: Infrastructure & Persistence
- [ ] **Database Migration**:
    - Replace in-memory repositories with **PostgreSQL** (via Prisma or TypeORM).
    - Design schema for Users, Auctions, Bids.
- [ ] **Redis Integration**:
    - Implement Redis for caching hot auctions.
    - Use Redis for locking (to prevent race conditions on bids).

### Phase 3: Real-Time Bidding (WebSockets)
- [ ] **WebSocket Gateway**:
    - Implement `AuctionGateway` for real-time events.
- [ ] **Event Broadcasting**:
    - Broadcast `BidPlaced` events to connected clients.
    - Broadcast `AuctionEnded` events.

### Phase 4: Job Scheduling & Background Tasks
- [ ] **Auction Scheduler**:
    - Job to automatically close auctions when time expires.
    - Job to clean up unverified accounts (from previous backlog).
- [ ] **Email Notifications**:
    - Notify winner (`AuctionWon`).
    - Notify outbid users (`OutbidNotification`).

### Phase 5: Payments & Monetization
- [ ] **Wallet/Credits System** (Optional MVP):
    - Users need credits to bid?
- [ ] **Payment Gateway Integration**:
    - Stripe/PayPal integration for paying for won items.

---

## 🛠️ Technical Checklist

### 1. Auction Context Setup
- [ ] Create `src/context/auction` directory structure.
- [ ] Define `Auction` Aggregate Root.
- [ ] Implement `AuctionRepository` interface.

### 2. Bidding Logic
- [ ] Implement `PlaceBidUseCase`.
- [ ] **Critical**: Handle concurrency (two users bidding same amount at same time).
- [ ] Add domain events: `BidPlacedDomainEvent`.

### 3. Database Implementation
- [ ] Set up Docker Compose for PostgreSQL + Redis.
- [ ] Configure ORM (Prisma recommended for speed).
- [ ] Implement `PostgresAccountRepository` and `PostgresAuctionRepository`.

### 4. API Endpoints
- [ ] `POST /auctions` (Create)
- [ ] `GET /auctions` (List active)
- [ ] `POST /auctions/:id/bid` (Place bid)
- [ ] `GET /auctions/:id/history` (Bid history)

---

## 📝 Notes & Decisions

- **Concurrency**: We will need optimistic locking or Redis distributed locks for the `PlaceBid` use case.
- **Timeouts**: Closing auctions exactly on time requires a robust scheduler (e.g., BullMQ).
