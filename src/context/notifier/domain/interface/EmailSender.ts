import { EmailMessage } from '../EmailMessage';

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
