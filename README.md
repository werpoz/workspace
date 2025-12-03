# Workspace - NestJS DDD Project

A production-ready NestJS application built with Domain-Driven Design (DDD) and Hexagonal Architecture principles, featuring custom authentication with email verification and comprehensive test coverage.

## 🏗️ Architecture

This project follows **Domain-Driven Design (DDD)** and **Hexagonal Architecture** patterns:

```
src/
└── context/
    ├── identity/           # Identity Bounded Context
    │   ├── domain/         # Domain layer (entities, value objects, events)
    │   ├── application/    # Application layer (use cases, handlers)
    │   └── infrastructure/ # Infrastructure layer (HTTP, persistence)
    └── shared/             # Shared kernel
        ├── domain/         # Shared domain primitives
        └── infrastructure/ # Shared infrastructure
```

### Key Architectural Patterns

- **CQRS (Command Query Responsibility Segregation)**: Separates read and write operations
- **Event-Driven Architecture**: Domain events for decoupled communication
- **Dependency Injection**: NestJS IoC container for loose coupling
- **Repository Pattern**: Abstraction over data persistence
- **Value Objects**: Immutable domain primitives with validation
- **Email Verification**: Robust verification system with code/link support and expiration logic

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

### Environment Variables

```env
PORT=3000
JWT_SECRET=your_jwt_secret
EMAIL_PROVIDER=test
```

### Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

## 🧪 Testing

We maintain **100% test coverage** across the codebase.

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage report
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e
```

### Test Coverage

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

## 📁 Project Structure

```
workspace/
├── src/
│   ├── context/
│   │   ├── identity/
│   │   │   ├── domain/
│   │   │   │   ├── value-object/     # Value objects (Email, Password, etc.)
│   │   │   │   ├── events/           # Domain events
│   │   │   │   ├── interface/        # Repository interfaces
│   │   │   │   ├── Account.ts        # Account aggregate
│   │   │   │   └── Identity.ts       # Identity aggregate
│   │   │   ├── application/
│   │   │   │   ├── handlers/         # Event handlers
│   │   │   │   ├── events/           # Application events
│   │   │   │   └── *.UseCase.ts      # Use cases
│   │   │   └── infrastructure/
│   │   │       ├── http/             # Controllers, guards, webhooks
│   │   │       └── persistence/      # Repository implementations
│   │   └── shared/
│   │       ├── domain/               # Shared domain primitives
│   │       └── infrastructure/       # Shared infrastructure
│   ├── app.module.ts
│   └── main.ts
├── test/                             # Mirror of src/ for unit tests
├── .env.example
├── package.json
└── README.md
```

## 🛠️ Development

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
pnpm run format

# Lint and fix
pnpm run lint
```

### Naming Conventions

- **Value Objects**: Use `.vo.ts` suffix (e.g., `Email.vo.ts`, `AccountID.vo.ts`)
- **Domain Events**: Use `*DomainEvent.ts` suffix (e.g., `IdentityCreatedDomainEvent.ts`)
- **Use Cases**: Use `*UseCase.ts` suffix (e.g., `RegisterExternalAccountUseCase.ts`)
- **Handlers**: Use `*Handler.ts` suffix (e.g., `ExternalUserCreatedHandler.ts`)
- **Tests**: Use `.spec.ts` suffix, mirroring the source structure

### Adding a New Feature

1. **Domain Layer**: Define entities, value objects, and domain events
2. **Application Layer**: Create use cases and event handlers
3. **Infrastructure Layer**: Implement controllers, repositories, and external integrations
4. **Tests**: Write comprehensive unit tests for each layer

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 🔐 Authentication
 
 This project uses a custom authentication system with:
 
 - **JWT Strategy**: Protects routes with JWT verification
 - **Email Verification**: Ensures account validity via 6-digit codes
 - **Secure Password Hashing**: Uses bcrypt for password security
 - **Event-Driven Registration**: Decoupled registration and verification flows

## 📚 Key Concepts

### Domain-Driven Design

- **Bounded Contexts**: Logical boundaries for different parts of the system (e.g., Identity)
- **Aggregates**: Clusters of domain objects treated as a single unit (e.g., Account, Identity)
- **Value Objects**: Immutable objects defined by their attributes (e.g., Email, Password)
- **Domain Events**: Events that represent something that happened in the domain

### CQRS

- **Commands**: Operations that change state (handled by use cases)
- **Queries**: Operations that read state (handled by repositories)
- **Event Bus**: Publishes domain events for asynchronous processing

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code of Conduct
- Development workflow
- Pull request process
- Coding standards
- Testing requirements

## 📖 Additional Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed architecture documentation
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Testing Guide](./docs/TESTING.md) - Testing strategies and best practices

## 🐛 Debugging

```bash
# Debug mode
pnpm run start:debug

# Debug tests
pnpm run test:debug
```

## 📦 Building for Production

```bash
# Build the application
pnpm run build

# Run production build
pnpm run start:prod
```

## 📄 License

This project is [UNLICENSED](LICENSE).

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Jest](https://jestjs.io/) - Testing framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

---

For questions or support, please open an issue on GitHub.
