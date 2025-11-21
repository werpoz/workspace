import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('Password', () => {
    it('should create a valid password', () => {
        const passStr = 'password123';
        const password = new Password(passStr);
        expect(password.value).toBe(passStr);
    });

    it('should throw InvalidArgumentError for short password', () => {
        expect(() => new Password('short')).toThrow(InvalidArgumentError);
    });

    it('should hash the password', async () => {
        const password = new Password('password123');
        const hash = await password.hash();
        expect(hash).not.toBe('password123');
        expect(hash).toHaveLength(60); // bcrypt hash length
    });

    it('should match correct password', async () => {
        const password = new Password('password123');
        const hash = await password.hash();
        const hashedPassword = new Password(hash);
        // Note: The matches method expects the plain text password to compare against the hashed value stored in the object.
        // However, the Password object stores the value passed to constructor.
        // If we construct with plain text, matches compares plain text with plain text (which bcrypt.compareSync handles but might not be intended usage if value is supposed to be hash).
        // Let's check the implementation: bcrypt.compareSync(plain, this.value).
        // If this.value is plain text, it treats it as hash, which will fail or throw.
        // Wait, usually Password VO holds the HASHED password if retrieved from DB, or PLAIN if creating.
        // The implementation `matches` uses `bcrypt.compareSync(plain, this.value)`, so `this.value` MUST be a hash for it to work correctly.
        // But the constructor validates length 8-64. A hash is 60 chars, so it fits.
        // So if we create a Password with a hash, it should work.

        // Let's test the flow: Create with plain -> hash -> Create new Password with hash -> match
        expect(hashedPassword.matches('password123')).toBeTruthy();
    });

    it('should not match incorrect password', async () => {
        const password = new Password('password123');
        const hash = await password.hash();
        const hashedPassword = new Password(hash);
        expect(hashedPassword.matches('wrongpassword')).toBeFalsy();
    });
});
