import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class WhatsappSessionDisconnectedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'whatsapp.session.disconnected';

  constructor(params: { aggregateId: string; phoneNumber?: string; reason?: string }) {
    super({
      eventName: WhatsappSessionDisconnectedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.phoneNumber = params.phoneNumber;
    this.reason = params.reason;
  }

  readonly phoneNumber?: string;
  readonly reason?: string;

  toPrimitives() {
    return { 
      phoneNumber: this.phoneNumber,
      reason: this.reason
    };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new WhatsappSessionDisconnectedDomainEvent({
      aggregateId: params.aggregateId,
      phoneNumber: params.attributes?.phoneNumber,
      reason: params.attributes?.reason,
    });
  }
}