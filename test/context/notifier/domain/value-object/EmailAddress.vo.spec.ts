import { EmailAddress } from 'src/context/notifier/domain/value-object/EmailAddress.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('EmailAddress', () => {
  it('should create a valid email address', () => {
    const emailStr = 'test@example.com';
    const email = new EmailAddress(emailStr);
    expect(email.value).toBe(emailStr);
  });

  it('should throw InvalidArgumentError for invalid email', () => {
    expect(() => new EmailAddress('invalid-email')).toThrow(
      InvalidArgumentError,
    );
  });

  it('should throw InvalidArgumentError for email without @', () => {
    expect(() => new EmailAddress('invalidemail.com')).toThrow(
      InvalidArgumentError,
    );
  });

  it('should throw InvalidArgumentError for email without domain', () => {
    expect(() => new EmailAddress('test@')).toThrow(InvalidArgumentError);
  });

  it('should throw InvalidArgumentError for email with spaces', () => {
    expect(() => new EmailAddress('test @example.com')).toThrow(
      InvalidArgumentError,
    );
  });
});
