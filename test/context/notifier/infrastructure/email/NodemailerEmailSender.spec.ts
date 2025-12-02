import { NodemailerEmailSender } from 'src/context/notifier/infrastructure/email/NodemailerEmailSender';
import { EmailMessage } from 'src/context/notifier/domain/EmailMessage';
import * as nodemailer from 'nodemailer';

describe('NodemailerEmailSender', () => {
  let sender: NodemailerEmailSender;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn(),
    } as any;

    sender = new NodemailerEmailSender(mockTransporter);
  });

  it('should send email successfully', async () => {
    const message = EmailMessage.fromPrimitives({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    });

    mockTransporter.sendMail.mockResolvedValue({ messageId: '123' } as any);

    await sender.send(message);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: 'no-reply@tuapp.com',
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test Body</p>',
    });
  });

  it('should throw error when SMTP fails', async () => {
    const message = EmailMessage.fromPrimitives({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    });

    mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

    await expect(sender.send(message)).rejects.toThrow('SMTP Error');
  });
});
