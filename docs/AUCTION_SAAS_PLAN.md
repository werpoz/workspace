# Auction SaaS - Implementation Plan

> **Status**: Fase 1 completada. Ver [AUCTION_ROADMAP.md](./AUCTION_ROADMAP.md) para el plan detallado completo.

## ✅ Completado

### Phase 1: Core Domain (Auction Context)
- ✅ Estructura `src/context/auction` creada
- ✅ `Auction` Aggregate Root implementado
- ✅ `Bid` Entity con relación a Auction
- ✅ Value Objects: `AuctionId`, `AuctionStatus`, `AuctionTitle`, `BidAmount`, etc.
- ✅ Domain Events: `AuctionCreated`, `BidPlaced`, `AuctionPublished`
- ✅ Use Cases: `CreateAuction`, `PlaceBid`, `PublishAuction`
- ✅ Repository Interface: `AuctionRepository`

---

## 🚧 Siguiente: Fase 2

### Completar el Dominio
- [ ] **CRÍTICO**: Agregar `Item` Aggregate (lo que se subasta)
  - Actualmente solo tenemos título en `Auction`, falta el producto completo
- [ ] Tests unitarios del dominio
- [ ] In-Memory Repository implementation

Ver documentación completa en: **[AUCTION_ROADMAP.md](./AUCTION_ROADMAP.md)**

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
