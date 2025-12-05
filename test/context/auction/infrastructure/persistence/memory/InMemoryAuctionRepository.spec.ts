import { InMemoryAuctionRepository } from 'src/context/auction/infrastructure/persistence/memory/InMemoryAuctionRepository';
import { Auction } from 'src/context/auction/domain/Auction';
import { AuctionId } from 'src/context/auction/domain/value-object/AuctionId.vo';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { StartingPrice } from 'src/context/auction/domain/value-object/StartingPrice.vo';
import { BidAmount } from 'src/context/auction/domain/value-object/BidAmount.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

describe('InMemoryAuctionRepository', () => {
    let repository: InMemoryAuctionRepository;

    beforeEach(() => {
        repository = new InMemoryAuctionRepository();
    });

    describe('save', () => {
        it('should save a new auction', async () => {
            const auctionId = new AuctionId('550e8400-e29b-41d4-a716-446655440001');
            const itemId = ItemId.random();
            const startingPrice = new StartingPrice(100);
            const endsAt = new Date(Date.now() + 3600000);

            const auction = Auction.create(auctionId, itemId, startingPrice, endsAt);

            await repository.save(auction);

            const found = await repository.searchById(auctionId.value);
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(auctionId.value);
        });

        it('should update existing auction', async () => {
            const auctionId = new AuctionId('550e8400-e29b-41d4-a716-446655440002');
            const itemId = ItemId.random();
            const startingPrice = new StartingPrice(100);
            const endsAt = new Date(Date.now() + 3600000);

            const auction = Auction.create(auctionId, itemId, startingPrice, endsAt);
            await repository.save(auction);

            // Publish and save again
            auction.publish();
            await repository.save(auction);

            const found = await repository.searchById(auctionId.value);
            expect(found?.status.value).toBe('active');
        });
    });

    describe('searchById', () => {
        it('should find auction by id', async () => {
            const auctionId = new AuctionId('550e8400-e29b-41d4-a716-446655440003');
            const itemId = ItemId.random();
            const startingPrice = new StartingPrice(100);
            const endsAt = new Date(Date.now() + 3600000);

            const auction = Auction.create(auctionId, itemId, startingPrice, endsAt);
            await repository.save(auction);

            const found = await repository.searchById(auctionId.value);
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(auctionId.value);
            expect(found?.itemId.value).toBe(itemId.value);
        });

        it('should return null if auction not found', async () => {
            const result = await repository.searchById('non-existent-id');
            expect(result).toBeNull();
        });

        it('should return auction with bids', async () => {
            const auctionId = new AuctionId('550e8400-e29b-41d4-a716-446655440004');
            const itemId = ItemId.random();
            const startingPrice = new StartingPrice(100);
            const endsAt = new Date(Date.now() + 3600000);

            const auction = Auction.create(auctionId, itemId, startingPrice, endsAt);
            auction.publish();
            auction.placeBid(new BidAmount(150), AccountID.random());

            await repository.save(auction);

            const found = await repository.searchById(auctionId.value);
            expect(found).toBeDefined();
            expect(found?.bids).toHaveLength(1);
        });
    });
});
