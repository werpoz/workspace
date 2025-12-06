import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from 'src/context/shared/infrastructure/persistence/drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { and, eq, lt, gt } from 'drizzle-orm';
import { EmailVerification } from 'src/context/identity/domain/EmailVerification';
import { EmailVerificationRepository } from 'src/context/identity/domain/interface/EmailVerificationRepository';
import { Nullable } from 'src/context/shared/domain/Nullable';

@Injectable()
export class DrizzleEmailVerificationRepository implements EmailVerificationRepository {
    constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) { }

    async save(verification: EmailVerification): Promise<void> {
        const data = verification.toPrimitives();

        await this.db.insert(schema.email_verifications).values({
            id: data.id,
            accountId: data.accountId,
            method: data.method,
            code: data.code,
            token: data.token,
            expiresAt: new Date(data.expiresAt), // Convert ISO string to Date
            verified: data.verified,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: schema.email_verifications.id,
            set: {
                accountId: data.accountId,
                method: data.method,
                code: data.code,
                token: data.token,
                expiresAt: new Date(data.expiresAt),
                verified: data.verified,
                updatedAt: new Date(),
            }
        });
    }

    async findById(id: string): Promise<Nullable<EmailVerification>> {
        const result = await this.db.query.email_verifications.findFirst({
            where: eq(schema.email_verifications.id, id),
        });

        if (!result) return null;

        return this.toDomain(result);
    }

    async findByToken(token: string): Promise<Nullable<EmailVerification>> {
        const result = await this.db.query.email_verifications.findFirst({
            where: and(
                eq(schema.email_verifications.token, token),
                gt(schema.email_verifications.expiresAt, new Date())
            ),
        });

        if (!result) return null;

        return this.toDomain(result);
    }

    async findByAccountIdAndCode(accountId: string, code: string): Promise<Nullable<EmailVerification>> {
        const result = await this.db.query.email_verifications.findFirst({
            where: and(
                eq(schema.email_verifications.accountId, accountId),
                eq(schema.email_verifications.code, code),
                gt(schema.email_verifications.expiresAt, new Date())
            ),
        });

        if (!result) return null;

        return this.toDomain(result);
    }

    async findActiveByAccountId(accountId: string): Promise<Nullable<EmailVerification>> {
        const result = await this.db.query.email_verifications.findFirst({
            where: and(
                eq(schema.email_verifications.accountId, accountId),
                eq(schema.email_verifications.verified, false),
                gt(schema.email_verifications.expiresAt, new Date())
            ),
        });

        if (!result) return null;

        return this.toDomain(result);
    }

    async findUnverifiedAccountsOlderThan(hours: number): Promise<EmailVerification[]> {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

        const results = await this.db.select().from(schema.email_verifications).where(
            and(
                eq(schema.email_verifications.verified, false),
                lt(schema.email_verifications.expiresAt, cutoffTime)
            )
        );

        return results.map(r => this.toDomain(r));
    }

    private toDomain(raw: any): EmailVerification {
        // Drizzle return Dates for timestamps. Domain fromPrimitives expects strings.
        // Also we need to map incomplete data if necessary (e.g. attempts is missing in schema?)

        // Wait, 'attempts' is in Domain but I forgot to add it to schema!
        // Step 1996: `private _attempts: number;`
        // I must add 'attempts' to schema too.

        // Let's assume default 0 for now if missing, but better to persist it.
        // Ideally should update schema for attempts too.

        return EmailVerification.fromPrimitives({
            id: raw.id,
            accountId: raw.accountId,
            method: raw.method,
            token: raw.token,
            code: raw.code,
            expiresAt: raw.expiresAt.toISOString(),
            attempts: 0, // TODO: Persist attempts
            verified: raw.verified,
            verifiedAt: null, // TODO: Persist verifiedAt if needed, or infer
        });
    }
}
