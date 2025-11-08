import { Module } from '@nestjs/common';
import { RegisterAccountUseCase } from './application/RegisterAccountUseCase';
import { AccountCreatedHandler } from './application/handlers/AccountCreatedHandler';
import { InMemmoryAccountRepository } from './infrastructure/persistence/memmory/InMemmoryAccountRepository';
import { EventBusModule } from '../shared/eventBus.module';
import { RegisterAccountController } from './infrastructure/http/controller/user.controller';
import { UserCreateEventWebhook } from './infrastructure/http/webhook/UserCreateEventWebhook';

@Module({
  imports: [EventBusModule],
  controllers: [RegisterAccountController, UserCreateEventWebhook],
  providers: [
    RegisterAccountUseCase,
    AccountCreatedHandler,
    {
      provide: 'AccountRepository',
      useClass: InMemmoryAccountRepository,
    },
  ],
  exports: [RegisterAccountUseCase],
})
export class IdentityModule {}
