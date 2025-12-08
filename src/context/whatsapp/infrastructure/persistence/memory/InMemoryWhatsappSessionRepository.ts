import { Injectable } from '@nestjs/common';
import { WhatsappSessionRepository } from '../../../domain/interface/WhatsappSessionRepository';
import { WhatsappSession } from '../../../domain/WhatsappSession';
import { WhatsappSessionId } from '../../../domain/value-object/WhatsappSessionId';
import { PhoneNumber } from '../../../domain/value-object/PhoneNumber';
import {
  WhatsappSessionStatus,
  WhatsappSessionStatusValues,
} from '../../../domain/value-object/WhatsappSessionStatus';

@Injectable()
export class InMemoryWhatsappSessionRepository
  implements WhatsappSessionRepository
{
  private store = new Map<string, WhatsappSession>();

  async save(session: WhatsappSession): Promise<void> {
    this.store.set(session.id.value, session);
  }

  async findById(id: WhatsappSessionId): Promise<WhatsappSession | null> {
    return this.store.get(id.value) ?? null;
  }

  async findByPhoneNumber(
    phoneNumber: PhoneNumber,
  ): Promise<WhatsappSession | null> {
    for (const session of this.store.values()) {
      if (session.phoneNumber.value === phoneNumber.value) {
        return session;
      }
    }
    return null;
  }

  async findAll(): Promise<WhatsappSession[]> {
    return [...this.store.values()];
  }

  async delete(id: WhatsappSessionId): Promise<void> {
    this.store.delete(id.value);
  }

  async updateStatus(id: WhatsappSessionId, status: string): Promise<void> {
    const session = this.store.get(id.value);
    if (session) {
      (session as any).status = new WhatsappSessionStatus(
        status as WhatsappSessionStatusValues,
      );
      this.store.set(id.value, session);
    }
  }

  async updateConnectionState(
    id: WhatsappSessionId,
    state: string,
  ): Promise<void> {
    const session = this.store.get(id.value);
    if (session) {
      session.updateConnectionState(state);
      this.store.set(id.value, session);
    }
  }

  async updateQrCode(id: WhatsappSessionId, qrCode: string): Promise<void> {
    const session = this.store.get(id.value);
    if (session) {
      session.updateQrCode(qrCode);
      this.store.set(id.value, session);
    }
  }
}
