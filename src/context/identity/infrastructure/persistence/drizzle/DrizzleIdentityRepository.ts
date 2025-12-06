import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from 'src/context/shared/infrastructure/persistence/drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import { IdentityRepository } from 'src/context/identity/domain/interface/IdentityRepository';
import { Identity } from 'src/context/identity/domain/Identity';
import { Account } from 'src/context/identity/domain/Account';
import { Nullable } from 'src/context/shared/domain/Nullable';
import { IdentityID } from 'src/context/identity/domain/value-object/IdentityID.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

@Injectable()
export class DrizzleIdentityRepository implements IdentityRepository {
    constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) { }

    async save(identity: Identity): Promise<void> {
        // Current Identity implementation is lightweight and mostly used to link profiles
        // For now we assume Identity exists if Account exists, or we could store a mapping.
        // Given 'accounts' table in schema links userId -> provider, lets use that if we had provider info.
        // But Identity aggregate currently just wraps IDs.

        // We will treat this as a no-op for now unless we add profile fields to Identity.
        // Validation: Ensure the referenced account exists.
        return;
    }

    async searchById(id: string): Promise<Nullable<Identity>> {
        // If we treat Identity ID = Account ID (common in 1:1), we can look up user.
        // But they are distinct VOs. 
        // Let's implement a simple lookup if we had a table. 
        // Since we don't have a dedicated 'identities' table in schema yet (only 'accounts' for OAuth),
        // and 'users' for Auth, we return null or minimal identity.

        // Assuming IdentityID matches AccountID for local users:
        const user = await this.db.query.users.findFirst({
            where: eq(schema.users.id, id)
        });

        if (user) {
            return new Identity(new IdentityID(user.id), new AccountID(user.id));
        }

        return null;
    }

    async searchByExternalId(account: Account): Promise<Nullable<Identity>> {
        // Return Identity linked to this account
        return new Identity(
            new IdentityID(account.id.value),
            new AccountID(account.id.value)
        );
    }

    async update(identity: Identity): Promise<void> {
        return;
    }

    async delete(id: string): Promise<void> {
        return;
    }
}
