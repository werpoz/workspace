import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from 'src/context/identity/application/service/local.strategy';
import { AuthService } from 'src/context/identity/application/service/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateAccount: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user when credentials are valid', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isActive: true,
    };

    jest.spyOn(authService, 'validateAccount').mockResolvedValue(mockUser);

    const result = await strategy.validate('test@example.com', 'password123');

    expect(result).toEqual(mockUser);
    expect(authService.validateAccount).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
  });

  it('should throw UnauthorizedException when credentials are invalid', async () => {
    jest.spyOn(authService, 'validateAccount').mockResolvedValue(null);

    await expect(
      strategy.validate('test@example.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
