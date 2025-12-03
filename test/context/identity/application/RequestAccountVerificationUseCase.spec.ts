import { RequestAccountVerificationUseCase } from 'src/context/identity/application/RequestAccountVerificationUseCase';
import { AccountRepository } from 'src/context/identity/domain/interface/AccountRepository';
import { EmailVerificationRepository } from 'src/context/identity/domain/interface/EmailVerificationRepository';
import { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Account } from 'src/context/identity/domain/Account';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { AccountStatus } from 'src/context/identity/domain/value-object/AccountStatus.vo';
import { VerificationMethod } from 'src/context/identity/domain/value-object/VerificationMethod.vo';
import { AccountVerificationRequestedDomainEvent } from 'src/context/identity/domain/events/AccountVerificationRequestedDomainEvent';

describe('RequestAccountVerificationUseCase', () => {
    let useCase: RequestAccountVerificationUseCase;
    let accountRepository: jest.Mocked<AccountRepository>;
    let verificationRepository: jest.Mocked<EmailVerificationRepository>;
    let eventBus: jest.Mocked<DomainEventBus>;

    beforeEach(() => {
        accountRepository = {
            searchById: jest.fn(),
        } as any;
        verificationRepository = {
            save: jest.fn(),
        } as any;
        eventBus = {
            publishAll: jest.fn(),
        } as any;

        useCase = new RequestAccountVerificationUseCase(
            verificationRepository,
            accountRepository,
            eventBus,
        );
    });

    it('should create verification and publish event when account exists', async () => {
        const accountId = '123e4567-e89b-12d3-a456-426614174000';
        const email = 'test@example.com';
        const account = {
            id: new AccountID(accountId),
            email: new Email(email),
            status: AccountStatus.pendingVerification(),
        } as Account;

        accountRepository.searchById.mockResolvedValue(account);

        await useCase.execute({ accountId, method: 'email_code' });

        expect(verificationRepository.save).toHaveBeenCalled();
        expect(eventBus.publishAll).toHaveBeenCalledWith([
            expect.any(AccountVerificationRequestedDomainEvent),
        ]);

        const event = (eventBus.publishAll.mock.calls[0][0] as any)[0];
        expect(event.email).toBe(email);
        expect(event.method).toBe('email_code');
        expect(event.code).toBeDefined();
    });

    it('should throw error when account does not exist', async () => {
        accountRepository.searchById.mockResolvedValue(null);

        await expect(
            useCase.execute({ accountId: 'non-existent', method: 'email_code' }),
        ).rejects.toThrow('Account not found');
    });
});
