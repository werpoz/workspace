import { EmailSender } from '../../domain/interface/EmailSender';
import { EmailMessage } from '../../domain/EmailMessage';
import * as nodemailer from 'nodemailer';

export class NodemailerEmailSender implements EmailSender {
  constructor(private readonly transporter: nodemailer.Transporter) {}

  async send(message: EmailMessage): Promise<void> {
    const { to, subject, body } = message.toPrimitives();

    await this.transporter.sendMail({
      from: 'no-reply@tuapp.com',
      to,
      subject,
      html: body,
    });
  }
}
