# Auction SaaS - Roadmap Completo

## 🎯 Estado Actual
✅ Dominio Core de Subastas implementado
- `Auction` Aggregate con reglas de negocio
- `Bid` Entity con relación a Auction
- Value Objects (`AuctionStatus`, `BidAmount`, etc.)
- Domain Events (`AuctionCreated`, `BidPlaced`, `AuctionPublished`)
- Use Cases básicos (`CreateAuction`, `PlaceBid`, `PublishAuction`)

---

## 📋 Pasos Faltantes (Orden Lógico)

### **Fase 1: Completar el Dominio** 🔴 CRÍTICO

#### 1.1 Agregar `Item` Aggregate
**Por qué es crítico**: Actualmente las subastas NO tienen un "producto" asociado. Solo tienen título y precio inicial.

**Qué implementar**:
- [x] `Item` Aggregate Root con:
  - `ItemId`, `ItemTitle`, `ItemDescription`
  - `ItemImages` (lista de URLs)
  - `ItemCategory` (electrónica, arte, etc.)
  - `ItemCondition` (nuevo, usado, etc.)
- [x] Relación `Auction` → `Item` (un auction tiene un item)
- [x] Modificar `Auction.create()` para requerir un `itemId`
- [x] Evento: `ItemCreatedDomainEvent`

**Alternativa Simplificada**: 
Si no quieres un aggregate separado, puedes hacer que `Item` sea un **Value Object** dentro de `Auction` (más simple pero menos flexible).

#### 1.2 Agregar eventos faltantes
- [ ] `AuctionCompletedDomainEvent` (cuando termina el tiempo)
- [ ] `AuctionCancelledDomainEvent` (si el creador cancela)

---

### **Fase 2: Testing del Dominio** 🟡 ALTA PRIORIDAD

#### 2.1 Unit Tests
- [ ] Tests para todos los Value Objects
- [x] Tests para `Auction` Aggregate:
  - ✅ No se puede pujar si no está `active`
  - ✅ Puja debe ser mayor al precio actual (Min Increment)
  - ✅ No se puede pujar después del `endsAt` (Anti-sniping implemented)
  - ✅ `publish()` solo funciona en estado `draft`
  - ✅ No self-bidding
- [ ] Tests para `Bid` Entity
- [ ] Tests para Use Cases (con mocks de repositorios)

---

### **Fase 3: Infraestructura In-Memory** 🟢 MEDIA PRIORIDAD

#### 3.1 Implementar Repositorio In-Memory
- [x] `InMemoryAuctionRepository`
  - `save()`, `searchById()`, `findAll()`, `findActive()`, etc.
- [x] (Opcional) `InMemoryItemRepository` si decides crear `Item`

#### 3.2 Módulo NestJS
- [x] Crear `AuctionModule`
- [x] Registrar Use Cases como providers
- [x] Registrar repositorios (in-memory por ahora)
- [x] Exportar Use Cases para uso en controllers

---

### **Fase 4: API REST** 🟢 MEDIA PRIORIDAD

#### 4.1 Controller y DTOs
- [x] `AuctionController` con endpoints:
  - `POST /auctions` → Crear subasta
  - `GET /auctions` → Listar activas
  - `GET /auctions/:id` → Detalle
  - `POST /auctions/:id/publish` → Activar
  - `POST /auctions/:id/bids` → Pujar
  - `GET /auctions/:id/bids` → Historial de pujas
- [x] DTOs con validación (`class-validator`)
- [x] Swagger documentation

#### 4.2 Guards y Permisos
  - `auction.ended` → Cuando termina

#### 5.2 Event Handlers
#### 5.2 Event Handlers
- [x] `BidPlacedEventHandler` → Emite WebSocket
- [x] Integración con Redis Pub/Sub (para escalabilidad horizontal)

---

### **Fase 6: Persistencia Real (Base de Datos)** 🟠 NECESARIO

#### 6.1 Configurar Base de Datos
- [ ] Docker Compose con PostgreSQL + Redis
- [ ] Prisma ORM setup
- [ ] Definir schema:
  ```prisma
  model Auction {
    id            String   @id
    title         String
    startingPrice Decimal
    status        String
    createdAt     DateTime
    endsAt        DateTime
    bids          Bid[]
  }
  
  model Bid {
    id         String   @id
    auctionId  String
    amount     Decimal
    bidderId   String
    createdAt  DateTime
    auction    Auction  @relation(fields: [auctionId], references: [id])
  }
  ```

#### 6.2 Implementar Repositorios Reales
- [ ] `PrismaAuctionRepository`
- [ ] Migrar lógica de in-memory a Prisma
- [ ] Manejar transacciones (importante para `placeBid`)

---

### **Fase 7: Background Jobs** 🟠 NECESARIO

#### 7.1 Scheduler (BullMQ + Redis)
- [x] Job: `CloseExpiredAuctionsJob`
  - Corre cada minuto
  - Busca auctions con `endsAt < now()` y `status = active`
  - Cambia estado a `completed`
  - Determina ganador (bid más alto)
  - Publica `AuctionCompletedDomainEvent`

#### 7.2 Email Notifications
- [x] Email al ganador: "¡Ganaste la subasta!"
- [x] Email a usuarios outbid: "Te han superado"

---

### **Fase 8: Características Avanzadas** 🔵 OPCIONAL

#### 8.1 Estrategias de Puja
- [ ] Auto-bid (puja automática hasta un máximo)
- [ ] Puja ciega (no se ve el precio actual)

#### 8.2 Comisiones y Pagos
- [ ] Sistema de comisiones (plataforma se queda con X%)
- [ ] Integración con Stripe/PayPal

#### 8.3 Sistema de Reputación
- [ ] Usuarios tienen rating
- [ ] Historial de subastas ganadas/perdidas

---

## 🎯 Recomendación de Orden

### **Corto Plazo (MVP Funcional)**
1. ✅ **Agregar `Item`** → Sin esto, las subastas no tienen sentido
2. ✅ **Tests Unitarios** → Asegurar que las reglas de negocio funcionan
3. ✅ **In-Memory Repo + Module** → Para poder probar end-to-end
4. ✅ **API REST** → Para que el frontend pueda interactuar

### **Mediano Plazo (Producción Básica)**
5. ✅ **Base de Datos Real** → PostgreSQL + Prisma
6. ✅ **Background Jobs** → Cerrar subastas automáticamente
7. ✅ **Email Notifications** → Alertas importantes

### **Largo Plazo (Escalar)**
8. ✅ **WebSockets** → Real-time bidding
9. ✅ **Redis Caching** → Performance
10. ✅ **Características Avanzadas** → Auto-bid, pagos, etc.

---

## 📊 Diagrama de Dependencias

```
Item (Aggregate)
    ↓
Auction (Aggregate) → requiere Item
    ↓
Bid (Entity) → requiere Auction activo
    ↓
BidPlacedEvent → WebSocket (opcional)
    ↓
CloseAuctionJob → determina ganador
    ↓
EmailNotification → notifica usuarios
```

---

## ❓ Decisión Clave: Item como Aggregate vs Value Object

### **Opción A: Item como Aggregate (Recomendado)**
✅ Más flexible: items pueden existir antes de crear auction
✅ Reutilización: un item podría subastarse múltiples veces
✅ Gestión independiente: CRUD de items separado

### **Opción B: Item como Value Object dentro de Auction**
✅ Más simple: menos código
❌ Menos flexible: item está acoplado a la auction
❌ No reutilizable

**Mi recomendación**: Opción A para un SaaS real.
