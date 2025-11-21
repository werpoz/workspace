import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { IdentityCreatedDomainEvent } from '../../domain/events/IdentityCreatedDomainEvent';

@EventsHandler(IdentityCreatedDomainEvent)
@Injectable()
export class IdentityCreatedHandler
  implements IEventHandler<IdentityCreatedDomainEvent> {
  handle(event: IdentityCreatedDomainEvent) {
    console.log(
      '[IdentityCreatedHandler] identity created:',
      event.aggregateId,
      event.toPrimitives(),
    );
  }
}
