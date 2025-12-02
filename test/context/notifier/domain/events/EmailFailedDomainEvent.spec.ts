import { EmailFailedDomainEvent } from 'src/context/notifier/domain/events/EmailFailedDomainEvent';

describe('EmailFailedDomainEvent', () => {
  it('should create event with correct properties', () => {
    const event = new EmailFailedDomainEvent({
      aggregateId: '123',
      to: 'test@example.com',
      error: 'SMTP connection failed',
    });

    expect(event.aggregateId).toBe('123');
    expect(event.to).toBe('test@example.com');
    expect(event.error).toBe('SMTP connection failed');
    expect(event.eventName).toBe('email.failed');
    expect(event.eventId).toBeDefined();
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('should convert to primitives', () => {
    const event = new EmailFailedDomainEvent({
      aggregateId: '123',
      to: 'test@example.com',
      error: 'SMTP connection failed',
    });

    const primitives = event.toPrimitives();

    expect(primitives).toEqual({
      to: 'test@example.com',
      error: 'SMTP connection failed',
    });
  });

  it('should create from primitives', () => {
    const event = EmailFailedDomainEvent.fromPrimitives({
      aggregateId: '123',
      eventId: 'event-123',
      occurredOn: new Date(),
      attributes: {
        to: 'test@example.com',
        error: 'SMTP connection failed',
      },
    });

    expect(event.aggregateId).toBe('123');
    expect(event.to).toBe('test@example.com');
    expect(event.error).toBe('SMTP connection failed');
  });
});
