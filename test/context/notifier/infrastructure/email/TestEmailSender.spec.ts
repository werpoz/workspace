import { TestEmailSender } from 'src/context/notifier/infrastructure/email/TestEmailSender';
import { EmailMessage } from 'src/context/notifier/domain/EmailMessage';

describe('TestEmailSender', () => {
  let sender: TestEmailSender;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    sender = new TestEmailSender();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log email to console', async () => {
    const message = EmailMessage.fromPrimitives({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    });

    await sender.send(message);

    expect(consoleLogSpy).toHaveBeenCalledWith('='.repeat(80));
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '📧 TEST EMAIL SENDER - Email Details:',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('To: test@example.com');
    expect(consoleLogSpy).toHaveBeenCalledWith('Subject: Test Subject');
    expect(consoleLogSpy).toHaveBeenCalledWith('Body:\n<p>Test Body</p>');
  });

  it('should not throw any errors', async () => {
    const message = EmailMessage.fromPrimitives({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    });

    await expect(sender.send(message)).resolves.not.toThrow();
  });
});
