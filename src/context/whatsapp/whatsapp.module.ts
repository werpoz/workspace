import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventBusModule } from '../shared/eventBus.module';
import { DatabaseModule } from '../shared/infrastructure/database/database.module';
import { PostgresMessageRepository } from './infrastructure/persistence/postgres/PostgresMessageRepository';
import { PostgresWhatsappSessionRepository } from './infrastructure/persistence/postgres/PostgresWhatsappSessionRepository';
import { InMemoryMessageRepository } from './infrastructure/persistence/memory/InMemoryMessageRepository';
import { InMemoryWhatsappSessionRepository } from './infrastructure/persistence/memory/InMemoryWhatsappSessionRepository';

@Module({
  imports: [ConfigModule, EventBusModule, DatabaseModule],
  providers: [
    // base providers para DI
    PostgresMessageRepository,
    PostgresWhatsappSessionRepository,
    InMemoryMessageRepository,
    InMemoryWhatsappSessionRepository,
    {
      provide: 'MessageRepository',
      useFactory: (
        config: ConfigService,
        pg: PostgresMessageRepository,
        memory: InMemoryMessageRepository,
      ) =>
        (config.get<string>('NODE_ENV') ?? process.env.NODE_ENV) === 'dev'
          ? memory
          : pg,
      inject: [
        ConfigService,
        PostgresMessageRepository,
        InMemoryMessageRepository,
      ],
    },
    {
      provide: 'WhatsappSessionRepository',
      useFactory: (
        config: ConfigService,
        pg: PostgresWhatsappSessionRepository,
        memory: InMemoryWhatsappSessionRepository,
      ) =>
        (config.get<string>('NODE_ENV') ?? process.env.NODE_ENV) === 'dev'
          ? memory
          : pg,
      inject: [
        ConfigService,
        PostgresWhatsappSessionRepository,
        InMemoryWhatsappSessionRepository,
      ],
    },
  ],
  exports: ['MessageRepository', 'WhatsappSessionRepository'],
})
export class WhatsappModule {}
