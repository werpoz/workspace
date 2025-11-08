import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class IdentityCreatedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'identity.created';

  constructor(params: {
    aggregateId: string;
    provider?: string;
    externalId: string | null;
  }) {
    super({
      eventName: IdentityCreatedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.provider = params.provider;
    this.externalId = params.externalId;
  }

  readonly provider?: string;
  readonly externalId?: string | null;

  toPrimitives() {
    return {
      provider: this.provider,
      externalId: this.externalId,
    };
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      externalId: params.attributes?.externalId,
    });
  }
}
