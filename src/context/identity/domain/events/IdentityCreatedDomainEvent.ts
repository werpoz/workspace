import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class IdentityCreatedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'identity.created';

  constructor(params: { aggregateId: string; accountId?: string }) {
    super({
      eventName: IdentityCreatedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.identityId = params.aggregateId;
    this.accountId = params.accountId;
  }

  readonly identityId?: string;
  readonly accountId?: string;

  toPrimitives() {
    return {
      identityId: this.identityId,
      accountId: this.accountId,
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
      accountId: params.attributes?.accountId,
    });
  }
}
