import { Injectable, Inject } from '@nestjs/common';
import type { EmailSender } from '../domain/interface/EmailSender';
import { EmailMessage } from '../domain/EmailMessage';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { EmailSentDomainEvent } from '../domain/events/EmailSentDomainEvent';
import { EmailFailedDomainEvent } from '../domain/events/EmailFailedDomainEvent';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';

@Injectable()
export class SendEmailUseCase {
  constructor(
    @Inject('EmailSender')
    private readonly emailSender: EmailSender,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(params: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    const message = EmailMessage.fromPrimitives(params);
    const eventId = Uuid.random().value;

    try {
      await this.emailSender.send(message);

      // Publish success event
      const successEvent = new EmailSentDomainEvent({
        aggregateId: eventId,
        to: params.to,
        subject: params.subject,
      });

      await this.eventBus.publishAll([successEvent]);
    } catch (error) {
      const failureEvent = new EmailFailedDomainEvent({
        aggregateId: eventId,
        to: params.to,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.eventBus.publishAll([failureEvent]);

      throw error;
    }
  }
}
