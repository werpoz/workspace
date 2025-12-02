import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

class MockDomainEvent extends DomainEvent {
  static EVENT_NAME = 'mock.event';

  toPrimitives() {
    return {};
  }
}

describe('DomainEvent', () => {
  it('should create a domain event with required properties', () => {
    const event = new MockDomainEvent({
      eventName: 'mock.event',
      aggregateId: '123',
    });

    expect(event.aggregateId).toBe('123');
    expect(event.eventId).toBeDefined();
    expect(event.occurredOn).toBeDefined();
    expect(event.eventName).toBe('mock.event');
  });

  it('should create a domain event with optional properties', () => {
    const date = new Date();
    const event = new MockDomainEvent({
      eventName: 'mock.event',
      aggregateId: '123',
      eventId: '456',
      occurredOn: date,
    });

    expect(event.aggregateId).toBe('123');
    expect(event.eventId).toBe('456');
    expect(event.occurredOn).toBe(date);
  });
});
