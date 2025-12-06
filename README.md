# Auction SaaS Core

A robust, production-ready backend engine for a real-time Auction SaaS platform. Built with **NestJS**, following **Domain-Driven Design (DDD)** and **Hexagonal Architecture** principles.

![Status](https://img.shields.io/badge/Status-MVP_Complete-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-98%25-green)
![Tech](https://img.shields.io/badge/Stack-NestJS_Redis_BullMQ-blue)

## � Key Features

### 🏛️ Domain Core
- **Complex Bidding Rules**:
  - Minimum increment logic (5% or $5.00)
  - Anti-sniping (auto-extending end time)
  - Self-bidding prevention
- **Auction Lifecycle**: Draft -> Published -> Active -> Completed/Expired

### ⚡ Real-Time & Async
- **Real-Time Bidding**: WebSocket-based push updates via Socket.io
- **Background Jobs**:
  - `BullMQ` + `Redis` for reliable job processing
  - Auto-closing of expired auctions
  - Email notification queues (Outbid, Won, Ends soon)

### 🔐 Security & Identity
- **Custom Auth System**:
  - JWT Access Tokens
  - Email verification (6-digit codes)
  - Separation of `Account` (auth) and `Identity` (profile)
  - Secure password hashing (Bcrypt)

---

## 📚 Documentation

The `docs/` folder contains comprehensive guides:

- **Getting Started**:
  - [WebSocket Quickstart](./docs/WEBSOCKET_QUICKSTART.md) - Setup real-time features
  - [Frontend Integration](./docs/FRONTEND_INTEGRATION.md) - Integrating React/Gateway
  - [Project Status](./docs/PROJECT_STATUS.md) - Current MVP status

- **Deep Dive**:
  - [Architecture Guide](./docs/ARCHITECTURE.md) - Hexagonal + DDD explained
  - [Internal Flows](./docs/INTERNAL_FLOWS.md) - Sequence diagrams of core flows
  - [Database Schema](./docs/DATABASE_SCHEMA.md) - Data models
  - [Testing Guide](./docs/TESTING.md) - Testing strategy

- **Planning**:
  - [Roadmap](./docs/AUCTION_ROADMAP.md) - Future features

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- Docker (for Redis)

### 1. Setup Environment
```bash
pnpm install
cp .env.example .env
```

### 2. Start Infrastructure (Redis)
```bash
# Start Redis for WebSockets and BullMQ
docker-compose up -d redis
```

### 3. Run Application
```bash
# Development mode
pnpm run start:dev
```
Access API at `http://localhost:8000`  
Access Swagger at `http://localhost:8000/docs`

### 4. Run Tests
```bash
# Run unit tests
pnpm test

# Check coverage (98%+)
pnpm run test:cov
```

---

## 🏗️ Project Structure

```
src/
├── context/
│   ├── auction/            # Auction Bounded Context
│   │   ├── domain/         # Rules: Bids, Anti-sniping, Min Increment
│   │   ├── application/    # Use Cases: PlaceBid, PublishAuction
│   │   ├── infrastructure/ # WebSockets, Controllers, BullMQ Workers
│   ├── identity/           # Identity Bounded Context
│   │   ├── domain/         # Users, Accounts, Verification
│   │   ├── application/    # Use Cases: Register, Login
│   │   └── infrastructure/ # Auth Guards, JWT strategies
│   └── shared/             # Shared Kernel (EventBus, DDD primitives)
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT
- `POST /auth/verify` - Verify email

### Auctions
- `POST /auctions` - Create draft auction
- `POST /auctions/:id/publish` - Go live
- `POST /auctions/:id/bids` - Place bid (Real-time broadcast)
- `GET /auctions/:id` - Get details

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

UNLICENSED
