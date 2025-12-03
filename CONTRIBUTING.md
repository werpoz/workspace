# Contributing to Workspace

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Project Architecture](#project-architecture)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility for mistakes

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling or insulting comments
- Publishing others' private information
- Any conduct that could be considered inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/workspace.git
cd workspace
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/workspace.git
```

### Setup Development Environment

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables in .env
```

### Verify Setup

```bash
# Run tests to ensure everything works
pnpm run test

# Start development server
pnpm run start:dev
```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### 2. Make Your Changes

Follow the [Coding Standards](#coding-standards) section below.

### 3. Write Tests

All new code must include tests. We maintain 100% test coverage.

```bash
# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:cov
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new user registration feature"
git commit -m "fix: resolve authentication bug"
git commit -m "docs: update contributing guidelines"
git commit -m "test: add tests for email validation"
```

Commit message format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push Your Changes

```bash
git push origin feature/your-feature-name
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Use type aliases for unions and complex types

### Naming Conventions

#### Files
- **Value Objects**: `*.vo.ts` (e.g., `Email.vo.ts`, `AccountID.vo.ts`)
- **Domain Events**: `*DomainEvent.ts` (e.g., `IdentityCreatedDomainEvent.ts`)
- **Use Cases**: `*UseCase.ts` (e.g., `RegisterExternalAccountUseCase.ts`)
- **Handlers**: `*Handler.ts` (e.g., `ExternalUserCreatedHandler.ts`)
- **Tests**: `*.spec.ts` (e.g., `Email.vo.spec.ts`)

#### Code
- **Classes**: PascalCase (e.g., `RegisterExternalAccountUseCase`)
- **Interfaces**: PascalCase (e.g., `AccountRepository`)
- **Variables/Functions**: camelCase (e.g., `registerAccount`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PASSWORD_LENGTH`)
- **Private members**: prefix with `private` keyword

### Code Organization

#### Domain Layer
```typescript
// Value Objects - Immutable, self-validating
export class Email extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValidEmail(value);
  }
}

// Aggregates - Business logic and invariants
export class Account extends AggregateRoot {
  private constructor(
    public readonly id: AccountID,
    public readonly email: Email,
    private password: Password,
  ) {
    super();
  }
}
```

#### Application Layer
```typescript
// Use Cases - Application logic
export class RegisterExternalAccountUseCase {
  async execute(email: string, externalId: string, provider: string) {
    // Use case implementation
  }
}

// Event Handlers - React to domain events
@EventsHandler(ExternalUserCreatedEvent)
export class ExternalUserCreatedHandler {
  async handle(event: ExternalUserCreatedEvent) {
    // Handler implementation
  }
}
```

#### Infrastructure Layer
```typescript
// Controllers - HTTP endpoints
@Controller('webhook/email')
export class EmailCreateEventWebhook {
  @Post('register')
  register(@Req() req: Request, @Body() body: ClerkUserCreatedEvent) {
    // Controller implementation
  }
}

// Repositories - Data persistence
export class InMemoryAccountRepository implements AccountRepository {
  async save(account: Account): Promise<void> {
    // Repository implementation
  }
}
```

### Code Style

We use ESLint and Prettier:

```bash
# Format code
pnpm run format

# Lint and fix
pnpm run lint
```

### Best Practices

1. **Single Responsibility**: Each class/function should have one reason to change
2. **Dependency Inversion**: Depend on abstractions, not concretions
3. **Immutability**: Prefer immutable data structures (especially value objects)
4. **Pure Functions**: Avoid side effects when possible
5. **Error Handling**: Use proper error types and handle errors explicitly
6. **Documentation**: Add JSDoc comments for public APIs

## 🧪 Testing Requirements

### Test Coverage

We maintain **100% test coverage**. All new code must include tests.

### Test Structure

```typescript
describe('FeatureName', () => {
  // Setup
  let service: ServiceUnderTest;
  
  beforeEach(async () => {
    // Initialize test dependencies
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = service.doSomething(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  it('should handle error cases', () => {
    // Test error scenarios
  });
});
```

### Test Types

1. **Unit Tests**: Test individual components in isolation
   - Located in `test/` directory, mirroring `src/` structure
   - Mock all dependencies
   - Fast execution

2. **Integration Tests**: Test component interactions
   - Test multiple layers working together
   - Use real implementations where appropriate

3. **E2E Tests**: Test complete user flows
   - Located in `test/` with `jest-e2e.json` config
   - Test HTTP endpoints

### Running Tests

```bash
# All tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:cov

# E2E tests
pnpm run test:e2e

# Debug tests
pnpm run test:debug
```

### Test Checklist

- [ ] All new code has unit tests
- [ ] Edge cases are tested
- [ ] Error scenarios are tested
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Tests are independent and can run in any order
- [ ] Coverage remains at 100%

## 🔍 Pull Request Process

### Before Submitting

1. **Run all checks**:
```bash
pnpm run lint
pnpm run test:cov
pnpm run build
```

2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Update CHANGELOG** if applicable

### PR Title

Follow conventional commits format:
```
feat: add user profile management
fix: resolve authentication token expiration
docs: update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Coverage maintained at 100%

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. Automated checks must pass (tests, linting)
2. At least one maintainer approval required
3. All review comments must be addressed
4. Branch must be up to date with main

### After Approval

1. Squash commits if requested
2. Maintainer will merge the PR
3. Delete your branch after merge

## 🏗️ Project Architecture

### Domain-Driven Design

This project follows DDD principles:

1. **Bounded Contexts**: Separate domains (e.g., Identity)
2. **Aggregates**: Consistency boundaries (e.g., Account, Identity)
3. **Value Objects**: Immutable domain primitives
4. **Domain Events**: Communicate state changes
5. **Repositories**: Abstract data access

### Hexagonal Architecture

```
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │
│  (HTTP, Database, External Services)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Application Layer               │
│    (Use Cases, Event Handlers)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Domain Layer                  │
│  (Entities, Value Objects, Events)      │
└─────────────────────────────────────────┘
```

### Adding a New Feature

1. **Domain Layer**:
   - Define value objects in `domain/value-object/`
   - Create entities/aggregates in `domain/`
   - Define domain events in `domain/events/`

2. **Application Layer**:
   - Create use cases in `application/`
   - Add event handlers in `application/handlers/`

3. **Infrastructure Layer**:
   - Add controllers in `infrastructure/http/`
   - Implement repositories in `infrastructure/persistence/`

4. **Tests**:
   - Mirror structure in `test/` directory
   - Maintain 100% coverage

## 💡 Tips for Contributors

### Finding Issues to Work On

- Look for issues labeled `good first issue`
- Check issues labeled `help wanted`
- Ask in discussions if you need guidance

### Getting Help

- Open a discussion for questions
- Join our community chat (if available)
- Tag maintainers in your PR if stuck

### Common Pitfalls

1. **Not following DDD principles**: Keep domain logic in domain layer
2. **Mixing concerns**: Separate infrastructure from domain
3. **Insufficient tests**: Maintain 100% coverage
4. **Breaking changes**: Discuss major changes first
5. **Large PRs**: Keep PRs focused and small

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

## 🙏 Thank You!

Your contributions make this project better. We appreciate your time and effort!

---

If you have questions about contributing, please open a discussion or issue.
