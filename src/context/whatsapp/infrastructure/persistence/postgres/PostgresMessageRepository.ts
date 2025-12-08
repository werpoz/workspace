import { Inject, Injectable } from '@nestjs/common';
import { asc, count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';
import { MessageRepository } from '../../../domain/interface/MessageRepository';
import { Message } from '../../../domain/Message';
import { MessageId } from '../../../domain/value-object/MessageId';
import { PhoneNumber } from '../../../domain/value-object/PhoneNumber';
import {
  MessageType,
  MessageTypeValues,
} from '../../../domain/value-object/MessageType';
import { MessageContent } from '../../../domain/value-object/MessageContent';
import { MessageTimestamp } from '../../../domain/value-object/MessageTimestamp';
import {
  MessageDirection,
  MessageDirectionValues,
} from '../../../domain/value-object/MessageDirection';

type MessageRow = typeof schema.whatsappMessages.$inferSelect;

@Injectable()
export class PostgresMessageRepository implements MessageRepository {
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async save(message: Message): Promise<void> {
    const primitives = message.toPrimitives();
    const key = primitives.key ?? { id: null, remoteJid: null, fromMe: null };

    await this.db
      .insert(schema.whatsappMessages)
      .values({
        id: primitives.id,
        sessionId: primitives.sessionId,
        fromNumber: primitives.from,
        toNumber: primitives.to,
        type: primitives.type,
        content:
          typeof primitives.content === 'string'
            ? primitives.content
            : JSON.stringify(primitives.content),
        timestamp: primitives.timestamp,
        direction: primitives.direction,
        keyId: key?.id ?? null,
        keyRemoteJid: key?.remoteJid ?? null,
        keyFromMe: key?.fromMe ?? null,
        status: primitives.status ?? null,
      })
      .onConflictDoUpdate({
        target: schema.whatsappMessages.id,
        set: {
          status: primitives.status ?? null,
          content:
            typeof primitives.content === 'string'
              ? primitives.content
              : JSON.stringify(primitives.content),
          direction: primitives.direction,
          timestamp: primitives.timestamp,
        },
      });
  }

  async findById(id: MessageId): Promise<Message | null> {
    const [row] = await this.db
      .select()
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.id, id.value))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async findBySessionId(sessionId: string): Promise<Message[]> {
    const rows = await this.db
      .select()
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.sessionId, sessionId))
      .orderBy(asc(schema.whatsappMessages.timestamp));

    return rows.map((row) => this.mapRowToDomain(row));
  }

  async findByFrom(phoneNumber: PhoneNumber): Promise<Message[]> {
    const rows = await this.db
      .select()
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.fromNumber, phoneNumber.value))
      .orderBy(desc(schema.whatsappMessages.timestamp));

    return rows.map((row) => this.mapRowToDomain(row));
  }

  async findByTo(phoneNumber: PhoneNumber): Promise<Message[]> {
    const rows = await this.db
      .select()
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.toNumber, phoneNumber.value))
      .orderBy(desc(schema.whatsappMessages.timestamp));

    return rows.map((row) => this.mapRowToDomain(row));
  }

  async findByKeyId(keyId: string): Promise<Message | null> {
    const [row] = await this.db
      .select()
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.keyId, keyId))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async updateStatus(id: MessageId, status: string): Promise<void> {
    await this.db
      .update(schema.whatsappMessages)
      .set({ status })
      .where(eq(schema.whatsappMessages.id, id.value));
  }

  async delete(id: MessageId): Promise<void> {
    await this.db
      .delete(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.id, id.value));
  }

  async countBySession(sessionId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.sessionId, sessionId));

    return Number(row?.value ?? 0);
  }

  private mapRowToDomain(row: MessageRow): Message {
    const direction = new MessageDirection(
      row.direction as MessageDirectionValues,
    );
    const type = new MessageType(row.type as MessageTypeValues);

    return new Message(
      new MessageId(row.id),
      row.sessionId,
      new PhoneNumber(row.fromNumber),
      new PhoneNumber(row.toNumber),
      type,
      new MessageContent(row.content),
      MessageTimestamp.fromMillis(row.timestamp.getTime()),
      direction,
      row.keyId
        ? {
            id: row.keyId,
            remoteJid: row.keyRemoteJid ?? '',
            fromMe: Boolean(row.keyFromMe),
          }
        : undefined,
      row.status ?? undefined,
    );
  }
}
