import { InMemoryEmailVerificationRepository } from 'src/context/identity/infrastructure/persistence/memmory/InMemoryEmailVerificationRepository';
import { EmailVerification } from 'src/context/identity/domain/EmailVerification';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { VerificationMethod } from 'src/context/identity/domain/value-object/VerificationMethod.vo';

describe('InMemoryEmailVerificationRepository', () => {
    let repository: InMemoryEmailVerificationRepository;

    beforeEach(() => {
        repository = new InMemoryEmailVerificationRepository();
    });

    describe('save', () => {
        it('should save a new verification', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            const found = await repository.findById(verification.id.value);
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(verification.id.value);
        });

        it('should update existing verification', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            // Verify and save again
            verification.verify();
            await repository.save(verification);

            const found = await repository.findById(verification.id.value);
            expect(found?.verified).toBe(true);
            expect(found?.verifiedAt).toBeDefined();
        });
    });

    describe('findById', () => {
        it('should find verification by id', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            const found = await repository.findById(verification.id.value);
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(verification.id.value);
            expect(found?.accountId.value).toBe(accountId.value);
        });

        it('should return null if verification not found', async () => {
            const result = await repository.findById('non-existent-id');
            expect(result).toBeNull();
        });
    });

    describe('findActiveByAccountId', () => {
        it('should find active verification by account id', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            const found = await repository.findActiveByAccountId(accountId.value);
            expect(found).toBeDefined();
            expect(found?.accountId.value).toBe(accountId.value);
            expect(found?.verified).toBe(false);
        });

        it('should return null if no active verification found for account', async () => {
            const accountId = AccountID.random();
            const result = await repository.findActiveByAccountId(accountId.value);
            expect(result).toBeNull();
        });

        it('should not return verified verification', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method);

            verification.verify();
            await repository.save(verification);

            const found = await repository.findActiveByAccountId(accountId.value);
            expect(found).toBeNull();
        });

        it('should not return expired verification', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method, -1); // -1 minutes = expired

            await repository.save(verification);

            const found = await repository.findActiveByAccountId(accountId.value);
            expect(found).toBeNull();
        });
    });

    describe('findByToken', () => {
        it('should find verification by token', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailLink();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            const found = await repository.findByToken(verification.token!.value);
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(verification.id.value);
            expect(found?.token?.value).toBe(verification.token!.value);
        });

        it('should return null if token not found', async () => {
            const result = await repository.findByToken('non-existent-token');
            expect(result).toBeNull();
        });

        it('should not find verification with email_code method', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            const result = await repository.findByToken('some-token');
            expect(result).toBeNull();
        });

        it('should not return invalid verification by token', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailLink();
            const verification = EmailVerification.create(accountId, method, -1); // expired

            await repository.save(verification);

            const result = await repository.findByToken(verification.token!.value);
            expect(result).toBeNull();
        });
    });

    describe('findByAccountIdAndCode', () => {
        it('should find verification by code and account id', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            const found = await repository.findByAccountIdAndCode(
                accountId.value,
                verification.code!.value,
            );
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(verification.id.value);
            expect(found?.code?.value).toBe(verification.code!.value);
        });

        it('should return null if code not found', async () => {
            const accountId = AccountID.random();
            const result = await repository.findByAccountIdAndCode(accountId.value, '123456');
            expect(result).toBeNull();
        });

        it('should not find verification with email_link method', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailLink();
            const verification = EmailVerification.create(accountId, method);

            await repository.save(verification);

            const result = await repository.findByAccountIdAndCode(accountId.value, '123456');
            expect(result).toBeNull();
        });

        it('should not return invalid verification', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method, -1); // expired

            await repository.save(verification);

            const result = await repository.findByAccountIdAndCode(
                accountId.value,
                verification.code!.value,
            );
            expect(result).toBeNull();
        });
    });

    describe('findUnverifiedAccountsOlderThan', () => {
        it('should find unverified accounts older than specified hours', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            // Create verification that expired 25 hours ago (need to calculate based on current time - 25 hours)
            const verification = EmailVerification.create(accountId, method, -(25 * 60)); // -1500 minutes = -25 hours

            await repository.save(verification);

            const results = await repository.findUnverifiedAccountsOlderThan(24);
            expect(results).toHaveLength(1);
            expect(results[0].id.value).toBe(verification.id.value);
        });

        it('should not return recent unverified verifications', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method, 30); // Valid for 30 minutes

            await repository.save(verification);

            const results = await repository.findUnverifiedAccountsOlderThan(24);
            expect(results).toHaveLength(0);
        });

        it('should not return verified verifications', async () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const verification = EmailVerification.create(accountId, method, -25);
            verification.verify();

            await repository.save(verification);

            const results = await repository.findUnverifiedAccountsOlderThan(24);
            expect(results).toHaveLength(0);
        });

        it('should return empty array if no old unverified verifications', async () => {
            const results = await repository.findUnverifiedAccountsOlderThan(24);
            expect(results).toEqual([]);
        });
    });

    describe('multiple verifications', () => {
        it('should handle multiple verifications for different accounts', async () => {
            const accountId1 = AccountID.random();
            const accountId2 = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification1 = EmailVerification.create(accountId1, method);
            const verification2 = EmailVerification.create(accountId2, method);

            await repository.save(verification1);
            await repository.save(verification2);

            const found1 = await repository.findActiveByAccountId(accountId1.value);
            const found2 = await repository.findActiveByAccountId(accountId2.value);

            expect(found1?.id.value).toBe(verification1.id.value);
            expect(found2?.id.value).toBe(verification2.id.value);
        });
    });
});

