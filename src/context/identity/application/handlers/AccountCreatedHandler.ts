import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AccountCreatedDomainEvent } from '../../domain/events/AccountCreatedDomainEvent';
import { Injectable, Logger } from '@nestjs/common';
import { RequestAccountVerificationUseCase } from '../RequestAccountVerificationUseCase';

@EventsHandler(AccountCreatedDomainEvent)
@Injectable()
export class AccountCreatedHandler
  implements IEventHandler<AccountCreatedDomainEvent> {
  private readonly logger = new Logger(AccountCreatedHandler.name);

  constructor(
    private readonly requestVerificationUseCase: RequestAccountVerificationUseCase,
  ) { }

  async handle(event: AccountCreatedDomainEvent) {
    this.logger.log(
      `[AccountCreatedHandler] Account created: ${event.aggregateId}. Triggering verification request.`,
    );

    try {
      await this.requestVerificationUseCase.execute({
        accountId: event.aggregateId,
        method: 'email_code', // Default method
      });
      this.logger.log(
        `[AccountCreatedHandler] Verification requested successfully for account: ${event.aggregateId}`,
      );
    } catch (error) {
      this.logger.error(
        `[AccountCreatedHandler] Failed to request verification for account: ${event.aggregateId}`,
        error,
      );
    }
  }
}

