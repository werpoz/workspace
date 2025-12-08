import { Chat } from '../Chat';

export interface ChatRepository {
  upsertMany(chats: Chat[]): Promise<void>;
  findAll(): Promise<Chat[]>;
}
