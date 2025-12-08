import { Inject, Injectable } from '@nestjs/common';
import type { WhatsappSessionRepository } from '../../domain/interface/WhatsappSessionRepository';
import { PhoneNumber } from '../../domain/value-object/PhoneNumber';
import { WhatsappSession } from '../../domain/WhatsappSession';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';

type StartSessionCommand = {
  phoneNumber: string;
};

@Injectable()
export class StartSessionUseCase {
  constructor(
    @Inject('WhatsappSessionRepository')
    private readonly sessions: WhatsappSessionRepository,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(command: StartSessionCommand): Promise<WhatsappSession> {
    const phone = new PhoneNumber(command.phoneNumber);

    const existing = await this.sessions.findByPhoneNumber(phone);
    if (existing) {
      return existing;
    }

    const session = WhatsappSession.create(phone);
    await this.sessions.save(session);
    await this.eventBus.publishAll(session.pullDomainEvents());

    return session;
  }
}
