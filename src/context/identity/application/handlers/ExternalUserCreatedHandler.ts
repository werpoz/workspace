import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ExternalUserCreatedEvent } from '../events/ExternalUserCreatedEvent';
import { RegisterExternalAccountUseCase } from '../RegisterExternalAccountUseCase';

@EventsHandler(ExternalUserCreatedEvent)
export class EmailCreatedHandler
  implements IEventHandler<ExternalUserCreatedEvent>
{
  constructor(
    private readonly accountRepository: RegisterExternalAccountUseCase,
  ) {}

  async handle(event: ExternalUserCreatedEvent): Promise<void> {
    await this.accountRepository.execute(event.email);
  }
}
