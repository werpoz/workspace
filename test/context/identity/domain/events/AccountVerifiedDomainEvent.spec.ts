import { AccountVerifiedDomainEvent } from 'src/context/identity/domain/events/AccountVerifiedDomainEvent';

describe('AccountVerifiedDomainEvent', () => {
    it('should create event with all properties', () => {
        const event = new AccountVerifiedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            verifiedAt: '2024-01-01T00:00:00.000Z',
        });

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.email).toBe('test@example.com');
        expect(event.eventName).toBe('account.verified');
        expect(event.eventId).toBeDefined();
        expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with custom eventId and occurredOn', () => {
        const customEventId = '550e8400-e29b-41d4-a716-446655440002';
        const customDate = new Date('2024-01-01');

        const event = new AccountVerifiedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            verifiedAt: '2024-01-01T00:00:00.000Z',
            eventId: customEventId,
            occurredOn: customDate,
        });

        expect(event.eventId).toBe(customEventId);
        expect(event.occurredOn).toBe(customDate);
    });

    it('should convert to primitives correctly', () => {
        const event = new AccountVerifiedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            verifiedAt: '2024-01-01T00:00:00.000Z',
        });

        const primitives = event.toPrimitives();

        expect(primitives.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(primitives.email).toBe('test@example.com');
    });

    it('should reconstruct from primitives', () => {
        const params = {
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            eventId: '550e8400-e29b-41d4-a716-446655440002',
            occurredOn: new Date('2024-01-01'),
            attributes: {
                aggregateId: '550e8400-e29b-41d4-a716-446655440001',
                email: 'test@example.com',
                verifiedAt: '2024-01-01T00:00:00.000Z',
            },
        };

        const event = AccountVerifiedDomainEvent.fromPrimitives(params);

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.email).toBe('test@example.com');
        expect(event.eventId).toBe('550e8400-e29b-41d4-a716-446655440002');
    });

    it('should have correct EVENT_NAME', () => {
        expect(AccountVerifiedDomainEvent.EVENT_NAME).toBe('account.verified');
    });
});
