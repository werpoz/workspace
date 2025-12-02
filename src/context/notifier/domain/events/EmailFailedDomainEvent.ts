import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class EmailFailedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'email.failed';

  constructor(params: { aggregateId: string; to: string; error: string }) {
    super({
      eventName: EmailFailedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.to = params.to;
    this.error = params.error;
  }

  readonly to: string;
  readonly error: string;

  toPrimitives() {
    return {
      to: this.to,
      error: this.error,
    };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new EmailFailedDomainEvent({
      aggregateId: params.aggregateId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      to: params.attributes?.to,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      error: params.attributes?.error,
    });
  }
}
