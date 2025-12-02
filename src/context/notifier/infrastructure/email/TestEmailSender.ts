import { EmailSender } from '../../domain/interface/EmailSender';
import { EmailMessage } from '../../domain/EmailMessage';

export class TestEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    const { to, subject, body } = message.toPrimitives();

    console.log('='.repeat(80));
    console.log('📧 TEST EMAIL SENDER - Email Details:');
    console.log('='.repeat(80));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log('='.repeat(80));
  }
}
