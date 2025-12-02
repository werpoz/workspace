import {
  EmailSenderFactory,
  EmailProvider,
} from 'src/context/notifier/infrastructure/email/EmailSenderFactory';
import { ResendEmailSender } from 'src/context/notifier/infrastructure/email/ResendEmailSender';
import { NodemailerEmailSender } from 'src/context/notifier/infrastructure/email/NodemailerEmailSender';
import { TestEmailSender } from 'src/context/notifier/infrastructure/email/TestEmailSender';

jest.mock('resend');
jest.mock('nodemailer');

describe('EmailSenderFactory', () => {
  it('should create ResendEmailSender when provider is resend', () => {
    const sender = EmailSenderFactory.create('resend', {
      resendApiKey: 'test-api-key',
    });

    expect(sender).toBeInstanceOf(ResendEmailSender);
  });

  it('should throw error when creating Resend without API key', () => {
    expect(() => EmailSenderFactory.create('resend')).toThrow(
      'Resend API key is required for Resend provider',
    );
  });

  it('should create NodemailerEmailSender when provider is nodemailer', () => {
    const sender = EmailSenderFactory.create('nodemailer', {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: 'user@example.com',
      smtpPass: 'password',
    });

    expect(sender).toBeInstanceOf(NodemailerEmailSender);
  });

  it('should create NodemailerEmailSender with default config', () => {
    const sender = EmailSenderFactory.create('nodemailer');

    expect(sender).toBeInstanceOf(NodemailerEmailSender);
  });

  it('should create TestEmailSender when provider is test', () => {
    const sender = EmailSenderFactory.create('test');

    expect(sender).toBeInstanceOf(TestEmailSender);
  });

  it('should throw error for unknown provider', () => {
    expect(() => EmailSenderFactory.create('unknown' as EmailProvider)).toThrow(
      'Unknown email provider: unknown',
    );
  });
});
