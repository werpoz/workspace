import { VerificationMethod, VerificationMethodEnum } from 'src/context/identity/domain/value-object/VerificationMethod.vo';

describe('VerificationMethod', () => {
    it('should create email_link method', () => {
        const method = VerificationMethod.emailLink();
        expect(method.value).toBe(VerificationMethodEnum.EMAIL_LINK);
        expect(method.isEmailLink()).toBe(true);
        expect(method.isEmailCode()).toBe(false);
    });

    it('should create email_code method', () => {
        const method = VerificationMethod.emailCode();
        expect(method.value).toBe(VerificationMethodEnum.EMAIL_CODE);
        expect(method.isEmailCode()).toBe(true);
        expect(method.isEmailLink()).toBe(false);
    });

    it('should throw error for invalid method', () => {
        expect(() => new VerificationMethod('sms' as VerificationMethodEnum)).toThrow();
    });

    it('should have same value when created with same enum', () => {
        const method1 = VerificationMethod.emailCode();
        const method2 = VerificationMethod.emailCode();
        expect(method1.value).toBe(method2.value);
    });

    it('should have different values when created with different enums', () => {
        const method1 = VerificationMethod.emailCode();
        const method2 = VerificationMethod.emailLink();
        expect(method1.value).not.toBe(method2.value);
    });
});
