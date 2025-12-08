import { AggregateRoot } from "src/context/shared/domain/AggregateRoot";
import { MessageId } from "./value-object/MessageId";
import { PhoneNumber } from "./value-object/PhoneNumber";
import { MessageType } from "./value-object/MessageType";
import { MessageContent } from "./value-object/MessageContent";
import { MessageTimestamp } from "./value-object/MessageTimestamp";
import { MessageDirection } from "./value-object/MessageDirection";
import { MessageReceivedDomainEvent } from "./events/MessageReceivedDomainEvent";
import { MessageSentDomainEvent } from "./events/MessageSentDomainEvent";


export class Message extends AggregateRoot {
  constructor(
    public readonly id: MessageId,
    public readonly sessionId: string,
    public readonly from: PhoneNumber,
    public readonly to: PhoneNumber,
    public readonly type: MessageType,
    public readonly content: MessageContent,
    public readonly timestamp: MessageTimestamp,
    public readonly direction: MessageDirection,
    public readonly key?: {
      id: string;
      remoteJid: string;
      fromMe: boolean;
    },
    public readonly status?: string,
    public readonly quotedMessageId?: string,
    public readonly forwardedFromMessageId?: string,
  ) {
    super();
  }

  static createIncoming(
    sessionId: string,
    from: PhoneNumber,
    to: PhoneNumber,
    type: MessageType,
    content: MessageContent,
    key?: {
      id: string;
      remoteJid: string;
      fromMe: boolean;
    }
  ): Message {
    const message = new Message(
      MessageId.random(),
      sessionId,
      from,
      to,
      type,
      content,
      MessageTimestamp.now(),
      MessageDirection.createIncoming(),
      key,
      'received'
    );

    message.record(new MessageReceivedDomainEvent({
      aggregateId: message.id.value,
      sessionId: sessionId,
      from: from.value,
      to: to.value,
      type: type.value,
      content: content.value
    }));

    return message;
  }

  static createOutgoing(
    sessionId: string,
    from: PhoneNumber,
    to: PhoneNumber,
    type: MessageType,
    content: MessageContent,
    key?: {
      id: string;
      remoteJid: string;
      fromMe: boolean;
    },
    quotedMessageId?: string,
    forwardedFromMessageId?: string,
  ): Message {
    const message = new Message(
      MessageId.random(),
      sessionId,
      from,
      to,
      type,
      content,
      MessageTimestamp.now(),
      MessageDirection.createOutgoing(),
      key,
      'pending',
      quotedMessageId,
      forwardedFromMessageId,
    );

    message.record(new MessageSentDomainEvent({
      aggregateId: message.id.value,
      sessionId: sessionId,
      from: from.value,
      to: to.value,
      type: type.value,
      content: content.value
    }));

    return message;
  }

  markAsSent(): void {
    (this as any).status = 'sent';
  }

  markAsDelivered(): void {
    (this as any).status = 'delivered';
  }

  markAsRead(): void {
    (this as any).status = 'read';
  }

  markAsFailed(): void {
    (this as any).status = 'failed';
  }

  toPrimitives() {
    return {
      id: this.id.value,
      sessionId: this.sessionId,
      from: this.from.value,
      to: this.to.value,
      type: this.type.value,
      content: this.content.value,
      timestamp: this.timestamp.value,
      direction: this.direction.value,
      key: this.key,
      status: this.status,
      quotedMessageId: this.quotedMessageId,
      forwardedFromMessageId: this.forwardedFromMessageId,
    };
  }

  // Método para transformar a DTO limpio para frontend
  toDTO() {
    return {
      messageId: this.id.value,
      from: this.from.value,
      type: this.type.value,
      content: this.type.isMedia() ? { url: this.content.value } : this.content.value,
      timestamp: this.timestamp.value.getTime(),
      direction: this.direction.value,
      status: this.status,
      quotedMessageId: this.quotedMessageId,
      forwardedFromMessageId: this.forwardedFromMessageId,
    };
  }
}
