import { DomainEvent } from "src/context/shared/domain/DomainEvent";

export class MessageSentDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'whatsapp.message.sent';

  constructor(params: { 
    aggregateId: string; 
    sessionId?: string; 
    from?: string; 
    to?: string; 
    type?: string; 
    content?: string; 
  }) {
    super({
      eventName: MessageSentDomainEvent.EVENT_NAME,
      aggregateId: params.aggregateId,
    });
    this.sessionId = params.sessionId;
    this.from = params.from;
    this.to = params.to;
    this.type = params.type;
    this.content = params.content;
  }

  readonly sessionId?: string;
  readonly from?: string;
  readonly to?: string;
  readonly type?: string;
  readonly content?: string;

  toPrimitives() {
    return { 
      sessionId: this.sessionId,
      from: this.from,
      to: this.to,
      type: this.type,
      content: this.content
    };
  }

  static fromPrimitives(params: {
    aggregateId: string;
    eventId: string;
    occurredOn: Date;
    attributes: any;
  }) {
    return new MessageSentDomainEvent({
      aggregateId: params.aggregateId,
      sessionId: params.attributes?.sessionId,
      from: params.attributes?.from,
      to: params.attributes?.to,
      type: params.attributes?.type,
      content: params.attributes?.content,
    });
  }
}