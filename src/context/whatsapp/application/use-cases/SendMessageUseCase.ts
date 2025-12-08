import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { MessageRepository } from '../../domain/interface/MessageRepository';
import type { WhatsappSessionRepository } from '../../domain/interface/WhatsappSessionRepository';
import { Message } from '../../domain/Message';
import { PhoneNumber } from '../../domain/value-object/PhoneNumber';
import {
  MessageType,
  MessageTypeValues,
} from '../../domain/value-object/MessageType';
import { MessageContent } from '../../domain/value-object/MessageContent';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { WhatsappSessionId } from '../../domain/value-object/WhatsappSessionId';

type SendMessageCommand = {
  sessionId: string;
  from: string;
  to: string;
  type: MessageTypeValues;
  content: string;
  clientMessageId?: string;
};

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject('MessageRepository')
    private readonly messages: MessageRepository,
    @Inject('WhatsappSessionRepository')
    private readonly sessions: WhatsappSessionRepository,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(command: SendMessageCommand): Promise<Message> {
    const session = await this.sessions.findById(
      new WhatsappSessionId(command.sessionId),
    );

    if (!session) {
      throw new NotFoundException('Whatsapp session not found');
    }

    const message = Message.createOutgoing(
      command.sessionId,
      new PhoneNumber(command.from),
      new PhoneNumber(command.to),
      new MessageType(command.type),
      new MessageContent(command.content),
      command.clientMessageId
        ? {
            id: command.clientMessageId,
            remoteJid: command.to,
            fromMe: true,
          }
        : undefined,
    );

    await this.messages.save(message);
    await this.eventBus.publishAll(message.pullDomainEvents());

    return message;
  }
}
