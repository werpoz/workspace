import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('Email', () => {
  it('should create a valid email', () => {
    const emailStr = 'test@example.com';
    const email = new Email(emailStr);
    expect(email.value).toBe(emailStr);
  });

  it('should throw InvalidArgumentError for invalid email', () => {
    expect(() => new Email('invalid-email')).toThrow(InvalidArgumentError);
  });
});
