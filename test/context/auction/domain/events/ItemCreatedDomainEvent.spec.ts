import { ItemCreatedDomainEvent } from 'src/context/auction/domain/events/ItemCreatedDomainEvent';

describe('ItemCreatedDomainEvent', () => {
    it('should create event with all properties', () => {
        const event = new ItemCreatedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Vintage Camera',
            ownerId: '550e8400-e29b-41d4-a716-446655440002',
            category: 'electronics',
        });

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.title).toBe('Vintage Camera');
        expect(event.ownerId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.category).toBe('electronics');
        expect(event.eventName).toBe('item.created');
        expect(event.eventId).toBeDefined();
        expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with custom eventId and occurredOn', () => {
        const customEventId = '550e8400-e29b-41d4-a716-446655440003';
        const customDate = new Date('2024-01-01');

        const event = new ItemCreatedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Vintage Camera',
            ownerId: '550e8400-e29b-41d4-a716-446655440002',
            category: 'electronics',
            eventId: customEventId,
            occurredOn: customDate,
        });

        expect(event.eventId).toBe(customEventId);
        expect(event.occurredOn).toBe(customDate);
    });

    it('should convert to primitives correctly', () => {
        const event = new ItemCreatedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Vintage Camera',
            ownerId: '550e8400-e29b-41d4-a716-446655440002',
            category: 'electronics',
        });

        const primitives = event.toPrimitives();

        expect(primitives.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(primitives.title).toBe('Vintage Camera');
        expect(primitives.ownerId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(primitives.category).toBe('electronics');
        expect(primitives.eventName).toBe('item.created');
        expect(primitives.eventId).toBeDefined();
        expect(primitives.occurredOn).toBeInstanceOf(Date);
    });

    it('should reconstruct from primitives', () => {
        const params = {
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            eventId: '550e8400-e29b-41d4-a716-446655440003',
            occurredOn: new Date('2024-01-01'),
            attributes: {
                title: 'Vintage Camera',
                ownerId: '550e8400-e29b-41d4-a716-446655440002',
                category: 'electronics',
            },
        };

        const event = ItemCreatedDomainEvent.fromPrimitives(params);

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.title).toBe('Vintage Camera');
        expect(event.ownerId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.category).toBe('electronics');
        expect(event.eventId).toBe('550e8400-e29b-41d4-a716-446655440003');
        expect(event.occurredOn).toEqual(new Date('2024-01-01'));
    });

    it('should have correct EVENT_NAME', () => {
        expect(ItemCreatedDomainEvent.EVENT_NAME).toBe('item.created');
    });
});
