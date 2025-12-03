import { Test, TestingModule } from '@nestjs/testing';
import { AccountCreatedHandler } from 'src/context/identity/application/handlers/AccountCreatedHandler';
import { AccountCreatedDomainEvent } from 'src/context/identity/domain/events/AccountCreatedDomainEvent';
import { RequestAccountVerificationUseCase } from 'src/context/identity/application/RequestAccountVerificationUseCase';

describe('AccountCreatedHandler', () => {
  let handler: AccountCreatedHandler;
  let requestVerificationUseCase: jest.Mocked<RequestAccountVerificationUseCase>;

  beforeEach(async () => {
    requestVerificationUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountCreatedHandler,
        {
          provide: RequestAccountVerificationUseCase,
          useValue: requestVerificationUseCase,
        },
      ],
    }).compile();

    handler = module.get<AccountCreatedHandler>(AccountCreatedHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should trigger verification request on account creation', async () => {
    const event = new AccountCreatedDomainEvent({
      aggregateId: '123',
      email: 'test@example.com',
    });

    await handler.handle(event);

    expect(requestVerificationUseCase.execute).toHaveBeenCalledWith({
      accountId: '123',
      method: 'email_code',
    });
  });
});

