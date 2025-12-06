import { Auction } from 'src/context/auction/domain/Auction';
import { AuctionId } from 'src/context/auction/domain/value-object/AuctionId.vo';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { StartingPrice } from 'src/context/auction/domain/value-object/StartingPrice.vo';
import { BidAmount } from 'src/context/auction/domain/value-object/BidAmount.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

describe('Auction Aggregate', () => {
    const validAuctionId = AuctionId.random();
    const validItemId = ItemId.random();
    const validStartingPrice = new StartingPrice(100);
    const futureDate = new Date(Date.now() + 3600000); // 1 hour from now

    describe('create', () => {
        it('should create an auction successfully', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );

            expect(auction.id).toBe(validAuctionId);
            expect(auction.itemId).toBe(validItemId);
            expect(auction.startingPrice).toBe(validStartingPrice);
            expect(auction.endsAt).toBe(futureDate);
            expect(auction.status.value).toBe('draft');
        });

        it('should publish AuctionCreatedDomainEvent', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );

            const events = auction.pullDomainEvents();
            expect(events).toHaveLength(1);
            expect(events[0].eventName).toBe('auction.created');
        });

        it('should initialize with empty bids', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );

            expect(auction.bids).toHaveLength(0);
        });
    });

    describe('publish', () => {
        it('should publish a draft auction', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.pullDomainEvents(); // Clear creation event

            auction.publish();

            expect(auction.status.value).toBe('active');
        });

        it('should throw error if auction is not draft', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );

            auction.publish();

            expect(() => auction.publish()).toThrow('Only draft auctions can be published');
        });

        it('should publish AuctionPublishedDomainEvent', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.pullDomainEvents();

            auction.publish();

            const events = auction.pullDomainEvents();
            expect(events).toHaveLength(1);
            expect(events[0].eventName).toBe('auction.published');
        });
    });

    describe('placeBid', () => {
        it('should place a valid bid', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();
            auction.pullDomainEvents();

            // Starting price is $100, minimum bid is $105 ($100 + $5)
            const bidAmount = new BidAmount(105);
            const bidderId = AccountID.random();

            auction.placeBid(bidAmount, bidderId);

            expect(auction.bids).toHaveLength(1);
            expect(auction.bids[0].amount.value).toBe(105);
        });

        it('should throw error if auction is not active', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );

            const bidAmount = new BidAmount(150);
            const bidderId = AccountID.random();

            expect(() => auction.placeBid(bidAmount, bidderId)).toThrow('Auction is not active');
        });

        it('should throw error if bid is not higher than current price', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidAmount = new BidAmount(100); // Same as starting price
            const bidderId = AccountID.random();

            expect(() => auction.placeBid(bidAmount, bidderId)).toThrow('Bid amount must be higher than current price');
        });

        it('should throw error if auction has ended', () => {
            const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                pastDate,
            );
            auction.publish();

            const bidAmount = new BidAmount(150);
            const bidderId = AccountID.random();

            expect(() => auction.placeBid(bidAmount, bidderId)).toThrow('Auction has ended');
        });

        it('should publish BidPlacedDomainEvent with previousPrice', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();
            auction.pullDomainEvents();

            const bidAmount = new BidAmount(105); // Minimum increment
            const bidderId = AccountID.random();

            auction.placeBid(bidAmount, bidderId);

            const events = auction.pullDomainEvents();
            expect(events).toHaveLength(1);
            expect(events[0].eventName).toBe('auction.bid_placed');
            expect((events[0] as any).previousPrice).toBe(100);
        });

        it('should allow multiple bids with increasing amounts from different bidders', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidder1 = new AccountID('550e8400-e29b-41d4-a716-446655440001');
            const bidder2 = new AccountID('550e8400-e29b-41d4-a716-446655440002');

            // $100 + $5 = $105
            auction.placeBid(new BidAmount(105), bidder1);
            // $105 + $5.25 = $110.25, so $111 is valid
            auction.placeBid(new BidAmount(111), bidder2);

            expect(auction.bids).toHaveLength(2);
            expect(auction.currentPrice).toBe(111);
        });

        // New business rule tests

        it('should enforce minimum increment (5% or $5, whichever is higher)', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidderId = AccountID.random();

            // Starting price is $100, min increment is max(5, 100*0.05) = $5
            // So minimum bid is $105
            expect(() => auction.placeBid(new BidAmount(104), bidderId)).toThrow(
                'Bid must be at least $5.00 higher than current price'
            );

            // This should work
            auction.placeBid(new BidAmount(105), bidderId);
            expect(auction.currentPrice).toBe(105);
        });

        it('should enforce 5% minimum increment for higher amounts', () => {
            const highStartingPrice = new StartingPrice(1000);
            const auction = Auction.create(
                AuctionId.random(),
                validItemId,
                highStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidderId = AccountID.random();

            // Starting price is $1000, min increment is max(5, 1000*0.05) = $50
            expect(() => auction.placeBid(new BidAmount(1040), bidderId)).toThrow(
                'Bid must be at least $50.00 higher than current price'
            );

            // This should work
            auction.placeBid(new BidAmount(1050), bidderId);
            expect(auction.currentPrice).toBe(1050);
        });

        it('should prevent self-bidding (same user cannot bid twice in a row)', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidder = AccountID.random();

            // First bid should work
            auction.placeBid(new BidAmount(150), bidder);

            // Second bid by same bidder should fail
            expect(() => auction.placeBid(new BidAmount(200), bidder)).toThrow(
                'Cannot bid on your own bid'
            );
        });

        it('should allow same user to bid after being outbid', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidder1 = new AccountID('550e8400-e29b-41d4-a716-446655440001');
            const bidder2 = new AccountID('550e8400-e29b-41d4-a716-446655440002');

            // $100 + $5 = $105
            auction.placeBid(new BidAmount(105), bidder1);
            // $105 + $5.25 = $110.25, so $111
            auction.placeBid(new BidAmount(111), bidder2);

            // Bidder1 can bid again since they were outbid
            // $111 + $5.55 = $116.55, so $117
            auction.placeBid(new BidAmount(117), bidder1);
            expect(auction.currentPrice).toBe(117);
        });

        it('should extend auction if bid placed in last 2 minutes (anti-sniping)', () => {
            // Create auction ending in 1 minute
            const oneMinuteFromNow = new Date(Date.now() + 60000);
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                oneMinuteFromNow,
            );
            auction.publish();

            const bidder = AccountID.random();
            const originalEndsAt = auction.endsAt.getTime();

            // Place bid in the last 2 minutes (minimum $105)
            auction.placeBid(new BidAmount(105), bidder);

            // Auction should be extended by 2 minutes from now
            const newEndsAt = auction.endsAt.getTime();
            const twoMinutesMs = 2 * 60 * 1000;
            const expectedEndsAt = Date.now() + twoMinutesMs;

            expect(newEndsAt).toBeGreaterThan(originalEndsAt);
            // Allow 1 second tolerance for test execution time
            expect(newEndsAt).toBeGreaterThanOrEqual(expectedEndsAt - 1000);
            expect(newEndsAt).toBeLessThanOrEqual(expectedEndsAt + 1000);
        });

        it('should not extend auction if bid placed with more than 2 minutes remaining', () => {
            // Create auction ending in 3 minutes
            const threeMinutesFromNow = new Date(Date.now() + 180000);
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                threeMinutesFromNow,
            );
            auction.publish();

            const bidder = AccountID.random();
            const originalEndsAt = auction.endsAt.getTime();

            // Place bid with more than 2 minutes remaining (minimum $105)
            auction.placeBid(new BidAmount(105), bidder);

            // Auction end time should NOT change
            expect(auction.endsAt.getTime()).toBe(originalEndsAt);
        });
    });

    describe('currentPrice', () => {
        it('should return starting price when no bids exist', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );

            expect(auction.currentPrice).toBe(100);
        });

        it('should return highest bid amount', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidder1 = new AccountID('550e8400-e29b-41d4-a716-446655440001');
            const bidder2 = new AccountID('550e8400-e29b-41d4-a716-446655440002');

            // $100 + $5 = $105
            auction.placeBid(new BidAmount(105), bidder1);
            // $105 + $5.25 = $110.25, so $111
            auction.placeBid(new BidAmount(111), bidder2);

            expect(auction.currentPrice).toBe(111);
        });
    });

    describe('toPrimitives', () => {
        it('should convert auction to primitives', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );

            const primitives = auction.toPrimitives();

            expect(primitives).toEqual({
                id: validAuctionId.value,
                itemId: validItemId.value,
                startingPrice: validStartingPrice.value,
                status: 'draft',
                bids: [],
                createdAt: auction.createdAt.toISOString(),
                endsAt: futureDate.toISOString(),
            });
        });

        it('should convert auction with bids to primitives', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidderId = AccountID.random();
            // Minimum bid: $105
            auction.placeBid(new BidAmount(105), bidderId);

            const primitives = auction.toPrimitives();

            expect(primitives.bids).toHaveLength(1);
            expect(primitives.bids[0].amount).toBe(105);
            expect(primitives.bids[0].bidderId).toBe(bidderId.value);
        });
    });
});
