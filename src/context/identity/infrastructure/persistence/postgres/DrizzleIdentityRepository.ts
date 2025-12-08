import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';
import { Nullable } from 'src/context/shared/domain/Nullable';
import { Account } from '../../../domain/Account';
import { Identity } from '../../../domain/Identity';
import { IdentityRepository } from '../../../domain/interface/IdentityRepository';
import { AccountID } from '../../../domain/value-object/AccountID.vo';
import { IdentityID } from '../../../domain/value-object/IdentityID.vo';

type IdentityRow = typeof schema.identities.$inferSelect;

@Injectable()
export class DrizzleIdentityRepository implements IdentityRepository {
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async save(identity: Identity): Promise<void> {
    const data = identity.toPrimitives();

    await this.db
      .insert(schema.identities)
      .values({
        id: data.id,
        accountId: data.accountId,
      })
      .onConflictDoUpdate({
        target: schema.identities.id,
        set: {
          accountId: data.accountId,
        },
      });
  }

  async searchById(id: string): Promise<Nullable<Identity>> {
    const [row] = await this.db
      .select()
      .from(schema.identities)
      .where(eq(schema.identities.id, id))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async searchByExternalId(account: Account): Promise<Nullable<Identity>> {
    const [row] = await this.db
      .select()
      .from(schema.identities)
      .where(eq(schema.identities.accountId, account.id.value))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async update(identity: Identity): Promise<void> {
    const data = identity.toPrimitives();
    await this.db
      .update(schema.identities)
      .set({
        accountId: data.accountId,
      })
      .where(eq(schema.identities.id, data.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.identities).where(eq(schema.identities.id, id));
  }

  private mapRowToDomain(row: IdentityRow): Identity {
    return new Identity(new IdentityID(row.id), new AccountID(row.accountId));
  }
}
