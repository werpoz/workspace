import { Inject, Injectable } from '@nestjs/common';
import type { MessageRepository } from '../../domain/interface/MessageRepository';
import { Message } from '../../domain/Message';

type SyncHistoryQuery = {
  sessionId: string;
};

@Injectable()
export class SyncHistoryUseCase {
  constructor(
    @Inject('MessageRepository')
    private readonly messages: MessageRepository,
  ) {}

  async execute(query: SyncHistoryQuery): Promise<Message[]> {
    return this.messages.findBySessionId(query.sessionId);
  }
}
