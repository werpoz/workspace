import { EmailVerification } from 'src/context/identity/domain/EmailVerification';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { VerificationMethod, VerificationMethodEnum } from 'src/context/identity/domain/value-object/VerificationMethod.vo';

describe('EmailVerification', () => {
    describe('create', () => {
        it('should create email verification with email_link method', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailLink();

            const verification = EmailVerification.create(accountId, method);

            expect(verification.accountId).toBe(accountId);
            expect(verification.method).toBe(method);
            expect(verification.token).toBeDefined();
            expect(verification.token?.value).toBeDefined();
            expect(verification.code).toBeNull();
            expect(verification.attempts).toBe(0);
            expect(verification.verified).toBe(false);
            expect(verification.verifiedAt).toBeNull();
        });

        it('should create email verification with email_code method', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);

            expect(verification.accountId).toBe(accountId);
            expect(verification.method).toBe(method);
            expect(verification.token).toBeNull();
            expect(verification.code).toBeDefined();
            expect(verification.code?.value).toMatch(/^\d{6}$/);
            expect(verification.attempts).toBe(0);
            expect(verification.verified).toBe(false);
            expect(verification.verifiedAt).toBeNull();
        });

        it('should set expiry time correctly', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();
            const expiryMinutes = 15;

            const beforeCreate = Date.now();
            const verification = EmailVerification.create(accountId, method, expiryMinutes);
            const afterCreate = Date.now();

            const expectedExpiry = beforeCreate + expiryMinutes * 60 * 1000;
            const actualExpiry = verification.expiresAt.getTime();

            expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry);
            expect(actualExpiry).toBeLessThanOrEqual(afterCreate + expiryMinutes * 60 * 1000);
        });

        it('should use default expiry of 30 minutes', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const beforeCreate = Date.now();
            const verification = EmailVerification.create(accountId, method);

            const expectedExpiry = beforeCreate + 30 * 60 * 1000;
            const actualExpiry = verification.expiresAt.getTime();

            expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry);
        });
    });

    describe('isExpired', () => {
        it('should return false for non-expired verification', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method, 30);

            expect(verification.isExpired()).toBe(false);
        });

        it('should return true for expired verification', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method, -1); // Expired 1 minute ago

            expect(verification.isExpired()).toBe(true);
        });
    });

    describe('isValid', () => {
        it('should return true for fresh verification', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);

            expect(verification.isValid()).toBe(true);
        });

        it('should return false if already verified', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);
            verification.verify();

            expect(verification.isValid()).toBe(false);
        });

        it('should return false if expired', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method, -1);

            expect(verification.isValid()).toBe(false);
        });

        it('should return false if attempts >= 3', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);
            verification.incrementAttempts();
            verification.incrementAttempts();
            verification.incrementAttempts();

            expect(verification.isValid()).toBe(false);
        });
    });

    describe('incrementAttempts', () => {
        it('should increment attempts counter', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);

            expect(verification.attempts).toBe(0);
            verification.incrementAttempts();
            expect(verification.attempts).toBe(1);
            verification.incrementAttempts();
            expect(verification.attempts).toBe(2);
        });
    });

    describe('verify', () => {
        it('should mark verification as verified', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);

            expect(verification.verified).toBe(false);
            expect(verification.verifiedAt).toBeNull();

            const beforeVerify = new Date();
            verification.verify();
            const afterVerify = new Date();

            expect(verification.verified).toBe(true);
            expect(verification.verifiedAt).toBeDefined();
            expect(verification.verifiedAt!.getTime()).toBeGreaterThanOrEqual(beforeVerify.getTime());
            expect(verification.verifiedAt!.getTime()).toBeLessThanOrEqual(afterVerify.getTime());
        });
    });

    describe('toPrimitives', () => {
        it('should convert to primitives with email_code', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);

            const primitives = verification.toPrimitives();

            expect(primitives.id).toBe(verification.id.value);
            expect(primitives.accountId).toBe(accountId.value);
            expect(primitives.method).toBe('email_code');
            expect(primitives.token).toBeNull();
            expect(primitives.code).toBeDefined();
            expect(primitives.attempts).toBe(0);
            expect(primitives.verified).toBe(false);
            expect(primitives.verifiedAt).toBeNull();
        });

        it('should convert to primitives with email_link', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailLink();

            const verification = EmailVerification.create(accountId, method);

            const primitives = verification.toPrimitives();

            expect(primitives.token).toBeDefined();
            expect(primitives.code).toBeNull();
        });

        it('should include verifiedAt when verified', () => {
            const accountId = AccountID.random();
            const method = VerificationMethod.emailCode();

            const verification = EmailVerification.create(accountId, method);
            verification.verify();

            const primitives = verification.toPrimitives();

            expect(primitives.verified).toBe(true);
            expect(primitives.verifiedAt).toBeDefined();
        });
    });

    describe('fromPrimitives', () => {
        it('should reconstruct from primitives with email_code', () => {
            const params = {
                id: '550e8400-e29b-41d4-a716-446655440001',
                accountId: '550e8400-e29b-41d4-a716-446655440002',
                method: 'email_code',
                token: null,
                code: '123456',
                expiresAt: '2024-12-31T23:59:59.000Z',
                attempts: 1,
                verified: false,
                verifiedAt: null,
            };

            const verification = EmailVerification.fromPrimitives(params);

            expect(verification.id.value).toBe(params.id);
            expect(verification.accountId.value).toBe(params.accountId);
            expect(verification.method.value).toBe('email_code');
            expect(verification.token).toBeNull();
            expect(verification.code?.value).toBe('123456');
            expect(verification.attempts).toBe(1);
            expect(verification.verified).toBe(false);
            expect(verification.verifiedAt).toBeNull();
        });

        it('should reconstruct from primitives with email_link', () => {
            const params = {
                id: '550e8400-e29b-41d4-a716-446655440001',
                accountId: '550e8400-e29b-41d4-a716-446655440002',
                method: 'email_link',
                token: '550e8400-e29b-41d4-a716-446655440003',
                code: null,
                expiresAt: '2024-12-31T23:59:59.000Z',
                attempts: 0,
                verified: false,
                verifiedAt: null,
            };

            const verification = EmailVerification.fromPrimitives(params);

            expect(verification.token?.value).toBe(params.token);
            expect(verification.code).toBeNull();
        });

        it('should reconstruct verified verification', () => {
            const params = {
                id: '550e8400-e29b-41d4-a716-446655440001',
                accountId: '550e8400-e29b-41d4-a716-446655440002',
                method: 'email_code',
                token: null,
                code: '123456',
                expiresAt: '2024-12-31T23:59:59.000Z',
                attempts: 1,
                verified: true,
                verifiedAt: '2024-12-01T10:00:00.000Z',
            };

            const verification = EmailVerification.fromPrimitives(params);

            expect(verification.verified).toBe(true);
            expect(verification.verifiedAt?.toISOString()).toBe('2024-12-01T10:00:00.000Z');
        });
    });
});
