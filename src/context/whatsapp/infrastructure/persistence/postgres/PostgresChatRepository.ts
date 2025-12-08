import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';
import { ChatRepository } from '../../../domain/interface/ChatRepository';
import { Chat } from '../../../domain/Chat';

@Injectable()
export class PostgresChatRepository implements ChatRepository {
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async upsertMany(chats: Chat[]): Promise<void> {
    if (!chats.length) return;
    const now = new Date();
    for (const chat of chats) {
      await this.db
        .insert(schema.whatsappChats)
        .values({
          id: chat.id,
          name: chat.name ?? null,
          unreadCount: chat.unreadCount ?? 0,
          lastMessageAt: chat.lastMessageAt ?? null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.whatsappChats.id,
          set: {
            name: chat.name ?? null,
            unreadCount: chat.unreadCount ?? 0,
            lastMessageAt: chat.lastMessageAt ?? null,
            updatedAt: now,
          },
        });
    }
  }

  async findAll(): Promise<Chat[]> {
    const rows = await this.db.select().from(schema.whatsappChats);
    return rows.map(
      (row) =>
        new Chat(
          row.id,
          row.name ?? undefined,
          row.unreadCount ?? undefined,
          row.lastMessageAt ?? undefined,
        ),
    );
  }
}
