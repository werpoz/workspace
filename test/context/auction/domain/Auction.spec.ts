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

            const bidAmount = new BidAmount(150);
            const bidderId = AccountID.random();

            auction.placeBid(bidAmount, bidderId);

            expect(auction.bids).toHaveLength(1);
            expect(auction.bids[0].amount.value).toBe(150);
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

            const bidAmount = new BidAmount(150);
            const bidderId = AccountID.random();

            auction.placeBid(bidAmount, bidderId);

            const events = auction.pullDomainEvents();
            expect(events).toHaveLength(1);
            expect(events[0].eventName).toBe('auction.bid_placed');
            expect((events[0] as any).previousPrice).toBe(100);
        });

        it('should allow multiple bids with increasing amounts', () => {
            const auction = Auction.create(
                validAuctionId,
                validItemId,
                validStartingPrice,
                futureDate,
            );
            auction.publish();

            const bidder1 = AccountID.random();
            const bidder2 = AccountID.random();

            auction.placeBid(new BidAmount(150), bidder1);
            auction.placeBid(new BidAmount(200), bidder2);

            expect(auction.bids).toHaveLength(2);
            expect(auction.currentPrice).toBe(200);
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

            const bidder1 = AccountID.random();
            const bidder2 = AccountID.random();

            auction.placeBid(new BidAmount(150), bidder1);
            auction.placeBid(new BidAmount(200), bidder2);

            expect(auction.currentPrice).toBe(200);
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
            auction.placeBid(new BidAmount(150), bidderId);

            const primitives = auction.toPrimitives();

            expect(primitives.bids).toHaveLength(1);
            expect(primitives.bids[0].amount).toBe(150);
            expect(primitives.bids[0].bidderId).toBe(bidderId.value);
        });
    });
});
