import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, lt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';
import { Nullable } from 'src/context/shared/domain/Nullable';
import { EmailVerification } from '../../../domain/EmailVerification';
import { EmailVerificationRepository } from '../../../domain/interface/EmailVerificationRepository';

type VerificationRow = typeof schema.emailVerifications.$inferSelect;

@Injectable()
export class DrizzleEmailVerificationRepository
  implements EmailVerificationRepository
{
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async save(verification: EmailVerification): Promise<void> {
    const data = verification.toPrimitives();

    await this.db
      .insert(schema.emailVerifications)
      .values({
        id: data.id,
        accountId: data.accountId,
        method: data.method,
        token: data.token,
        code: data.code,
        expiresAt: new Date(data.expiresAt),
        attempts: data.attempts,
        verified: data.verified,
        verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
      })
      .onConflictDoUpdate({
        target: schema.emailVerifications.id,
        set: {
          method: data.method,
          token: data.token,
          code: data.code,
          expiresAt: new Date(data.expiresAt),
          attempts: data.attempts,
          verified: data.verified,
          verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
        },
      });
  }

  async findById(id: string): Promise<Nullable<EmailVerification>> {
    const [row] = await this.db
      .select()
      .from(schema.emailVerifications)
      .where(eq(schema.emailVerifications.id, id))
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async findByToken(token: string): Promise<Nullable<EmailVerification>> {
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(schema.emailVerifications)
      .where(
        and(
          eq(schema.emailVerifications.token, token),
          eq(schema.emailVerifications.verified, false),
          gt(schema.emailVerifications.expiresAt, now),
          lt(schema.emailVerifications.attempts, 3),
        ),
      )
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async findByAccountIdAndCode(
    accountId: string,
    code: string,
  ): Promise<Nullable<EmailVerification>> {
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(schema.emailVerifications)
      .where(
        and(
          eq(schema.emailVerifications.accountId, accountId),
          eq(schema.emailVerifications.code, code),
          eq(schema.emailVerifications.verified, false),
          gt(schema.emailVerifications.expiresAt, now),
          lt(schema.emailVerifications.attempts, 3),
        ),
      )
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async findActiveByAccountId(
    accountId: string,
  ): Promise<Nullable<EmailVerification>> {
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(schema.emailVerifications)
      .where(
        and(
          eq(schema.emailVerifications.accountId, accountId),
          eq(schema.emailVerifications.verified, false),
          gt(schema.emailVerifications.expiresAt, now),
          lt(schema.emailVerifications.attempts, 3),
        ),
      )
      .limit(1);

    return row ? this.mapRowToDomain(row) : null;
  }

  async findUnverifiedAccountsOlderThan(
    hours: number,
  ): Promise<EmailVerification[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const rows = await this.db
      .select()
      .from(schema.emailVerifications)
      .where(
        and(
          eq(schema.emailVerifications.verified, false),
          lt(schema.emailVerifications.expiresAt, cutoff),
        ),
      );

    return rows.map((row) => this.mapRowToDomain(row));
  }

  private mapRowToDomain(row: VerificationRow): EmailVerification {
    return EmailVerification.fromPrimitives({
      id: row.id,
      accountId: row.accountId,
      method: row.method,
      token: row.token,
      code: row.code,
      expiresAt: row.expiresAt.toISOString(),
      attempts: row.attempts,
      verified: row.verified,
      verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
    });
  }
}
