import { AccountCreatedDomainEvent } from 'src/context/identity/domain/events/AccountCreatedDomainEvent';

describe('AccountCreatedDomainEvent', () => {
    it('should create event with correct properties', () => {
        const event = new AccountCreatedDomainEvent({
            aggregateId: '123',
            email: 'test@example.com',
        });

        expect(event.aggregateId).toBe('123');
        expect(event.email).toBe('test@example.com');
        expect(event.eventName).toBe(AccountCreatedDomainEvent.EVENT_NAME);
    });

    it('should convert to primitives', () => {
        const event = new AccountCreatedDomainEvent({
            aggregateId: '123',
            email: 'test@example.com',
        });
        expect(event.toPrimitives()).toEqual({ email: 'test@example.com' });
    });

    it('should create from primitives', () => {
        const date = new Date();
        const event = AccountCreatedDomainEvent.fromPrimitives({
            aggregateId: '123',
            eventId: '456',
            occurredOn: date,
            attributes: { email: 'test@example.com' },
        });

        expect(event.aggregateId).toBe('123');
        expect(event.email).toBe('test@example.com');
    });
});
