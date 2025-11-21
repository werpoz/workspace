import { IdentityCreatedDomainEvent } from 'src/context/identity/domain/events/IdentityCreatedDomainEvent';

describe('IdentityCreatedDomainEvent', () => {
    it('should create event with correct properties', () => {
        const event = new IdentityCreatedDomainEvent({
            aggregateId: '123',
            provider: 'email',
            externalId: 'ext-123',
        });

        expect(event.aggregateId).toBe('123');
        expect(event.provider).toBe('email');
        expect(event.externalId).toBe('ext-123');
        expect(event.eventName).toBe(IdentityCreatedDomainEvent.EVENT_NAME);
    });

    it('should convert to primitives', () => {
        const event = new IdentityCreatedDomainEvent({
            aggregateId: '123',
            provider: 'email',
            externalId: 'ext-123',
        });
        expect(event.toPrimitives()).toEqual({
            provider: 'email',
            externalId: 'ext-123',
        });
    });

    it('should create from primitives', () => {
        const date = new Date();
        const event = IdentityCreatedDomainEvent.fromPrimitives({
            aggregateId: '123',
            eventId: '456',
            occurredOn: date,
            attributes: { provider: 'email', externalId: 'ext-123' },
        });

        expect(event.aggregateId).toBe('123');
        expect(event.provider).toBe('email');
        expect(event.externalId).toBe('ext-123');
    });
});
