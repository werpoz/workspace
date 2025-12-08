import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../../domain/interface/MessageRepository';
import { Message } from '../../../domain/Message';
import { MessageId } from '../../../domain/value-object/MessageId';
import { PhoneNumber } from '../../../domain/value-object/PhoneNumber';

@Injectable()
export class InMemoryMessageRepository implements MessageRepository {
  private store = new Map<string, Message>();

  async save(message: Message): Promise<void> {
    this.store.set(message.id.value, message);
  }

  async findById(id: MessageId): Promise<Message | null> {
    return this.store.get(id.value) ?? null;
  }

  async findBySessionId(sessionId: string): Promise<Message[]> {
    return [...this.store.values()].filter(
      (m) => m.sessionId === sessionId,
    );
  }

  async findByFrom(phoneNumber: PhoneNumber): Promise<Message[]> {
    return [...this.store.values()].filter(
      (m) => m.from.value === phoneNumber.value,
    );
  }

  async findByTo(phoneNumber: PhoneNumber): Promise<Message[]> {
    return [...this.store.values()].filter(
      (m) => m.to.value === phoneNumber.value,
    );
  }

  async findByKeyId(keyId: string): Promise<Message | null> {
    for (const message of this.store.values()) {
      if (message.key?.id === keyId) {
        return message;
      }
    }
    return null;
  }

  async updateStatus(id: MessageId, status: string): Promise<void> {
    const message = this.store.get(id.value);
    if (message) {
      (message as any).status = status;
      this.store.set(id.value, message);
    }
  }

  async delete(id: MessageId): Promise<void> {
    this.store.delete(id.value);
  }

  async countBySession(sessionId: string): Promise<number> {
    return [...this.store.values()].filter(
      (m) => m.sessionId === sessionId,
    ).length;
  }
}
