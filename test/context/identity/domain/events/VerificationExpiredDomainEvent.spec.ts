import { VerificationExpiredDomainEvent } from 'src/context/identity/domain/events/VerificationExpiredDomainEvent';

describe('VerificationExpiredDomainEvent', () => {
    it('should create event with all properties', () => {
        const event = new VerificationExpiredDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            accountId: '550e8400-e29b-41d4-a716-446655440002',
            verificationId: '550e8400-e29b-41d4-a716-446655440003',
        });

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.accountId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.verificationId).toBe('550e8400-e29b-41d4-a716-446655440003');
        expect(event.eventName).toBe('verification.expired');
        expect(event.eventId).toBeDefined();
        expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with custom eventId and occurredOn', () => {
        const customEventId = '550e8400-e29b-41d4-a716-446655440004';
        const customDate = new Date('2024-01-01');

        const event = new VerificationExpiredDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            accountId: '550e8400-e29b-41d4-a716-446655440002',
            verificationId: '550e8400-e29b-41d4-a716-446655440003',
            eventId: customEventId,
            occurredOn: customDate,
        });

        expect(event.eventId).toBe(customEventId);
        expect(event.occurredOn).toBe(customDate);
    });

    it('should convert to primitives correctly', () => {
        const event = new VerificationExpiredDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            accountId: '550e8400-e29b-41d4-a716-446655440002',
            verificationId: '550e8400-e29b-41d4-a716-446655440003',
        });

        const primitives = event.toPrimitives();

        expect(primitives.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(primitives.accountId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(primitives.verificationId).toBe('550e8400-e29b-41d4-a716-446655440003');
    });

    it('should reconstruct from primitives', () => {
        const params = {
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            eventId: '550e8400-e29b-41d4-a716-446655440004',
            occurredOn: new Date('2024-01-01'),
            attributes: {
                aggregateId: '550e8400-e29b-41d4-a716-446655440001',
                accountId: '550e8400-e29b-41d4-a716-446655440002',
                verificationId: '550e8400-e29b-41d4-a716-446655440003',
            },
        };

        const event = VerificationExpiredDomainEvent.fromPrimitives(params);

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.accountId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.verificationId).toBe('550e8400-e29b-41d4-a716-446655440003');
        expect(event.eventId).toBe('550e8400-e29b-41d4-a716-446655440004');
    });

    it('should have correct EVENT_NAME', () => {
        expect(VerificationExpiredDomainEvent.EVENT_NAME).toBe('verification.expired');
    });
});

