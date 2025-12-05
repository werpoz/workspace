import { BidPlacedDomainEvent } from 'src/context/auction/domain/events/BidPlacedDomainEvent';

describe('BidPlacedDomainEvent', () => {
    it('should create event with all properties', () => {
        const event = new BidPlacedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            bidId: '550e8400-e29b-41d4-a716-446655440002',
            amount: 150,
            previousPrice: 100,
            bidderId: '550e8400-e29b-41d4-a716-446655440003',
        });

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.bidId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.amount).toBe(150);
        expect(event.previousPrice).toBe(100);
        expect(event.bidderId).toBe('550e8400-e29b-41d4-a716-446655440003');
        expect(event.eventName).toBe('auction.bid_placed');
        expect(event.eventId).toBeDefined();
        expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create event with custom eventId and occurredOn', () => {
        const customEventId = '550e8400-e29b-41d4-a716-446655440004';
        const customDate = new Date('2024-01-01');

        const event = new BidPlacedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            bidId: '550e8400-e29b-41d4-a716-446655440002',
            amount: 150,
            previousPrice: 100,
            bidderId: '550e8400-e29b-41d4-a716-446655440003',
            eventId: customEventId,
            occurredOn: customDate,
        });

        expect(event.eventId).toBe(customEventId);
        expect(event.occurredOn).toBe(customDate);
    });

    it('should convert to primitives correctly', () => {
        const event = new BidPlacedDomainEvent({
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            bidId: '550e8400-e29b-41d4-a716-446655440002',
            amount: 150,
            previousPrice: 100,
            bidderId: '550e8400-e29b-41d4-a716-446655440003',
        });

        const primitives = event.toPrimitives();

        expect(primitives.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(primitives.bidId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(primitives.amount).toBe(150);
        expect(primitives.previousPrice).toBe(100);
        expect(primitives.bidderId).toBe('550e8400-e29b-41d4-a716-446655440003');
        expect(primitives.eventName).toBe('auction.bid_placed');
        expect(primitives.eventId).toBeDefined();
        expect(primitives.occurredOn).toBeInstanceOf(Date);
    });

    it('should reconstruct from primitives', () => {
        const params = {
            aggregateId: '550e8400-e29b-41d4-a716-446655440001',
            eventId: '550e8400-e29b-41d4-a716-446655440004',
            occurredOn: new Date('2024-01-01'),
            attributes: {
                bidId: '550e8400-e29b-41d4-a716-446655440002',
                amount: 150,
                previousPrice: 100,
                bidderId: '550e8400-e29b-41d4-a716-446655440003',
            },
        };

        const event = BidPlacedDomainEvent.fromPrimitives(params);

        expect(event.aggregateId).toBe('550e8400-e29b-41d4-a716-446655440001');
        expect(event.bidId).toBe('550e8400-e29b-41d4-a716-446655440002');
        expect(event.amount).toBe(150);
        expect(event.previousPrice).toBe(100);
        expect(event.bidderId).toBe('550e8400-e29b-41d4-a716-446655440003');
        expect(event.eventId).toBe('550e8400-e29b-41d4-a716-446655440004');
        expect(event.occurredOn).toEqual(new Date('2024-01-01'));
    });

    it('should have correct EVENT_NAME', () => {
        expect(BidPlacedDomainEvent.EVENT_NAME).toBe('auction.bid_placed');
    });
});
