import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DomainEventBus } from '../domain/DomainEventBus';
import { DomainEvent } from '../domain/DomainEvent';

@Injectable()
export class NestCqrsEventBus implements DomainEventBus {
  constructor(private readonly eventBus: EventBus) {}

  async publish(event: DomainEvent): Promise<void> {
    this.eventBus.publish(event);
    return Promise.resolve();
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const e of events) {
      this.eventBus.publish(e);
    }
    return Promise.resolve();
  }
}
