import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';
import { Nullable } from 'src/context/shared/domain/Nullable';
import { Account } from '../../../domain/Account';
import { AccountRepository } from '../../../domain/interface/AccountRepository';
import { AccountID } from '../../../domain/value-object/AccountID.vo';
import { Email } from '../../../domain/value-object/Email.vo';
import { Password } from '../../../domain/value-object/Password.vo';
import { AccountStatus } from '../../../domain/value-object/AccountStatus.vo';

type AccountRow = typeof schema.accounts.$inferSelect;

@Injectable()
export class DrizzleAccountRepository implements AccountRepository {
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async save(account: Account): Promise<void> {
    const data = account.toPrimitives();

    await this.db
      .insert(schema.accounts)
      .values({
        id: data.id,
        email: data.email,
        password: data.password,
        status: data.status,
      })
      .onConflictDoUpdate({
        target: schema.accounts.id,
        set: {
          email: data.email,
          password: data.password,
          status: data.status,
        },
      });
  }

  async searchById(id: string): Promise<Nullable<Account>> {
    const [row] = await this.db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, id))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async searchByEmail(email: string): Promise<Nullable<Account>> {
    const [row] = await this.db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.email, email))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async update(account: Account): Promise<void> {
    const data = account.toPrimitives();
    await this.db
      .update(schema.accounts)
      .set({
        email: data.email,
        password: data.password,
        status: data.status,
      })
      .where(eq(schema.accounts.id, data.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.accounts).where(eq(schema.accounts.id, id));
  }

  private mapRowToDomain(row: AccountRow): Account {
    return new Account(
      new AccountID(row.id),
      row.password ? new Password(row.password) : null,
      new Email(row.email),
      new AccountStatus(row.status as any),
    );
  }
}
