import { WhatsappSession } from '../WhatsappSession';
import { WhatsappSessionId } from '../value-object/WhatsappSessionId';
import { PhoneNumber } from '../value-object/PhoneNumber';

export interface WhatsappSessionRepository {
  save(session: WhatsappSession): Promise<void>;
  
  findById(id: WhatsappSessionId): Promise<WhatsappSession | null>;
  
  findByPhoneNumber(phoneNumber: PhoneNumber): Promise<WhatsappSession | null>;
  
  findAll(): Promise<WhatsappSession[]>;
  
  delete(id: WhatsappSessionId): Promise<void>;
  
  updateStatus(id: WhatsappSessionId, status: string): Promise<void>;
  
  updateConnectionState(id: WhatsappSessionId, state: string): Promise<void>;
  
  updateQrCode(id: WhatsappSessionId, qrCode: string): Promise<void>;
}