import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ExternalUserCreatedEvent } from '../events/ExternalUserCreatedEvent';
import { RegisterExternalAccountUseCase } from '../RegisterExternalAccountUseCase';

@EventsHandler(ExternalUserCreatedEvent)
export class EmailCreatedHandler
  implements IEventHandler<ExternalUserCreatedEvent>
{
  constructor(
    private readonly registerExternalAccountUseCase: RegisterExternalAccountUseCase,
  ) {}

  async handle(event: ExternalUserCreatedEvent): Promise<void> {
    await this.registerExternalAccountUseCase.execute(
      event.email,
      event.externalId,
      event.provider,
    );
  }
}
