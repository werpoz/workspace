import { EmailSubject } from 'src/context/notifier/domain/value-object/EmailSubject.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('EmailSubject', () => {
  it('should create a valid email subject', () => {
    const subjectStr = 'Welcome to our platform';
    const subject = new EmailSubject(subjectStr);
    expect(subject.value).toBe(subjectStr);
  });

  it('should throw InvalidArgumentError for empty subject', () => {
    expect(() => new EmailSubject('')).toThrow(InvalidArgumentError);
  });

  it('should throw InvalidArgumentError for whitespace-only subject', () => {
    expect(() => new EmailSubject('   ')).toThrow(InvalidArgumentError);
  });

  it('should throw InvalidArgumentError for subject exceeding max length', () => {
    const longSubject = 'a'.repeat(999);
    expect(() => new EmailSubject(longSubject)).toThrow(InvalidArgumentError);
  });

  it('should accept subject at max length', () => {
    const maxSubject = 'a'.repeat(998);
    const subject = new EmailSubject(maxSubject);
    expect(subject.value).toBe(maxSubject);
  });
});
