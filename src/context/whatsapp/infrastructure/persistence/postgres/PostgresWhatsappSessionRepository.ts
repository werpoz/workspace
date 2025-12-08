import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';
import { WhatsappSessionRepository } from '../../../domain/interface/WhatsappSessionRepository';
import { WhatsappSession } from '../../../domain/WhatsappSession';
import { WhatsappSessionId } from '../../../domain/value-object/WhatsappSessionId';
import {
  WhatsappSessionStatus,
  WhatsappSessionStatusValues,
} from '../../../domain/value-object/WhatsappSessionStatus';
import { PhoneNumber } from '../../../domain/value-object/PhoneNumber';

type SessionRow = typeof schema.whatsappSessions.$inferSelect;

@Injectable()
export class PostgresWhatsappSessionRepository
  implements WhatsappSessionRepository
{
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async save(session: WhatsappSession): Promise<void> {
    const primitives = session.toPrimitives();

    await this.db
      .insert(schema.whatsappSessions)
      .values({
        id: primitives.id,
        phoneNumber: primitives.phoneNumber,
        status: primitives.status,
        createdAt: primitives.createdAt,
        updatedAt: primitives.updatedAt,
        lastConnectionAt: primitives.lastConnectionAt ?? null,
        lastDisconnectionAt: primitives.lastDisconnectionAt ?? null,
        qrCode: primitives.qrCode ?? null,
        connectionState: primitives.connectionState ?? null,
      })
      .onConflictDoUpdate({
        target: schema.whatsappSessions.id,
        set: {
          status: primitives.status,
          updatedAt: primitives.updatedAt,
          lastConnectionAt: primitives.lastConnectionAt ?? null,
          lastDisconnectionAt: primitives.lastDisconnectionAt ?? null,
          qrCode: primitives.qrCode ?? null,
          connectionState: primitives.connectionState ?? null,
        },
      });
  }

  async findById(id: WhatsappSessionId): Promise<WhatsappSession | null> {
    const [row] = await this.db
      .select()
      .from(schema.whatsappSessions)
      .where(eq(schema.whatsappSessions.id, id.value))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async findByPhoneNumber(
    phoneNumber: PhoneNumber,
  ): Promise<WhatsappSession | null> {
    const [row] = await this.db
      .select()
      .from(schema.whatsappSessions)
      .where(eq(schema.whatsappSessions.phoneNumber, phoneNumber.value))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async findAll(): Promise<WhatsappSession[]> {
    const rows = await this.db
      .select()
      .from(schema.whatsappSessions)
      .orderBy(asc(schema.whatsappSessions.createdAt));

    return rows.map((row) => this.mapRowToDomain(row));
  }

  async delete(id: WhatsappSessionId): Promise<void> {
    await this.db
      .delete(schema.whatsappSessions)
      .where(eq(schema.whatsappSessions.id, id.value));
  }

  async updateStatus(id: WhatsappSessionId, status: string): Promise<void> {
    await this.db
      .update(schema.whatsappSessions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(schema.whatsappSessions.id, id.value));
  }

  async updateConnectionState(
    id: WhatsappSessionId,
    state: string,
  ): Promise<void> {
    await this.db
      .update(schema.whatsappSessions)
      .set({
        connectionState: state,
        updatedAt: new Date(),
      })
      .where(eq(schema.whatsappSessions.id, id.value));
  }

  async updateQrCode(id: WhatsappSessionId, qrCode: string): Promise<void> {
    await this.db
      .update(schema.whatsappSessions)
      .set({
        qrCode,
        updatedAt: new Date(),
      })
      .where(eq(schema.whatsappSessions.id, id.value));
  }

  private mapRowToDomain(row: SessionRow): WhatsappSession {
    return new WhatsappSession(
      new WhatsappSessionId(row.id),
      new PhoneNumber(row.phoneNumber),
      new WhatsappSessionStatus(row.status as WhatsappSessionStatusValues),
      row.createdAt,
      row.updatedAt,
      row.lastConnectionAt ?? undefined,
      row.lastDisconnectionAt ?? undefined,
      row.qrCode ?? undefined,
      row.connectionState ?? undefined,
    );
  }
}
