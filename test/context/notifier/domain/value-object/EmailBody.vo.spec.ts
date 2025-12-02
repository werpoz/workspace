import { EmailBody } from 'src/context/notifier/domain/value-object/EmailBody.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('EmailBody', () => {
  it('should create a valid email body', () => {
    const bodyStr = '<p>Hello, welcome to our platform!</p>';
    const body = new EmailBody(bodyStr);
    expect(body.value).toBe(bodyStr);
  });

  it('should throw InvalidArgumentError for empty body', () => {
    expect(() => new EmailBody('')).toThrow(InvalidArgumentError);
  });

  it('should throw InvalidArgumentError for whitespace-only body', () => {
    expect(() => new EmailBody('   ')).toThrow(InvalidArgumentError);
  });

  it('should accept plain text body', () => {
    const plainText = 'This is a plain text email';
    const body = new EmailBody(plainText);
    expect(body.value).toBe(plainText);
  });

  it('should accept HTML body', () => {
    const htmlBody = '<html><body><h1>Test</h1></body></html>';
    const body = new EmailBody(htmlBody);
    expect(body.value).toBe(htmlBody);
  });
});
