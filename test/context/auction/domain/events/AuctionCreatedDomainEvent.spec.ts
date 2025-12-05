import { AuctionCreatedDomainEvent } from 'src/context/auction/domain/events/AuctionCreatedDomainEvent';

describe('AuctionCreatedDomainEvent', () => {
    it('should create event with all properties', () => {
        const event = new AuctionCreatedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            itemId: '550e8400-e29b-41d4-a716-446655440002',
            startingPrice: 100,
            endsAt: '2024-12-31T23:59:59.000Z',
        });

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.itemId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.startingPrice).toBe(100);
        expect(event.endsAt).toBe('2024-12-31T23:59:59.000Z');
        expect(event.eventName).toBe('auction.created');
        expect(event.eventId).toBeDefined();
        expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with custom eventId and occurredOn', () => {
        const customEventId = '550e8400-e29b-41d4-a716-446655440003';
        const customDate = new Date('2024-01-01');

        const event = new AuctionCreatedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            itemId: '550e8400-e29b-41d4-a716-446655440002',
            startingPrice: 100,
            endsAt: '2024-12-31T23:59:59.000Z',
            eventId: customEventId,
            occurredOn: customDate,
        });

        expect(event.eventId).toBe(customEventId);
        expect(event.occurredOn).toBe(customDate);
    });

    it('should convert to primitives correctly', () => {
        const event = new AuctionCreatedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            itemId: '550e8400-e29b-41d4-a716-446655440002',
            startingPrice: 100,
            endsAt: '2024-12-31T23:59:59.000Z',
        });

        const primitives = event.toPrimitives();

        expect(primitives.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(primitives.itemId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(primitives.startingPrice).toBe(100);
        expect(primitives.endsAt).toBe('2024-12-31T23:59:59.000Z');
        expect(primitives.eventName).toBe('auction.created');
        expect(primitives.eventId).toBeDefined();
        expect(primitives.occurredOn).toBeInstanceOf(Date);
    });

    it('should reconstruct from primitives', () => {
        const params = {
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            eventId: '550e8400-e29b-41d4-a716-446655440003',
            occurredOn: new Date('2024-01-01'),
            attributes: {
                itemId: '550e8400-e29b-41d4-a716-446655440002',
                startingPrice: 100,
                endsAt: '2024-12-31T23:59:59.000Z',
            },
        };

        const event = AuctionCreatedDomainEvent.fromPrimitives(params);

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.itemId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.startingPrice).toBe(100);
        expect(event.endsAt).toBe('2024-12-31T23:59:59.000Z');
        expect(event.eventId).toBe('550e8400-e29b-41d4-a716-446655440003');
        expect(event.occurredOn).toEqual(new Date('2024-01-01'));
    });

    it('should have correct EVENT_NAME', () => {
        expect(AuctionCreatedDomainEvent.EVENT_NAME).toBe('auction.created');
    });
});
