import { DomainEvent } from './DomainEvent';

export interface DomainEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}
