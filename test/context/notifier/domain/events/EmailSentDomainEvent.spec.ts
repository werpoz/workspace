import { EmailSentDomainEvent } from 'src/context/notifier/domain/events/EmailSentDomainEvent';

describe('EmailSentDomainEvent', () => {
  it('should create event with correct properties', () => {
    const event = new EmailSentDomainEvent({
      aggregateId: '123',
      to: 'test@example.com',
      subject: 'Test Subject',
    });

    expect(event.aggregateId).toBe('123');
    expect(event.to).toBe('test@example.com');
    expect(event.subject).toBe('Test Subject');
    expect(event.eventName).toBe('email.sent');
    expect(event.eventId).toBeDefined();
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('should convert to primitives', () => {
    const event = new EmailSentDomainEvent({
      aggregateId: '123',
      to: 'test@example.com',
      subject: 'Test Subject',
    });

    const primitives = event.toPrimitives();

    expect(primitives).toEqual({
      to: 'test@example.com',
      subject: 'Test Subject',
    });
  });

  it('should create from primitives', () => {
    const event = EmailSentDomainEvent.fromPrimitives({
      aggregateId: '123',
      eventId: 'event-123',
      occurredOn: new Date(),
      attributes: {
        to: 'test@example.com',
        subject: 'Test Subject',
      },
    });

    expect(event.aggregateId).toBe('123');
    expect(event.to).toBe('test@example.com');
    expect(event.subject).toBe('Test Subject');
  });
});
