import { VerificationCode } from 'src/context/identity/domain/value-object/VerificationCode.vo';

describe('VerificationCode', () => {
    it('should create code with valid 6-digit string', () => {
        const code = new VerificationCode('123456');
        expect(code.value).toBe('123456');
    });

    it('should throw error for code less than 6 digits', () => {
        expect(() => new VerificationCode('12345')).toThrow(
            'must be exactly 6 digits',
        );
    });

    it('should throw error for code more than 6 digits', () => {
        expect(() => new VerificationCode('1234567')).toThrow(
            'must be exactly 6 digits',
        );
    });

    it('should throw error for non-numeric code', () => {
        expect(() => new VerificationCode('abc123')).toThrow(
            'must be exactly 6 digits',
        );
    });

    it('should throw error for code with spaces', () => {
        expect(() => new VerificationCode('123 456')).toThrow(
            'must be exactly 6 digits',
        );
    });

    it('should generate valid 6-digit code', () => {
        const code = VerificationCode.generate();
        expect(code.value).toMatch(/^\d{6}$/);
        expect(code.value.length).toBe(6);
    });

    it('should generate different codes on multiple calls', () => {
        const code1 = VerificationCode.generate();
        const code2 = VerificationCode.generate();
        const code3 = VerificationCode.generate();

        // At least one should be different (statistically almost certain)
        const allSame = code1.value === code2.value && code2.value === code3.value;
        expect(allSame).toBe(false);
    });

    it('should be equal when values are the same', () => {
        const code1 = new VerificationCode('123456');
        const code2 = new VerificationCode('123456');
        expect(code1.equals(code2)).toBe(true);
    });

    it('should not be equal when values are different', () => {
        const code1 = new VerificationCode('123456');
        const code2 = new VerificationCode('654321');
        expect(code1.equals(code2)).toBe(false);
    });
});
