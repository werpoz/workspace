import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class EmailSentDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'email.sent';

  constructor(params: { aggregateId: string; to: string; subject: string }) {
    super({
      eventName: EmailSentDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.to = params.to;
    this.subject = params.subject;
  }

  readonly to: string;
  readonly subject: string;

  toPrimitives() {
    return {
      to: this.to,
      subject: this.subject,
    };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new EmailSentDomainEvent({
      aggregateId: params.aggregateId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      to: params.attributes?.to,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      subject: params.attributes?.subject,
    });
  }
}
