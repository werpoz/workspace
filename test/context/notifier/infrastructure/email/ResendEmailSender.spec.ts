import { ResendEmailSender } from 'src/context/notifier/infrastructure/email/ResendEmailSender';
import { EmailMessage } from 'src/context/notifier/domain/EmailMessage';
import { Resend } from 'resend';

jest.mock('resend');

describe('ResendEmailSender', () => {
  let sender: ResendEmailSender;
  let mockResendClient: jest.Mocked<Resend>;

  beforeEach(() => {
    mockResendClient = {
      emails: {
        send: jest.fn(),
      },
    } as any;

    sender = new ResendEmailSender(mockResendClient);
  });

  it('should send email successfully', async () => {
    const message = EmailMessage.fromPrimitives({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    });

    mockResendClient.emails.send.mockResolvedValue({
      data: { id: '123' },
      error: null,
    } as any);

    await sender.send(message);

    expect(mockResendClient.emails.send).toHaveBeenCalledWith({
      from: 'no-reply@tuapp.com',
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test Body</p>',
    });
  });

  it('should throw error when Resend API fails', async () => {
    const message = EmailMessage.fromPrimitives({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    });

    mockResendClient.emails.send.mockResolvedValue({
      data: null,
      error: { message: 'API Error', name: 'ResendError' },
    } as any);

    await expect(sender.send(message)).rejects.toThrow(
      'Failed to send email via Resend: API Error',
    );
  });
});
