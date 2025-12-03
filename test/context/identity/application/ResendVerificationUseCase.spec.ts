import { ResendVerificationUseCase } from 'src/context/identity/application/ResendVerificationUseCase';
import { RequestAccountVerificationUseCase } from 'src/context/identity/application/RequestAccountVerificationUseCase';
import { AccountRepository } from 'src/context/identity/domain/interface/AccountRepository';
import { Account } from 'src/context/identity/domain/Account';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { AccountStatus } from 'src/context/identity/domain/value-object/AccountStatus.vo';

describe('ResendVerificationUseCase', () => {
    let useCase: ResendVerificationUseCase;
    let accountRepository: jest.Mocked<AccountRepository>;
    let requestVerificationUseCase: jest.Mocked<RequestAccountVerificationUseCase>;

    beforeEach(() => {
        accountRepository = {
            searchByEmail: jest.fn(),
        } as any;
        requestVerificationUseCase = {
            execute: jest.fn(),
        } as any;

        useCase = new ResendVerificationUseCase(
            accountRepository,
            requestVerificationUseCase,
        );
    });

    it('should resend verification when account is pending', async () => {
        const email = 'test@example.com';
        const accountId = '123e4567-e89b-12d3-a456-426614174000';
        const account = {
            id: new AccountID(accountId),
            status: { isActive: () => false },
        } as unknown as Account;

        accountRepository.searchByEmail.mockResolvedValue(account);

        await useCase.execute({ email, method: 'email_code' });

        expect(requestVerificationUseCase.execute).toHaveBeenCalledWith({
            accountId,
            method: 'email_code',
        });
    });

    it('should throw error when account is already active', async () => {
        const account = {
            status: { isActive: () => true },
        } as unknown as Account;

        accountRepository.searchByEmail.mockResolvedValue(account);

        await expect(
            useCase.execute({ email: 'active@example.com' }),
        ).rejects.toThrow('Account is already verified');
    });

    it('should throw error when account not found', async () => {
        accountRepository.searchByEmail.mockResolvedValue(null);

        await expect(
            useCase.execute({ email: 'missing@example.com' }),
        ).rejects.toThrow('Account not found');
    });
});
