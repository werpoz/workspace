import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_ORM } from 'src/context/shared/infrastructure/database/drizzle.provider';
import * as schema from 'src/context/shared/infrastructure/database/drizzle/schema';

@Injectable()
export class PostgresAuthSnapshotRepository {
  constructor(
    @Inject(DRIZZLE_ORM)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async saveSnapshot(sessionId: string, creds: any, keys: any): Promise<void> {
    await this.db
      .insert(schema.whatsappAuthSnapshots)
      .values({
        sessionId,
        creds,
        keys,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.whatsappAuthSnapshots.sessionId,
        set: {
          creds,
          keys,
          updatedAt: new Date(),
        },
      });
  }

  async getSnapshot(
    sessionId: string,
  ): Promise<{ creds: any; keys: any } | null> {
    const [row] = await this.db
      .select()
      .from(schema.whatsappAuthSnapshots)
      .where(eq(schema.whatsappAuthSnapshots.sessionId, sessionId))
      .limit(1);

    if (!row) {
      return null;
    }

    return { creds: row.creds, keys: row.keys };
  }
}
