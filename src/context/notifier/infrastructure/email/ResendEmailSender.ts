import { Resend } from 'resend';
import { EmailSender } from '../../domain/interface/EmailSender';
import { EmailMessage } from '../../domain/EmailMessage';

export class ResendEmailSender implements EmailSender {
  constructor(private readonly client: Resend) {}

  async send(message: EmailMessage): Promise<void> {
    const { to, subject, body } = message.toPrimitives();

    const { error } = await this.client.emails.send({
      from: 'no-reply@tuapp.com',
      to,
      subject,
      html: body,
    });

    if (error) {
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
  }
}
