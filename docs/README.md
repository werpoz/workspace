# Documentation Index

Welcome to the Workspace project documentation! This index will help you find the information you need.

## 📚 Documentation Structure

### Getting Started

- **[README.md](../README.md)** - Project overview, quick start guide, and basic information
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - How to contribute to the project
- **[CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)** - Community guidelines and standards

### Technical Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
  - Domain-Driven Design principles
  - Hexagonal Architecture
  - CQRS and Event-Driven patterns
  - Layer responsibilities
  - Design patterns used

- **[EMAIL_VERIFICATION.md](./EMAIL_VERIFICATION.md)** - Email Verification System details
  - Architecture and flow
  - API Endpoints
  - Configuration

- **[TESTING.md](./TESTING.md)** - Testing guide and best practices
  - Testing philosophy
  - Test types (unit, integration, e2e)
  - Writing tests
  - Coverage requirements
  - Common patterns

## 🎯 Quick Links by Role

### New Contributors

1. Start with [README.md](../README.md) for project overview
2. Read [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) for community standards
3. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution workflow
4. Review [TESTING.md](./TESTING.md) for testing requirements

### Developers

1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system design
2. [TESTING.md](./TESTING.md) - Learn testing strategies
3. [CONTRIBUTING.md](../CONTRIBUTING.md) - Follow coding standards

### Architects

1. [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
2. [README.md](../README.md) - Technology stack and patterns

## 📖 Documentation by Topic

### Architecture & Design

- [Domain-Driven Design](./ARCHITECTURE.md#domain-driven-design)
- [Hexagonal Architecture](./ARCHITECTURE.md#hexagonal-architecture)
- [CQRS Pattern](./ARCHITECTURE.md#cqrs-command-query-responsibility-segregation)
- [Event-Driven Architecture](./ARCHITECTURE.md#event-driven-architecture)
- [Design Patterns](./ARCHITECTURE.md#design-patterns)

### Development

- [Quick Start](../README.md#quick-start)
- [Project Structure](../README.md#project-structure)
- [Development Workflow](../CONTRIBUTING.md#development-workflow)
- [Coding Standards](../CONTRIBUTING.md#coding-standards)
- [Naming Conventions](../CONTRIBUTING.md#naming-conventions)

### Testing

- [Testing Philosophy](./TESTING.md#testing-philosophy)
- [Unit Tests](./TESTING.md#unit-tests)
- [Integration Tests](./TESTING.md#integration-tests)
- [E2E Tests](./TESTING.md#e2e-tests)
- [Coverage Requirements](./TESTING.md#coverage-requirements)
- [Best Practices](./TESTING.md#best-practices)

### Contributing

- [Getting Started](../CONTRIBUTING.md#getting-started)
- [Development Workflow](../CONTRIBUTING.md#development-workflow)
- [Pull Request Process](../CONTRIBUTING.md#pull-request-process)
- [Code of Conduct](../CODE_OF_CONDUCT.md)

## 🔍 Common Questions

### How do I get started?

1. Read the [README.md](../README.md)
2. Follow the [Quick Start](../README.md#quick-start) guide
3. Review [CONTRIBUTING.md](../CONTRIBUTING.md)

### How is the project structured?

See [Project Structure](../README.md#project-structure) and [Architecture Overview](./ARCHITECTURE.md#architectural-overview)

### What are the coding standards?

See [Coding Standards](../CONTRIBUTING.md#coding-standards) in CONTRIBUTING.md

### How do I write tests?

See [TESTING.md](./TESTING.md) for comprehensive testing guide

### What is the architecture?

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation

### How do I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the complete contribution guide

## 🛠️ Development Resources

### Commands Reference

```bash
# Development
pnpm install          # Install dependencies
pnpm run start:dev    # Start development server
pnpm run build        # Build for production

# Testing
pnpm run test         # Run tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:cov     # Run tests with coverage

# Code Quality
pnpm run lint         # Lint code
pnpm run format       # Format code
```

### File Naming Conventions

- Value Objects: `*.vo.ts` (e.g., `Email.vo.ts`)
- Domain Events: `*DomainEvent.ts` (e.g., `IdentityCreatedDomainEvent.ts`)
- Use Cases: `*UseCase.ts` (e.g., `RegisterExternalAccountUseCase.ts`)
- Handlers: `*Handler.ts` (e.g., `ExternalUserCreatedHandler.ts`)
- Tests: `*.spec.ts` (e.g., `Email.vo.spec.ts`)

### Project Layers

```
src/context/
├── identity/
│   ├── domain/         # Business logic and rules
│   ├── application/    # Use cases and handlers
│   └── infrastructure/ # HTTP, persistence, external services
└── shared/
    ├── domain/         # Shared domain primitives
    └── infrastructure/ # Shared infrastructure
```

## 📝 Documentation Standards

When updating documentation:

1. **Keep it current**: Update docs when code changes
2. **Be clear**: Write for your audience
3. **Use examples**: Show, don't just tell
4. **Link related docs**: Help readers navigate
5. **Follow formatting**: Use consistent markdown style

## 🤝 Contributing to Documentation

Documentation improvements are always welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to submit changes.

When contributing documentation:

- Use clear, concise language
- Include code examples where helpful
- Update this index if adding new documents
- Follow markdown best practices
- Test all code examples

## 📚 External Resources

### NestJS
- [Official Documentation](https://docs.nestjs.com/)
- [Testing Guide](https://docs.nestjs.com/fundamentals/testing)

### Domain-Driven Design
- [DDD Reference](https://www.domainlanguage.com/ddd/)
- [Martin Fowler's DDD](https://martinfowler.com/tags/domain%20driven%20design.html)

### Architecture Patterns
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Need help?** Open an issue or discussion on GitHub!
