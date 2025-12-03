import { VerificationToken } from 'src/context/identity/domain/value-object/VerificationToken.vo';

describe('VerificationToken', () => {
    it('should create token with valid UUID', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const token = new VerificationToken(uuid);
        expect(token.value).toBe(uuid);
    });

    it('should throw error for invalid UUID', () => {
        expect(() => new VerificationToken('invalid-uuid')).toThrow(
            'Must be a valid UUID',
        );
        expect(() => new VerificationToken('abc123')).toThrow(
            'Must be a valid UUID',
        );
    });

    it('should throw error for empty string', () => {
        expect(() => new VerificationToken('')).toThrow();
    });


    it('should be equal when values are the same', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const token1 = new VerificationToken(uuid);
        const token2 = new VerificationToken(uuid);
        expect(token1.equals(token2)).toBe(true);
    });

    it('should not be equal when values are different', () => {
        const token1 = new VerificationToken('123e4567-e89b-12d3-a456-426614174000');
        const token2 = new VerificationToken('987e6543-e89b-12d3-a456-426614174999');
        expect(token1.equals(token2)).toBe(false);
    });
});
