import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../../domain/interface/ChatRepository';
import { Chat } from '../../../domain/Chat';

@Injectable()
export class InMemoryChatRepository implements ChatRepository {
  private store = new Map<string, Chat>();

  async upsertMany(chats: Chat[]): Promise<void> {
    chats.forEach((c) => this.store.set(c.id, c));
  }

  async findAll(): Promise<Chat[]> {
    return [...this.store.values()];
  }
}
