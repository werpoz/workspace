import { Module } from '@nestjs/common';
import { AccountCreatedHandler } from './application/handlers/AccountCreatedHandler';
import { InMemmoryAccountRepository } from './infrastructure/persistence/memmory/InMemmoryAccountRepository';
import { EventBusModule } from '../shared/eventBus.module';
import { EmailCreateEventWebhook } from './infrastructure/http/webhook/EmailCreatedEventWebhook';
import { EmailCreatedHandler } from './application/handlers/ExternalUserCreatedHandler';
import { RegisterExternalAccountUseCase } from './application/RegisterExternalAccountUseCase';

@Module({
  imports: [EventBusModule],
  controllers: [EmailCreateEventWebhook],
  providers: [
    EmailCreatedHandler,
    AccountCreatedHandler,
    RegisterExternalAccountUseCase,
    {
      provide: 'AccountRepository',
      useClass: InMemmoryAccountRepository,
    },
  ],
  exports: [],
})
export class IdentityModule {}
