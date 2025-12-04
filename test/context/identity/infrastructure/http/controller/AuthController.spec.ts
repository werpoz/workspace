import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/context/identity/infrastructure/http/controller/AuthController';
import { AuthService } from 'src/context/identity/application/service/auth.service';
import { VerifyAccountByCodeUseCase } from 'src/context/identity/application/VerifyAccountByCodeUseCase';
import { ResendVerificationUseCase } from 'src/context/identity/application/ResendVerificationUseCase';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: VerifyAccountByCodeUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ResendVerificationUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.login with user from request', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'test@example.com',
      status: 'active',
    };

    const mockLoginResult = {
      access_token: 'jwt-token',
      user: mockUser,
    };

    jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResult);

    const req = { user: mockUser };
    const result = await controller.login(req);

    expect(result).toEqual(mockLoginResult);
    expect(authService.login).toHaveBeenCalledWith(mockUser);
  });
});
