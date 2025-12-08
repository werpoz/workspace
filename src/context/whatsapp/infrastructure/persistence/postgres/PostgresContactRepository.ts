import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';
import { ContactRepository } from '../../../domain/interface/ContactRepository';
import { Contact } from '../../../domain/Contact';
import { eq } from 'drizzle-orm';

@Injectable()
export class PostgresContactRepository implements ContactRepository {
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async upsertMany(contacts: Contact[]): Promise<void> {
    if (contacts.length === 0) return;
    const now = new Date();
    for (const contact of contacts) {
      await this.db
        .insert(schema.whatsappContacts)
        .values({
          id: contact.id,
          name: contact.name ?? null,
          pushName: contact.pushName ?? null,
          phone: contact.phone ?? null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.whatsappContacts.id,
          set: {
            name: contact.name ?? null,
            pushName: contact.pushName ?? null,
            phone: contact.phone ?? null,
            updatedAt: now,
          },
        });
    }
  }

  async findAll(): Promise<Contact[]> {
    const rows = await this.db.select().from(schema.whatsappContacts);
    return rows.map(
      (row) =>
        new Contact(row.id, row.name ?? undefined, row.pushName ?? undefined, row.phone ?? undefined),
    );
  }
}
