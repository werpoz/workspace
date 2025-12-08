import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { postgresProvider } from './postgres.provider';
import { redisProvider } from './redis.provider';
import { drizzleProvider } from './drizzle.provider';

@Module({
  imports: [ConfigModule],
  providers: [postgresProvider, redisProvider, drizzleProvider],
  exports: [postgresProvider, redisProvider, drizzleProvider],
})
export class DatabaseModule {}
