import { IEvent } from '@nestjs/cqrs';

export class ExternalUserCreatedEvent implements IEvent {
  constructor(
    public readonly externalId: string,
    public readonly email: string,
    public readonly provider: string,
  ) {}
}
