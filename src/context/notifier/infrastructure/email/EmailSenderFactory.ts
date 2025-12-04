import { EmailSender } from '../../domain/interface/EmailSender';
import { ResendEmailSender } from './ResendEmailSender';
import { NodemailerEmailSender } from './NodemailerEmailSender';
import { TestEmailSender } from './TestEmailSender';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

export type EmailProvider = 'resend' | 'nodemailer' | 'test';

export class EmailSenderFactory {
  static create(
    provider: EmailProvider,
    config?: {
      resendApiKey?: string;
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
      smtpPass?: string;
    },
  ): EmailSender {
    switch (provider) {
      case 'resend':
        if (!config?.resendApiKey) {
          throw new Error('Resend API key is required for Resend provider');
        }
        const resendClient = new Resend(config.resendApiKey);
        return new ResendEmailSender(resendClient);

      case 'nodemailer':
        const transporter = nodemailer.createTransport({
          host: config?.smtpHost || 'localhost',
          port: config?.smtpPort || 587,
          secure: false,
          auth: config?.smtpUser
            ? {
              user: config.smtpUser,
              pass: config.smtpPass || '',
            }
            : undefined,
        });
        return new NodemailerEmailSender(transporter);

      case 'test':
        return new TestEmailSender();

      default:
        throw new Error(`Unknown email provider: ${provider}`);
    }
  }
}
