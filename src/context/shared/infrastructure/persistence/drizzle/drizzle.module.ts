import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as auctionSchema from '../../../../auction/infrastructure/persistence/drizzle/schema';
import * as identitySchema from '../../../../identity/infrastructure/persistence/drizzle/schema';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
    providers: [
        {
            provide: DRIZZLE,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const connectionString = `postgres://${configService.get('POSTGRES_USER')}:${configService.get('POSTGRES_PASSWORD')}@${configService.get('DB_HOST', 'localhost')}:${configService.get('DB_PORT', 5432)}/${configService.get('POSTGRES_DB')}`;
                const pool = new Pool({
                    connectionString,
                });
                return drizzle(pool, { schema: { ...auctionSchema, ...identitySchema } });
            },
        },
    ],
    exports: [DRIZZLE],
})
export class DrizzleModule { }
