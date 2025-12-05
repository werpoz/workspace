import { AccountVerificationRequestedDomainEvent } from 'src/context/identity/domain/events/AccountVerificationRequestedDomainEvent';

describe('AccountVerificationRequestedDomainEvent', () => {
    it('should create event with all properties', () => {
        const event = new AccountVerificationRequestedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            method: 'email_code',
            verificationId: '550e8400-e29b-41d4-a716-446655440002',
            code: '123456',
        });

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.email).toBe('test@example.com');
        expect(event.method).toBe('email_code');
        expect(event.verificationId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.code).toBe('123456');
        expect(event.eventName).toBe('account.verification.requested');
        expect(event.eventId).toBeDefined();
        expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with custom eventId and occurredOn', () => {
        const customEventId = '550e8400-e29b-41d4-a716-446655440003';
        const customDate = new Date('2024-01-01');

        const event = new AccountVerificationRequestedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            method: 'email_link',
            verificationId: '550e8400-e29b-41d4-a716-446655440002',
            token: 'abc-def-ghi',
            eventId: customEventId,
            occurredOn: customDate,
        });

        expect(event.eventId).toBe(customEventId);
        expect(event.occurredOn).toBe(customDate);
    });

    it('should convert to primitives correctly', () => {
        const event = new AccountVerificationRequestedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
            method: 'email_code',
            verificationId: '550e8400-e29b-41d4-a716-446655440002',
            code: '123456',
        });

        const primitives = event.toPrimitives();

        expect(primitives.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(primitives.email).toBe('test@example.com');
        expect(primitives.method).toBe('email_code');
        expect(primitives.verificationId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(primitives.code).toBe('123456');
    });

    it('should reconstruct from primitives', () => {
        const params = {
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            eventId: '550e8400-e29b-41d4-a716-446655440003',
            occurredOn: new Date('2024-01-01'),
            attributes: {
                aggregateId: '550e8400-e29b-41d4-a716-446655440001',
                email: 'test@example.com',
                method: 'email_code' as const,
                verificationId: '550e8400-e29b-41d4-a716-446655440002',
                code: '123456',
            },
        };

        const event = AccountVerificationRequestedDomainEvent.fromPrimitives(params);

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.email).toBe('test@example.com');
        expect(event.method).toBe('email_code');
        expect(event.verificationId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.code).toBe('123456');
        expect(event.eventId).toBe('550e8400-e29b-41d4-a716-446655440003');
    });

    it('should have correct EVENT_NAME', () => {
        expect(AccountVerificationRequestedDomainEvent.EVENT_NAME).toBe('account.verification.requested');
    });
});
