import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/context/identity/application/service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AccountRepository } from 'src/context/identity/domain/interface/AccountRepository';
import { Account } from 'src/context/identity/domain/Account';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';

describe('AuthService', () => {
  let service: AuthService;
  let accountRepository: AccountRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'AccountRepository',
          useValue: {
            searchByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: 'DomainEventBus',
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountRepository = module.get<AccountRepository>('AccountRepository');
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    let eventBus: any;

    beforeEach(() => {
      eventBus = {
        publishAll: jest.fn(),
      };
      (service as any).eventBus = eventBus;
      (accountRepository as any).save = jest.fn();
    });

    it('should create a new account successfully', async () => {
      jest.spyOn(accountRepository, 'searchByEmail').mockResolvedValue(null);

      const result = await service.register(
        'newuser@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('newuser@example.com');
      expect(result.isActive).toBe(false);
      expect(accountRepository.searchByEmail).toHaveBeenCalledWith(
        'newuser@example.com',
      );
      expect((accountRepository as any).save).toHaveBeenCalled();
      expect(eventBus.publishAll).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already exists', async () => {
      const existingAccount = Account.fromPrimitives({
        id: '123',
        email: 'existing@example.com',
        password: 'hashedpassword123',
        isActive: true,
      });

      jest
        .spyOn(accountRepository, 'searchByEmail')
        .mockResolvedValue(existingAccount);

      await expect(
        service.register('existing@example.com', 'password123'),
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('validateAccount', () => {
    it('should return null when account is not found', async () => {
      jest.spyOn(accountRepository, 'searchByEmail').mockResolvedValue(null);

      const result = await service.validateAccount(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException when account is not active', async () => {
      const accountId = new AccountID('123e4567-e89b-12d3-a456-426614174000');
      const email = new Email('test@example.com');
      const plainPassword = new Password('password123');
      const hashedPassword = await plainPassword.hash();

      const inactiveAccount = Account.fromPrimitives({
        id: accountId.value,
        password: hashedPassword,
        email: email.value,
        isActive: false, // Inactive account
      });

      jest
        .spyOn(accountRepository, 'searchByEmail')
        .mockResolvedValue(inactiveAccount);

      await expect(
        service.validateAccount('test@example.com', 'password123'),
      ).rejects.toThrow('Esta cuenta no está activa.');
    });

    it('should throw UnauthorizedException when account has no password', async () => {
      const accountId = new AccountID('123e4567-e89b-12d3-a456-426614174000');
      const email = new Email('test@example.com');
      const account = Account.createExternal(accountId, email);

      jest.spyOn(accountRepository, 'searchByEmail').mockResolvedValue(account);

      await expect(
        service.validateAccount('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user data when password matches', async () => {
      const accountId = new AccountID('123e4567-e89b-12d3-a456-426614174000');
      const email = new Email('test@example.com');
      const plainPassword = new Password('password123');
      const hashedPassword = await plainPassword.hash();

      const account = Account.fromPrimitives({
        id: accountId.value,
        password: hashedPassword,
        email: email.value,
        isActive: true,
      });

      jest.spyOn(accountRepository, 'searchByEmail').mockResolvedValue(account);

      const result = await service.validateAccount(
        'test@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when password does not match', async () => {
      const accountId = new AccountID('123e4567-e89b-12d3-a456-426614174000');
      const email = new Email('test@example.com');
      const plainPassword = new Password('password123');
      const hashedPassword = await plainPassword.hash();

      const account = Account.fromPrimitives({
        id: accountId.value,
        password: hashedPassword,
        email: email.value,
        isActive: true,
      });

      jest.spyOn(accountRepository, 'searchByEmail').mockResolvedValue(account);

      const result = await service.validateAccount(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        isActive: false,
      };

      const mockToken = 'jwt-token-123';

      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const mockAccount = Account.fromPrimitives({
        id: mockUser.id,
        email: mockUser.email,
        isActive: mockUser.isActive,
        password: undefined,
      });

      const result = await service.login(mockAccount);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockAccount,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockAccount.id,
        email: mockAccount.email,
        active: mockAccount.isActive,
      });
    });
  });
});
