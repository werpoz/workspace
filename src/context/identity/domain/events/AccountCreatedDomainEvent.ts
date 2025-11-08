import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class AccountCreatedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'account.created';

  constructor(params: { aggregateId: string; email?: string }) {
    super({
      eventName: AccountCreatedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.email = params.email;
  }

  readonly email?: string;

  toPrimitives() {
    return { email: this.email };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new AccountCreatedDomainEvent({
      aggregateId: params.aggregateId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      email: params.attributes?.email,
    });
  }
}
