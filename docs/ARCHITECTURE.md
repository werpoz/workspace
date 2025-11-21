# Architecture Documentation

This document provides a detailed overview of the project's architecture, design patterns, and technical decisions.

## 📐 Architectural Overview

This project implements **Domain-Driven Design (DDD)** with **Hexagonal Architecture** (also known as Ports and Adapters), using **CQRS** and **Event-Driven** patterns.

## 🎯 Core Principles

### 1. Domain-Driven Design (DDD)

DDD helps us model complex business logic by focusing on the domain and domain logic.

#### Bounded Contexts

The application is divided into bounded contexts, each representing a distinct area of the business:

```
workspace/
└── src/context/
    ├── identity/      # Identity & Access Management context
    └── shared/        # Shared kernel (common primitives)
```

**Identity Context** handles:
- User account management
- External authentication (Clerk integration)
- Identity creation and management

#### Strategic Design Patterns

- **Ubiquitous Language**: Code uses the same terminology as domain experts
- **Context Mapping**: Clear boundaries between contexts
- **Shared Kernel**: Common domain primitives shared across contexts

### 2. Hexagonal Architecture

Also known as Ports and Adapters, this architecture separates the domain from external concerns.

```
┌───────────────────────────────────────────────────────┐
│                 Infrastructure Layer                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   HTTP/REST │  │  Persistence │  │  External   │  │
│  │ Controllers │  │ Repositories │  │  Services   │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────┬─────────────────────────────┘
                          │ Adapters
┌─────────────────────────▼─────────────────────────────┐
│                  Application Layer                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Use Cases  │  │    Event     │  │   Command   │  │
│  │             │  │   Handlers   │  │   Handlers  │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────┬─────────────────────────────┘
                          │ Ports
┌─────────────────────────▼─────────────────────────────┐
│                    Domain Layer                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Aggregates  │  │    Value     │  │   Domain    │  │
│  │  Entities   │  │   Objects    │  │   Events    │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  │
└───────────────────────────────────────────────────────┘
```

#### Layer Responsibilities

**Domain Layer** (Core):
- Contains business logic and rules
- Independent of frameworks and external systems
- Defines interfaces (ports) for external dependencies
- No dependencies on other layers

**Application Layer**:
- Orchestrates domain objects to fulfill use cases
- Handles application-specific logic
- Coordinates transactions and events
- Implements ports defined by domain

**Infrastructure Layer**:
- Implements adapters for external systems
- HTTP controllers, database repositories
- External service integrations
- Framework-specific code

### 3. CQRS (Command Query Responsibility Segregation)

Separates read and write operations for better scalability and clarity.

```typescript
// Command (Write)
class RegisterExternalAccountUseCase {
  async execute(email: string, externalId: string, provider: string) {
    // Modifies state
    const account = Account.create(/* ... */);
    await this.repository.save(account);
  }
}

// Query (Read)
class AccountRepository {
  async findByEmail(email: Email): Promise<Nullable<Account>> {
    // Only reads state
    return this.accounts.find(/* ... */);
  }
}
```

**Benefits**:
- Optimized read and write models
- Scalability (can scale reads and writes independently)
- Clarity (explicit intent for each operation)

### 4. Event-Driven Architecture

Domain events communicate state changes across the system.

```typescript
// Domain Event
export class IdentityCreatedDomainEvent extends DomainEvent {
  constructor(
    public readonly identityId: string,
    public readonly accountId: string,
  ) {
    super({ eventName: 'identity.created', aggregateId: identityId });
  }
}

// Event Handler
@EventsHandler(IdentityCreatedDomainEvent)
export class IdentityCreatedHandler implements IEventHandler<IdentityCreatedDomainEvent> {
  async handle(event: IdentityCreatedDomainEvent) {
    // React to the event
  }
}
```

**Benefits**:
- Loose coupling between components
- Asynchronous processing
- Event sourcing capabilities
- Audit trail

## 🏛️ Layer Details

### Domain Layer

The heart of the application, containing business logic.

#### Entities and Aggregates

**Aggregate**: A cluster of domain objects treated as a single unit.

```typescript
export class Account extends AggregateRoot {
  private constructor(
    public readonly id: AccountID,
    public readonly email: Email,
    private password: Password,
  ) {
    super();
  }

  static create(id: AccountID, email: Email, password: Password): Account {
    const account = new Account(id, email, password);
    account.record(new AccountCreatedDomainEvent(id.value, email.value));
    return account;
  }

  changePassword(oldPassword: string, newPassword: Password): void {
    this.password.compare(oldPassword);
    this.password = newPassword;
  }
}
```

**Key Characteristics**:
- Private constructor enforces creation through factory methods
- Invariants are always maintained
- Domain events are recorded for state changes
- Business logic is encapsulated

#### Value Objects

Immutable objects defined by their attributes.

```typescript
export class Email extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValidEmail(value);
  }

  private ensureIsValidEmail(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new InvalidArgumentError(`Invalid email: ${value}`);
    }
  }
}
```

**Key Characteristics**:
- Immutable (no setters)
- Self-validating (validation in constructor)
- Equality based on value, not identity
- No side effects

#### Domain Events

Events that represent something that happened in the domain.

```typescript
export class IdentityCreatedDomainEvent extends DomainEvent {
  static EVENT_NAME = 'identity.created';

  constructor(
    public readonly identityId: string,
    public readonly accountId: string,
  ) {
    super({
      eventName: IdentityCreatedDomainEvent.EVENT_NAME,
      aggregateId: identityId,
    });
  }

  toPrimitives() {
    return {
      identityId: this.identityId,
      accountId: this.accountId,
    };
  }
}
```

**Key Characteristics**:
- Past tense naming (something that happened)
- Immutable
- Contains all data needed by handlers
- Can be serialized (toPrimitives)

#### Repository Interfaces

Abstractions for data persistence.

```typescript
export interface AccountRepository {
  save(account: Account): Promise<void>;
  findById(id: AccountID): Promise<Nullable<Account>>;
  findByEmail(email: Email): Promise<Nullable<Account>>;
}
```

**Key Characteristics**:
- Defined in domain layer
- Implemented in infrastructure layer
- Use domain types (not DTOs)
- Return domain objects

### Application Layer

Orchestrates domain objects to fulfill use cases.

#### Use Cases

Application-specific business logic.

```typescript
export class RegisterExternalAccountUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly identityRepository: IdentityRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(
    email: string,
    externalId: string,
    provider: string,
  ): Promise<void> {
    // 1. Create value objects
    const emailVO = new Email(email);
    const providerVO = new Provider(provider as ProviderType);

    // 2. Check business rules
    const existingAccount = await this.accountRepository.findByEmail(emailVO);
    if (existingAccount) {
      throw new Error('Account already exists');
    }

    // 3. Create aggregates
    const accountId = AccountID.random();
    const account = Account.createWithoutPassword(accountId, emailVO);
    
    const identityId = IdentityID.random();
    const identity = Identity.create(identityId, accountId, externalId, providerVO);

    // 4. Persist
    await this.accountRepository.save(account);
    await this.identityRepository.save(identity);

    // 5. Publish events
    await this.eventBus.publishAll([
      ...account.pullDomainEvents(),
      ...identity.pullDomainEvents(),
    ]);
  }
}
```

**Key Characteristics**:
- Single responsibility (one use case)
- Coordinates domain objects
- Handles transactions
- Publishes domain events

#### Event Handlers

React to domain events.

```typescript
@EventsHandler(ExternalUserCreatedEvent)
export class ExternalUserCreatedHandler 
  implements IEventHandler<ExternalUserCreatedEvent> {
  
  constructor(
    private readonly registerExternalAccountUseCase: RegisterExternalAccountUseCase,
  ) {}

  async handle(event: ExternalUserCreatedEvent): Promise<void> {
    await this.registerExternalAccountUseCase.execute(
      event.email,
      event.externalId,
      event.provider,
    );
  }
}
```

**Key Characteristics**:
- Asynchronous processing
- Decoupled from event source
- Can trigger other use cases
- Idempotent when possible

### Infrastructure Layer

Implements technical details and external integrations.

#### HTTP Controllers

Handle HTTP requests and responses.

```typescript
@Controller('webhook/email')
export class EmailCreateEventWebhook {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {}

  @Post('register')
  register(@Req() req: Request, @Body() body: ClerkUserCreatedEvent): boolean {
    // 1. Verify webhook signature
    this.verifyWebhook(req);

    // 2. Handle event
    if (body.type === 'user.created') {
      const event = new ExternalUserCreatedEvent(
        body.data.id,
        body.data.email_addresses[0].email_address,
        'clerk',
      );
      this.eventBus.publish(event);
    }

    return true;
  }
}
```

**Key Characteristics**:
- Framework-specific code (NestJS decorators)
- Transforms HTTP to domain events
- Handles authentication/authorization
- Returns HTTP responses

#### Repository Implementations

Implement data persistence.

```typescript
@Injectable()
export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Account[] = [];

  async save(account: Account): Promise<void> {
    const index = this.accounts.findIndex(a => a.id.equals(account.id));
    if (index >= 0) {
      this.accounts[index] = account;
    } else {
      this.accounts.push(account);
    }
  }

  async findByEmail(email: Email): Promise<Nullable<Account>> {
    return this.accounts.find(a => a.email.equals(email)) ?? null;
  }
}
```

**Key Characteristics**:
- Implements domain interface
- Handles data mapping
- Manages connections
- Framework-specific (NestJS @Injectable)

#### Guards

Protect routes with authentication/authorization.

```typescript
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      await clerkClient.verifyToken(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

## 🔄 Data Flow

### Write Operation (Command)

```
HTTP Request
    ↓
Controller (Infrastructure)
    ↓
Use Case (Application)
    ↓
Aggregate (Domain)
    ↓
Repository (Infrastructure)
    ↓
Database
    ↓
Domain Events Published
    ↓
Event Handlers (Application)
```

### Read Operation (Query)

```
HTTP Request
    ↓
Controller (Infrastructure)
    ↓
Repository (Infrastructure)
    ↓
Database
    ↓
Domain Object
    ↓
HTTP Response
```

## 🎨 Design Patterns

### 1. Factory Pattern

Creating complex objects.

```typescript
class Account {
  static create(id: AccountID, email: Email, password: Password): Account {
    const account = new Account(id, email, password);
    account.record(new AccountCreatedDomainEvent(id.value, email.value));
    return account;
  }
}
```

### 2. Repository Pattern

Abstracting data access.

```typescript
interface AccountRepository {
  save(account: Account): Promise<void>;
  findById(id: AccountID): Promise<Nullable<Account>>;
}
```

### 3. Strategy Pattern

Value object validation.

```typescript
abstract class StringValueObject extends ValueObject<string> {
  protected abstract validate(value: string): void;
}
```

### 4. Observer Pattern

Event-driven communication.

```typescript
// Publisher
aggregate.record(new DomainEvent());

// Subscriber
@EventsHandler(DomainEvent)
class Handler implements IEventHandler<DomainEvent> {
  async handle(event: DomainEvent) { }
}
```

## 📦 Module Organization

### NestJS Modules

```typescript
@Module({
  imports: [CqrsModule],
  controllers: [EmailCreateEventWebhook],
  providers: [
    // Use Cases
    RegisterExternalAccountUseCase,
    
    // Repositories
    { provide: 'AccountRepository', useClass: InMemoryAccountRepository },
    
    // Event Handlers
    ExternalUserCreatedHandler,
    IdentityCreatedHandler,
    
    // Infrastructure
    ClerkAuthGuard,
    NestCqrsEventBus,
  ],
})
export class IdentityModule {}
```

**Organization**:
- One module per bounded context
- Shared module for common functionality
- Clear provider organization by type

## 🔐 Security Considerations

### Authentication

- JWT tokens verified via Clerk
- ClerkAuthGuard protects routes
- Webhook signature verification

### Authorization

- Guard-based route protection
- Domain-level access control
- Event-based audit trail

### Data Validation

- Value objects validate on construction
- Input validation at controller level
- Type safety via TypeScript

## 🚀 Performance Considerations

### CQRS Benefits

- Separate read/write optimization
- Scalable read replicas
- Optimized query models

### Event-Driven Benefits

- Asynchronous processing
- Non-blocking operations
- Horizontal scalability

### In-Memory Repository

- Fast for development/testing
- Easy to swap for production DB
- Clear interface contract

## 🧪 Testing Strategy

### Unit Tests

Test each layer in isolation:

```typescript
// Domain
describe('Email', () => {
  it('should validate email format', () => {
    expect(() => new Email('invalid')).toThrow();
  });
});

// Application
describe('RegisterExternalAccountUseCase', () => {
  it('should create account and identity', async () => {
    // Mock repositories
    // Execute use case
    // Verify interactions
  });
});

// Infrastructure
describe('EmailCreateEventWebhook', () => {
  it('should publish event on user creation', () => {
    // Mock dependencies
    // Call controller
    // Verify event published
  });
});
```

### Integration Tests

Test layer interactions:

```typescript
describe('Account Registration Flow', () => {
  it('should register external account end-to-end', async () => {
    // Setup test module
    // Call webhook
    // Verify account created
    // Verify events published
  });
});
```

## 📚 Further Reading

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://vaughnvernon.com/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

---

This architecture enables:
- ✅ Maintainability through clear separation of concerns
- ✅ Testability with isolated, mockable components
- ✅ Scalability via CQRS and event-driven patterns
- ✅ Flexibility to swap implementations
- ✅ Business logic clarity in domain layer
