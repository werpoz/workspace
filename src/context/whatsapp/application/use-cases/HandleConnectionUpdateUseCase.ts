import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { WhatsappSessionRepository } from '../../domain/interface/WhatsappSessionRepository';
import { WhatsappSessionId } from '../../domain/value-object/WhatsappSessionId';
import { WhatsappSessionStatusValues } from '../../domain/value-object/WhatsappSessionStatus';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';

type ConnectionUpdateCommand = {
  sessionId: string;
  state: string;
  qr?: string;
  reason?: string;
};

@Injectable()
export class HandleConnectionUpdateUseCase {
  constructor(
    @Inject('WhatsappSessionRepository')
    private readonly sessions: WhatsappSessionRepository,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(command: ConnectionUpdateCommand): Promise<void> {
    const sessionId = new WhatsappSessionId(command.sessionId);
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Whatsapp session not found');
    }

    if (command.state === 'open' || command.state === 'connected') {
      session.connect(command.qr);
    } else if (command.state === 'close' || command.state === 'disconnected') {
      session.disconnect(command.reason);
    } else if (command.state === 'qr') {
      session.updateQrCode(command.qr ?? '');
      session.updateConnectionState('qr');
    } else {
      session.updateConnectionState(command.state);
    }

    // Persist status changes
    await this.sessions.save(session);
    await this.sessions.updateStatus(
      sessionId,
      session.getStatus().value as WhatsappSessionStatusValues,
    );
    await this.eventBus.publishAll(session.pullDomainEvents());
  }
}
