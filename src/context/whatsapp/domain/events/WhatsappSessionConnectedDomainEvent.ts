import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class WhatsappSessionConnectedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'whatsapp.session.connected';

  constructor(params: { aggregateId: string; phoneNumber?: string; qrCode?: string }) {
    super({
      eventName: WhatsappSessionConnectedDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.phoneNumber = params.phoneNumber;
    this.qrCode = params.qrCode;
  }

  readonly phoneNumber?: string;
  readonly qrCode?: string;

  toPrimitives() {
    return { 
      phoneNumber: this.phoneNumber,
      qrCode: this.qrCode
    };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new WhatsappSessionConnectedDomainEvent({
      aggregateId: params.aggregateId,
      phoneNumber: params.attributes?.phoneNumber,
      qrCode: params.attributes?.qrCode,
    });
  }
}