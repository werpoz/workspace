import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AccountCreatedDomainEvent } from '../../domain/events/AccountCreatedDomainEvent';
import { Injectable } from '@nestjs/common';

@EventsHandler(AccountCreatedDomainEvent)
@Injectable()
export class AccountCreatedHandler
  implements IEventHandler<AccountCreatedDomainEvent> {
  handle(event: AccountCreatedDomainEvent) {
    console.log(
      '[AccountCreatedHandler] account created:',
      event.aggregateId,
      event.toPrimitives(),
    );
  }
}
