import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { POSTGRES_POOL } from './postgres.provider';
import * as schema from './drizzle/schema';

export const DRIZZLE_ORM = 'DRIZZLE_ORM';

export const drizzleProvider: Provider = {
  provide: DRIZZLE_ORM,
  inject: [POSTGRES_POOL],
  useFactory: (pool: Pool) => drizzle(pool, { schema }),
};
