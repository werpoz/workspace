import { Test, TestingModule } from '@nestjs/testing';
import { AccountVerificationRequestedEmailHandler } from 'src/context/notifier/application/handlers/AccountVerificationRequestedEmailHandler';
import { SendEmailUseCase } from 'src/context/notifier/application/SendEmailUseCase';
import { AccountVerificationRequestedDomainEvent } from 'src/context/identity/domain/events/AccountVerificationRequestedDomainEvent';

describe('AccountVerificationRequestedEmailHandler', () => {
    let handler: AccountVerificationRequestedEmailHandler;
    let sendEmailUseCase: jest.Mocked<SendEmailUseCase>;

    beforeEach(async () => {
        const mockSendEmailUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountVerificationRequestedEmailHandler,
                {
                    provide: SendEmailUseCase,
                    useValue: mockSendEmailUseCase,
                },
            ],
        }).compile();

        handler = module.get<AccountVerificationRequestedEmailHandler>(
            AccountVerificationRequestedEmailHandler,
        );
        sendEmailUseCase = module.get(SendEmailUseCase);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should send email with verification code', async () => {
        const event = new AccountVerificationRequestedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            method: 'email_code',
            verificationId: '550e8400-e29b-41d4-a716-446655440002',
            code: '123456',
        });

        await handler.handle(event);

        expect(sendEmailUseCase.execute).toHaveBeenCalledTimes(1);
        const callArgs = (sendEmailUseCase.execute as jest.Mock).mock.calls[0][0];
        expect(callArgs.to).toBe('test@example.com');
        expect(callArgs.body).toContain('123456');
    });

    it('should send email with verification link', async () => {
        const event = new AccountVerificationRequestedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            method: 'email_link',
            verificationId: '550e8400-e29b-41d4-a716-446655440002',
            token: 'abc-def-ghi',
        });

        await handler.handle(event);

        expect(sendEmailUseCase.execute).toHaveBeenCalledTimes(1);
        const callArgs = (sendEmailUseCase.execute as jest.Mock).mock.calls[0][0];
        expect(callArgs.to).toBe('test@example.com');
        expect(callArgs.body).toContain('abc-def-ghi');
    });
});
