import { Module } from '@nestjs/common';
import { AccountCreatedHandler } from './application/handlers/AccountCreatedHandler';
import { InMemmoryAccountRepository } from './infrastructure/persistence/memmory/InMemmoryAccountRepository';
import { EventBusModule } from '../shared/eventBus.module';
import { EmailCreateEventWebhook } from './infrastructure/http/webhook/EmailCreatedEventWebhook';
import { EmailCreatedHandler } from './application/handlers/ExternalUserCreatedHandler';
import { RegisterExternalAccountUseCase } from './application/RegisterExternalAccountUseCase';
import { InMemmoryIdentityRepository } from './infrastructure/persistence/memmory/InMemmoryIdentityRepository';
import { IdentityCreatedHandler } from './application/handlers/IdentityCreatedHandler';

@Module({
  imports: [EventBusModule],
  controllers: [EmailCreateEventWebhook],
  providers: [
    EmailCreatedHandler,
    AccountCreatedHandler,
    IdentityCreatedHandler,
    RegisterExternalAccountUseCase,
    {
      provide: 'AccountRepository',
      useClass: InMemmoryAccountRepository,
    },
    {
      provide: 'IdentityRepository',
      useClass: InMemmoryIdentityRepository,
    },
  ],
  exports: [],
})
export class IdentityModule {}
