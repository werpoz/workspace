import { IdentityCreatedDomainEvent } from 'src/context/identity/domain/events/IdentityCreatedDomainEvent';

describe('IdentityCreatedDomainEvent', () => {
  it('should create event with correct properties', () => {
    const event = new IdentityCreatedDomainEvent({
      aggregateId: '123',
      accountId: '456',
    });

    expect(event.aggregateId).toBe('123');
    expect(event.identityId).toBe('123');
    expect(event.accountId).toBe('456');
    expect(event.eventName).toBe(IdentityCreatedDomainEvent.EVENT_NAME);
  });

  it('should convert to primitives', () => {
    const event = new IdentityCreatedDomainEvent({
      aggregateId: '123',
      accountId: '456',
    });
    expect(event.toPrimitives()).toEqual({
      identityId: '123',
      accountId: '456',
    });
  });

  it('should create from primitives', () => {
    const date = new Date();
    const event = IdentityCreatedDomainEvent.fromPrimitives({
      aggregateId: '123',
      eventId: '456',
      occurredOn: date,
      attributes: { accountId: '789' },
    });

    expect(event.aggregateId).toBe('123');
    expect(event.identityId).toBe('123');
    expect(event.accountId).toBe('789');
  });
});
