import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const POSTGRES_POOL = 'POSTGRES_POOL';

export const postgresProvider: Provider = {
  provide: POSTGRES_POOL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const pool = new Pool({
      connectionString: configService.get<string>('DATABASE_URL'),
      max: Number(configService.get('DATABASE_POOL_MAX') ?? 10),
      ssl: false,
    });

    pool.on('error', (err) => {
      // surface connection issues early
      console.error('[postgres] pool error', err);
    });

    return pool;
  },
};
