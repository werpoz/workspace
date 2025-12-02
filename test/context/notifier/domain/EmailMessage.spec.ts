import { EmailMessage } from 'src/context/notifier/domain/EmailMessage';
import { EmailAddress } from 'src/context/notifier/domain/value-object/EmailAddress.vo';
import { EmailSubject } from 'src/context/notifier/domain/value-object/EmailSubject.vo';
import { EmailBody } from 'src/context/notifier/domain/value-object/EmailBody.vo';

describe('EmailMessage', () => {
  it('should create an email message from value objects', () => {
    const to = new EmailAddress('recipient@example.com');
    const subject = new EmailSubject('Test Subject');
    const body = new EmailBody('<p>Test Body</p>');

    const message = new EmailMessage(to, subject, body);

    expect(message.toAddress).toBe('recipient@example.com');
    expect(message.emailSubject).toBe('Test Subject');
    expect(message.emailBody).toBe('<p>Test Body</p>');
  });

  it('should convert to primitives', () => {
    const to = new EmailAddress('recipient@example.com');
    const subject = new EmailSubject('Test Subject');
    const body = new EmailBody('<p>Test Body</p>');

    const message = new EmailMessage(to, subject, body);
    const primitives = message.toPrimitives();

    expect(primitives).toEqual({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    });
  });

  it('should create from primitives', () => {
    const primitives = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    };

    const message = EmailMessage.fromPrimitives(primitives);

    expect(message.toAddress).toBe('recipient@example.com');
    expect(message.emailSubject).toBe('Test Subject');
    expect(message.emailBody).toBe('<p>Test Body</p>');
  });

  it('should throw error when creating from invalid primitives', () => {
    const invalidPrimitives = {
      to: 'invalid-email',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    };

    expect(() => EmailMessage.fromPrimitives(invalidPrimitives)).toThrow();
  });
});
