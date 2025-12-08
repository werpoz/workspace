import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class WhatsappSessionCreatedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'whatsapp.session.created';

  constructor(params: { aggregateId: string; phoneNumber?: string; status?: string }) {
    super({
      eventName: WhatsappSessionCreatedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.phoneNumber = params.phoneNumber;
    this.status = params.status;
  }

  readonly phoneNumber?: string;
  readonly status?: string;

  toPrimitives() {
    return { 
      phoneNumber: this.phoneNumber,
      status: this.status 
    };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new WhatsappSessionCreatedDomainEvent({
      aggregateId: params.aggregateId,
      phoneNumber: params.attributes?.phoneNumber,
      status: params.attributes?.status,
    });
  }
}