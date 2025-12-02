import { Test, TestingModule } from '@nestjs/testing';
import { AccountCreatedEmailHandler } from 'src/context/notifier/application/handlers/AccountCreatedEmailHandler';
import { SendEmailUseCase } from 'src/context/notifier/application/SendEmailUseCase';
import { AccountCreatedDomainEvent } from 'src/context/identity/domain/events/AccountCreatedDomainEvent';

describe('AccountCreatedEmailHandler', () => {
  let handler: AccountCreatedEmailHandler;
  let sendEmailUseCase: SendEmailUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountCreatedEmailHandler,
        {
          provide: SendEmailUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<AccountCreatedEmailHandler>(
      AccountCreatedEmailHandler,
    );
    sendEmailUseCase = module.get<SendEmailUseCase>(SendEmailUseCase);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should send welcome email when account is created with email', async () => {
    const event = new AccountCreatedDomainEvent({
      aggregateId: '123',
      email: 'newuser@example.com',
    });

    await handler.handle(event);

    expect(sendEmailUseCase.execute).toHaveBeenCalledWith({
      to: 'newuser@example.com',
      subject: '¡Bienvenido a nuestra plataforma!',
      body: expect.stringContaining('newuser@example.com'),
    });

    expect(sendEmailUseCase.execute).toHaveBeenCalledWith({
      to: 'newuser@example.com',
      subject: expect.any(String),
      body: expect.stringContaining('<!DOCTYPE html>'),
    });
  });

  it('should not send email when event has no email', async () => {
    const event = new AccountCreatedDomainEvent({
      aggregateId: '123',
      email: undefined,
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    await handler.handle(event);

    expect(sendEmailUseCase.execute).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[AccountCreatedEmailHandler] No email in event, skipping',
    );

    consoleWarnSpy.mockRestore();
  });

  it('should log error if email sending fails', async () => {
    const event = new AccountCreatedDomainEvent({
      aggregateId: '123',
      email: 'test@example.com',
    });

    const error = new Error('SMTP connection failed');
    jest.spyOn(sendEmailUseCase, 'execute').mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await handler.handle(event);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[AccountCreatedEmailHandler] Failed to send welcome email to test@example.com:',
      error,
    );

    consoleErrorSpy.mockRestore();
  });

  it('should log success when email is sent', async () => {
    const event = new AccountCreatedDomainEvent({
      aggregateId: '123',
      email: 'success@example.com',
    });

    jest.spyOn(sendEmailUseCase, 'execute').mockResolvedValue();

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await handler.handle(event);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[AccountCreatedEmailHandler] Welcome email sent to success@example.com',
    );

    consoleLogSpy.mockRestore();
  });

  it('should include email in HTML template', async () => {
    const event = new AccountCreatedDomainEvent({
      aggregateId: '123',
      email: 'template@example.com',
    });

    await handler.handle(event);

    const callArgs = (sendEmailUseCase.execute as jest.Mock).mock.calls[0][0];
    expect(callArgs.body).toContain('template@example.com');
    expect(callArgs.body).toContain('Bienvenido');
    expect(callArgs.body).toContain('<!DOCTYPE html>');
  });
});
