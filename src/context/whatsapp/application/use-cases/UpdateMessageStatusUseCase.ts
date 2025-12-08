import { Inject, Injectable } from '@nestjs/common';
import type { MessageRepository } from '../../domain/interface/MessageRepository';
import { MessageId } from '../../domain/value-object/MessageId';

type UpdateMessageStatusCommand = {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'played' | 'failed';
};

@Injectable()
export class UpdateMessageStatusUseCase {
  constructor(
    @Inject('MessageRepository')
    private readonly messages: MessageRepository,
  ) {}

  async execute(command: UpdateMessageStatusCommand): Promise<void> {
    await this.messages.updateStatus(new MessageId(command.messageId), command.status);
  }
}
