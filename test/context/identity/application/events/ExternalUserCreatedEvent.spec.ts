import { ExternalUserCreatedEvent } from 'src/context/identity/application/events/ExternalUserCreatedEvent';

describe('ExternalUserCreatedEvent', () => {
    it('should create event with correct properties', () => {
        const event = new ExternalUserCreatedEvent(
            'ext-123',
            'test@example.com',
            'google',
        );

        expect(event.externalId).toBe('ext-123');
        expect(event.email).toBe('test@example.com');
        expect(event.provider).toBe('google');
    });
});
