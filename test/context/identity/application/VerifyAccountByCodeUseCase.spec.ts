import { VerifyAccountByCodeUseCase } from 'src/context/identity/application/VerifyAccountByCodeUseCase';
import { AccountRepository } from 'src/context/identity/domain/interface/AccountRepository';
import { EmailVerificationRepository } from 'src/context/identity/domain/interface/EmailVerificationRepository';
import { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Account } from 'src/context/identity/domain/Account';
import { EmailVerification } from 'src/context/identity/domain/EmailVerification';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { AccountStatus } from 'src/context/identity/domain/value-object/AccountStatus.vo';
import { AccountVerifiedDomainEvent } from 'src/context/identity/domain/events/AccountVerifiedDomainEvent';

describe('VerifyAccountByCodeUseCase', () => {
    let useCase: VerifyAccountByCodeUseCase;
    let accountRepository: jest.Mocked<AccountRepository>;
    let verificationRepository: jest.Mocked<EmailVerificationRepository>;
    let eventBus: jest.Mocked<DomainEventBus>;

    beforeEach(() => {
        accountRepository = {
            searchByEmail: jest.fn(),
            update: jest.fn(),
        } as any;
        verificationRepository = {
            findByAccountIdAndCode: jest.fn(),
            save: jest.fn(),
        } as any;
        eventBus = {
            publishAll: jest.fn(),
        } as any;

        useCase = new VerifyAccountByCodeUseCase(
            verificationRepository,
            accountRepository,
            eventBus,
        );
    });

    it('should verify account when code is valid', async () => {
        const email = 'test@example.com';
        const code = '123456';
        const accountId = '123e4567-e89b-12d3-a456-426614174000';

        const account = {
            id: new AccountID(accountId),
            email: new Email(email),
            status: AccountStatus.pendingVerification(),
            verify: jest.fn(),
        } as unknown as Account;

        const verification = {
            isValid: () => true,
            verify: jest.fn(),
            accountId: new AccountID(accountId),
        } as unknown as EmailVerification;

        accountRepository.searchByEmail.mockResolvedValue(account);
        verificationRepository.findByAccountIdAndCode.mockResolvedValue(verification);

        await useCase.execute({ email, code });

        expect(verification.verify).toHaveBeenCalled();
        expect(verificationRepository.save).toHaveBeenCalledWith(verification);
        expect(account.verify).toHaveBeenCalled();
        expect(accountRepository.update).toHaveBeenCalledWith(account);
        expect(eventBus.publishAll).toHaveBeenCalledWith([
            expect.any(AccountVerifiedDomainEvent),
        ]);
    });

    it('should throw error when account not found', async () => {
        accountRepository.searchByEmail.mockResolvedValue(null);

        await expect(
            useCase.execute({ email: 'missing@example.com', code: '123456' }),
        ).rejects.toThrow('Account not found');
    });

    it('should throw error when verification not found', async () => {
        const account = {
            id: new AccountID('123e4567-e89b-12d3-a456-426614174000'),
        } as Account;
        accountRepository.searchByEmail.mockResolvedValue(account);
        verificationRepository.findByAccountIdAndCode.mockResolvedValue(null);

        await expect(
            useCase.execute({ email: 'test@example.com', code: 'invalid' }),
        ).rejects.toThrow('Invalid or expired verification code');
    });

    it('should throw error when verification is invalid (expired)', async () => {
        const account = {
            id: new AccountID('123e4567-e89b-12d3-a456-426614174000'),
        } as Account;
        const verification = {
            isValid: () => false,
            isExpired: () => true,
            attempts: 0,
        } as unknown as EmailVerification;

        accountRepository.searchByEmail.mockResolvedValue(account);
        verificationRepository.findByAccountIdAndCode.mockResolvedValue(verification);

        await expect(
            useCase.execute({ email: 'test@example.com', code: '123456' }),
        ).rejects.toThrow('Verification code has expired');
    });
});
