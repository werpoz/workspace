# Testing Guide

This guide covers testing strategies, best practices, and guidelines for maintaining 100% test coverage in this project.

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## 🎯 Testing Philosophy

### Core Principles

1. **100% Coverage**: All code must be tested
2. **Test Behavior, Not Implementation**: Focus on what code does, not how
3. **Arrange-Act-Assert**: Clear test structure
4. **Independence**: Tests should not depend on each other
5. **Fast Execution**: Tests should run quickly
6. **Readable**: Tests are documentation

### Testing Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  ← Few, slow, high confidence
        ├─────────────┤
        │ Integration │  ← Some, medium speed
        │    Tests    │
        ├─────────────┤
        │    Unit     │  ← Many, fast, focused
        │    Tests    │
        └─────────────┘
```

## 🧪 Test Types

### 1. Unit Tests

Test individual components in isolation.

**Location**: `test/` directory, mirroring `src/` structure

**Characteristics**:
- Fast execution
- Mock all dependencies
- Test one thing at a time
- No external dependencies (DB, network, etc.)

**Example**:
```typescript
describe('Email', () => {
  it('should create valid email', () => {
    const email = new Email('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('should reject invalid email format', () => {
    expect(() => new Email('invalid')).toThrow(InvalidArgumentError);
  });
});
```

### 2. Integration Tests

Test interactions between components.

**Characteristics**:
- Test multiple layers together
- May use real implementations
- Test component interactions
- Verify integration points

**Example**:
```typescript
describe('RegisterExternalAccountUseCase', () => {
  let useCase: RegisterExternalAccountUseCase;
  let accountRepository: AccountRepository;
  let identityRepository: IdentityRepository;

  beforeEach(() => {
    accountRepository = new InMemoryAccountRepository();
    identityRepository = new InMemoryIdentityRepository();
    useCase = new RegisterExternalAccountUseCase(
      accountRepository,
      identityRepository,
      eventBus,
    );
  });

  it('should create account and identity', async () => {
    await useCase.execute('test@example.com', 'ext_123', 'clerk');
    
    const account = await accountRepository.findByEmail(
      new Email('test@example.com')
    );
    expect(account).toBeDefined();
  });
});
```

### 3. E2E Tests

Test complete user flows through HTTP endpoints.

**Location**: `test/` with `jest-e2e.json` config

**Characteristics**:
- Test full application stack
- Use real HTTP requests
- Test user scenarios
- Slowest but highest confidence

**Example**:
```typescript
describe('Webhook Registration (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/webhook/email/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/webhook/email/register')
      .send({
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
        },
      })
      .expect(201);
  });
});
```

## 📝 Test Structure

### AAA Pattern

All tests should follow the **Arrange-Act-Assert** pattern:

```typescript
it('should do something', () => {
  // Arrange: Setup test data and dependencies
  const input = 'test';
  const expected = 'result';

  // Act: Execute the code under test
  const result = service.doSomething(input);

  // Assert: Verify the outcome
  expect(result).toBe(expected);
});
```

### Test Organization

```typescript
describe('ComponentName', () => {
  // Shared setup
  let component: Component;
  let dependency: Dependency;

  beforeEach(() => {
    // Initialize before each test
    dependency = createMockDependency();
    component = new Component(dependency);
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

## ✍️ Writing Tests

### Domain Layer Tests

#### Value Objects

```typescript
describe('Email', () => {
  it('should create valid email', () => {
    const email = new Email('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('should reject invalid email', () => {
    expect(() => new Email('invalid')).toThrow(InvalidArgumentError);
    expect(() => new Email('')).toThrow(InvalidArgumentError);
    expect(() => new Email('test@')).toThrow(InvalidArgumentError);
  });

  it('should compare emails by value', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });
});
```

#### Aggregates

```typescript
describe('Account', () => {
  it('should create account with password', () => {
    const id = AccountID.random();
    const email = new Email('test@example.com');
    const password = new Password('SecurePass123!');

    const account = Account.create(id, email, password);

    expect(account.id).toBe(id);
    expect(account.email).toBe(email);
  });

  it('should record domain event on creation', () => {
    const account = Account.create(/* ... */);
    const events = account.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AccountCreatedDomainEvent);
  });

  it('should change password with valid old password', () => {
    const account = Account.create(/* ... */);
    const newPassword = new Password('NewPass123!');

    expect(() => 
      account.changePassword('SecurePass123!', newPassword)
    ).not.toThrow();
  });

  it('should reject password change with invalid old password', () => {
    const account = Account.create(/* ... */);
    const newPassword = new Password('NewPass123!');

    expect(() => 
      account.changePassword('WrongPass', newPassword)
    ).toThrow();
  });
});
```

### Application Layer Tests

#### Use Cases

```typescript
describe('RegisterExternalAccountUseCase', () => {
  let useCase: RegisterExternalAccountUseCase;
  let accountRepository: jest.Mocked<AccountRepository>;
  let identityRepository: jest.Mocked<IdentityRepository>;
  let eventBus: jest.Mocked<DomainEventBus>;

  beforeEach(() => {
    accountRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    identityRepository = {
      save: jest.fn(),
    } as any;

    eventBus = {
      publishAll: jest.fn(),
    } as any;

    useCase = new RegisterExternalAccountUseCase(
      accountRepository,
      identityRepository,
      eventBus,
    );
  });

  it('should create account and identity', async () => {
    accountRepository.findByEmail.mockResolvedValue(null);

    await useCase.execute('test@example.com', 'ext_123', 'clerk');

    expect(accountRepository.save).toHaveBeenCalledWith(
      expect.any(Account)
    );
    expect(identityRepository.save).toHaveBeenCalledWith(
      expect.any(Identity)
    );
    expect(eventBus.publishAll).toHaveBeenCalled();
  });

  it('should throw if account already exists', async () => {
    const existingAccount = Account.createWithoutPassword(/* ... */);
    accountRepository.findByEmail.mockResolvedValue(existingAccount);

    await expect(
      useCase.execute('test@example.com', 'ext_123', 'clerk')
    ).rejects.toThrow('Account already exists');
  });
});
```

#### Event Handlers

```typescript
describe('ExternalUserCreatedHandler', () => {
  let handler: ExternalUserCreatedHandler;
  let useCase: jest.Mocked<RegisterExternalAccountUseCase>;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as any;

    handler = new ExternalUserCreatedHandler(useCase);
  });

  it('should call use case with event data', async () => {
    const event = new ExternalUserCreatedEvent(
      'ext_123',
      'test@example.com',
      'clerk',
    );

    await handler.handle(event);

    expect(useCase.execute).toHaveBeenCalledWith(
      'test@example.com',
      'ext_123',
      'clerk',
    );
  });
});
```

### Infrastructure Layer Tests

#### Controllers

```typescript
describe('EmailCreateEventWebhook', () => {
  let controller: EmailCreateEventWebhook;
  let eventBus: jest.Mocked<EventBus>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [EmailCreateEventWebhook],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('secret'),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailCreateEventWebhook>(EmailCreateEventWebhook);
    eventBus = module.get(EventBus);
    configService = module.get(ConfigService);
  });

  it('should publish event on user creation', () => {
    const req = {
      headers: {
        'svix-id': 'id',
        'svix-signature': 'sig',
        'svix-timestamp': 'ts',
      },
      rawBody: Buffer.from('body'),
    } as any;

    const body = {
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'test@example.com' }],
      },
    } as any;

    controller.register(req, body);

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(ExternalUserCreatedEvent)
    );
  });
});
```

#### Guards

```typescript
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  // ... test setup
});  expect(result).toBe(true);
  });

  it('should deny access without token', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as any;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
```

## 🏃 Running Tests

### Commands

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov

# Run specific test file
pnpm run test -- Email.vo.spec.ts

# Run tests matching pattern
pnpm run test -- --testNamePattern="should create valid email"

# Run e2e tests
pnpm run test:e2e

# Debug tests
pnpm run test:debug
```

### Watch Mode

```bash
# Start watch mode
pnpm run test:watch

# Press 'p' to filter by filename
# Press 't' to filter by test name
# Press 'a' to run all tests
# Press 'q' to quit
```

## 📊 Coverage Requirements

### Thresholds

We maintain **100% coverage** across all metrics:

```json
{
  "coverageThreshold": {
    "global": {
      "statements": 100,
      "branches": 100,
      "functions": 100,
      "lines": 100
    }
  }
}
```

### Viewing Coverage

```bash
# Generate coverage report
pnpm run test:cov

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Report

```
---------------------------------------------|---------|----------|---------|---------|
File                                         | % Stmts | % Branch | % Funcs | % Lines |
---------------------------------------------|---------|----------|---------|---------|
All files                                    |     100 |      100 |     100 |     100 |
 identity/domain/value-object                |     100 |      100 |     100 |     100 |
  Email.vo.ts                                |     100 |      100 |     100 |     100 |
  AccountID.vo.ts                            |     100 |      100 |     100 |     100 |
---------------------------------------------|---------|----------|---------|---------|
```

## ✅ Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// ❌ Bad
it('test email', () => { });

// ✅ Good
it('should reject email with invalid format', () => { });
it('should create email with valid format', () => { });
```

### 2. One Assertion Per Test

Focus each test on a single behavior:

```typescript
// ❌ Bad
it('should handle email', () => {
  const email = new Email('test@example.com');
  expect(email.value).toBe('test@example.com');
  expect(email.equals(new Email('test@example.com'))).toBe(true);
  expect(() => new Email('invalid')).toThrow();
});

// ✅ Good
it('should store email value', () => {
  const email = new Email('test@example.com');
  expect(email.value).toBe('test@example.com');
});

it('should compare emails by value', () => {
  const email1 = new Email('test@example.com');
  const email2 = new Email('test@example.com');
  expect(email1.equals(email2)).toBe(true);
});

it('should reject invalid email format', () => {
  expect(() => new Email('invalid')).toThrow();
});
```

### 3. Test Edge Cases

Always test boundary conditions:

```typescript
describe('Password', () => {
  it('should accept minimum length password', () => {
    expect(() => new Password('Pass123!')).not.toThrow();
  });

  it('should reject too short password', () => {
    expect(() => new Password('Pass1!')).toThrow();
  });

  it('should accept maximum length password', () => {
    const longPassword = 'P'.repeat(50) + '123!';
    expect(() => new Password(longPassword)).not.toThrow();
  });

  it('should reject too long password', () => {
    const tooLong = 'P'.repeat(51) + '123!';
    expect(() => new Password(tooLong)).toThrow();
  });
});
```

### 4. Use Test Doubles Appropriately

- **Stub**: Provides predetermined responses
- **Mock**: Verifies interactions
- **Spy**: Records calls for later verification
- **Fake**: Working implementation (e.g., InMemoryRepository)

```typescript
// Stub
const stub = {
  findByEmail: jest.fn().mockResolvedValue(null),
};

// Mock
const mock = {
  save: jest.fn(),
};
expect(mock.save).toHaveBeenCalledWith(account);

// Spy
const spy = jest.spyOn(service, 'method');
expect(spy).toHaveBeenCalled();

// Fake
const fake = new InMemoryAccountRepository();
```

### 5. Avoid Test Interdependence

Tests should be independent and runnable in any order:

```typescript
// ❌ Bad - Tests depend on execution order
describe('AccountRepository', () => {
  let account: Account;

  it('should save account', async () => {
    account = Account.create(/* ... */);
    await repository.save(account);
  });

  it('should find saved account', async () => {
    const found = await repository.findById(account.id);
    expect(found).toBeDefined();
  });
});

// ✅ Good - Each test is independent
describe('AccountRepository', () => {
  it('should save account', async () => {
    const account = Account.create(/* ... */);
    await repository.save(account);
    
    const found = await repository.findById(account.id);
    expect(found).toBeDefined();
  });

  it('should find saved account', async () => {
    const account = Account.create(/* ... */);
    await repository.save(account);
    
    const found = await repository.findById(account.id);
    expect(found).toBeDefined();
  });
});
```

## 🔧 Common Patterns

### Testing Exceptions

```typescript
it('should throw specific error', () => {
  expect(() => new Email('invalid')).toThrow(InvalidArgumentError);
  expect(() => new Email('invalid')).toThrow('Invalid email');
});

it('should throw async error', async () => {
  await expect(useCase.execute(/* ... */)).rejects.toThrow();
});
```

### Testing Async Code

```typescript
it('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});

it('should handle promise rejection', async () => {
  await expect(service.failingMethod()).rejects.toThrow();
});
```

### Testing Events

```typescript
it('should record domain event', () => {
  const account = Account.create(/* ... */);
  const events = account.pullDomainEvents();

  expect(events).toHaveLength(1);
  expect(events[0]).toBeInstanceOf(AccountCreatedDomainEvent);
  expect(events[0].aggregateId).toBe(account.id.value);
});

it('should publish events', async () => {
  await useCase.execute(/* ... */);

  expect(eventBus.publishAll).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.any(AccountCreatedDomainEvent),
      expect.any(IdentityCreatedDomainEvent),
    ])
  );
});
```

### Testing with NestJS

```typescript
describe('Controller', () => {
  let controller: Controller;
  let service: Service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [Controller],
      providers: [
        {
          provide: Service,
          useValue: {
            method: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<Controller>(Controller);
    service = module.get<Service>(Service);
  });

  it('should call service', () => {
    controller.endpoint();
    expect(service.method).toHaveBeenCalled();
  });
});
```

## 🐛 Debugging Tests

### Using VS Code Debugger

1. Set breakpoints in test file
2. Run "Debug Jest Tests" configuration
3. Step through code

### Using Console

```typescript
it('should debug test', () => {
  const value = someFunction();
  console.log('Debug value:', value);
  expect(value).toBe(expected);
});
```

### Isolating Tests

```typescript
// Run only this test
it.only('should run only this test', () => {
  // ...
});

// Skip this test
it.skip('should skip this test', () => {
  // ...
});
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing NestJS Applications](https://docs.nestjs.com/fundamentals/testing)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

Remember: **Good tests are documentation**. They explain how the code should behave and serve as examples for future developers.
