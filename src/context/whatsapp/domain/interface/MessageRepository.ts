import { Message } from '../Message';
import { MessageId } from '../value-object/MessageId';
import { PhoneNumber } from '../value-object/PhoneNumber';

export interface MessageRepository {
  save(message: Message): Promise<void>;
  
  findById(id: MessageId): Promise<Message | null>;
  
  findBySessionId(sessionId: string): Promise<Message[]>;
  
  findByFrom(phoneNumber: PhoneNumber): Promise<Message[]>;
  
  findByTo(phoneNumber: PhoneNumber): Promise<Message[]>;
  
  findByKeyId(keyId: string): Promise<Message | null>;
  
  updateStatus(id: MessageId, status: string): Promise<void>;
  
  delete(id: MessageId): Promise<void>;
  
  countBySession(sessionId: string): Promise<number>;
}