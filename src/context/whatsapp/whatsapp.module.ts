import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventBusModule } from '../shared/eventBus.module';
import { DatabaseModule } from '../shared/infrastructure/database/database.module';
import { PostgresMessageRepository } from './infrastructure/persistence/postgres/PostgresMessageRepository';
import { PostgresWhatsappSessionRepository } from './infrastructure/persistence/postgres/PostgresWhatsappSessionRepository';
import { InMemoryMessageRepository } from './infrastructure/persistence/memory/InMemoryMessageRepository';
import { InMemoryWhatsappSessionRepository } from './infrastructure/persistence/memory/InMemoryWhatsappSessionRepository';
import { StartSessionUseCase } from './application/use-cases/StartSessionUseCase';
import { HandleConnectionUpdateUseCase } from './application/use-cases/HandleConnectionUpdateUseCase';
import { HandleIncomingMessageUseCase } from './application/use-cases/HandleIncomingMessageUseCase';
import { SendMessageUseCase } from './application/use-cases/SendMessageUseCase';
import { SyncHistoryUseCase } from './application/use-cases/SyncHistoryUseCase';
import { BaileysClientAdapter } from './infrastructure/baileys/BaileysClientAdapter';
import { PostgresAuthSnapshotRepository } from './infrastructure/persistence/postgres/PostgresAuthSnapshotRepository';
import { UpdateMessageStatusUseCase } from './application/use-cases/UpdateMessageStatusUseCase';
import { SessionController } from './infrastructure/http/controller/SessionController';
import { MessageController } from './infrastructure/http/controller/MessageController';
import { WhatsappGateway } from './infrastructure/ws/WhatsappGateway';
import { IdempotencyService } from './infrastructure/idempotency/IdempotencyService';
import { S3MediaStorage } from './infrastructure/storage/S3MediaStorage';

@Module({
  imports: [ConfigModule, EventBusModule, DatabaseModule],
  controllers: [SessionController, MessageController],
  providers: [
    // base providers para DI
    PostgresMessageRepository,
    PostgresWhatsappSessionRepository,
    PostgresAuthSnapshotRepository,
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
    // casos de uso
    StartSessionUseCase,
    HandleConnectionUpdateUseCase,
    HandleIncomingMessageUseCase,
    SendMessageUseCase,
    SyncHistoryUseCase,
    UpdateMessageStatusUseCase,
    // adaptador Baileys
    BaileysClientAdapter,
    WhatsappGateway,
    IdempotencyService,
    S3MediaStorage,
  ],
  exports: [
    'MessageRepository',
    'WhatsappSessionRepository',
    StartSessionUseCase,
    HandleConnectionUpdateUseCase,
    HandleIncomingMessageUseCase,
    SendMessageUseCase,
    SyncHistoryUseCase,
    UpdateMessageStatusUseCase,
    BaileysClientAdapter,
    WhatsappGateway,
    IdempotencyService,
    S3MediaStorage,
  ],
})
export class WhatsappModule {}
