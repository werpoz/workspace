import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class IdentityCreatedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'identity.created';

  constructor(params: { aggregateId: string; provider?: string }) {
    super({
      eventName: IdentityCreatedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.provider = params.provider;
  }

  readonly provider?: string;

  toPrimitives() {
    return { provider: this.provider };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new IdentityCreatedDomainEvent({
      aggregateId: params.aggregateId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      provider: params.attributes?.provider,
    });
  }
}
