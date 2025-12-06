import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from 'src/context/shared/infrastructure/persistence/drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import { AccountRepository } from 'src/context/identity/domain/interface/AccountRepository';
import { Account } from 'src/context/identity/domain/Account';
import { Nullable } from 'src/context/shared/domain/Nullable';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { AccountStatus } from 'src/context/identity/domain/value-object/AccountStatus.vo';

@Injectable()
export class DrizzleAccountRepository implements AccountRepository {
    constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) { }

    async save(account: Account): Promise<void> {
        const data = account.toPrimitives();

        await this.db.insert(schema.users).values({
            id: data.id,
            email: data.email,
            password: data.password, // nullable
            status: data.status,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: schema.users.id,
            set: {
                email: data.email,
                password: data.password,
                status: data.status,
                updatedAt: new Date(),
            }
        });
    }

    async searchById(id: string): Promise<Nullable<Account>> {
        const result = await this.db.query.users.findFirst({
            where: eq(schema.users.id, id),
        });

        if (!result) return null;

        return new Account(
            new AccountID(result.id),
            result.password ? new Password(result.password) : null,
            new Email(result.email),
            new AccountStatus(result.status as any)
        );
    }

    async searchByEmail(email: string): Promise<Nullable<Account>> {
        const result = await this.db.query.users.findFirst({
            where: eq(schema.users.email, email),
        });

        if (!result) return null;

        return new Account(
            new AccountID(result.id),
            result.password ? new Password(result.password) : null,
            new Email(result.email),
            new AccountStatus(result.status as any)
        );
    }

    async update(account: Account): Promise<void> {
        await this.save(account);
    }

    async delete(id: string): Promise<void> {
        await this.db.delete(schema.users).where(eq(schema.users.id, id));
    }
}
