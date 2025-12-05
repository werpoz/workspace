import { Test, TestingModule } from '@nestjs/testing';
import { PlaceBidUseCase } from 'src/context/auction/application/PlaceBidUseCase';
import type { AuctionRepository } from 'src/context/auction/domain/interface/AuctionRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Auction } from 'src/context/auction/domain/Auction';
import { AuctionId } from 'src/context/auction/domain/value-object/AuctionId.vo';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { StartingPrice } from 'src/context/auction/domain/value-object/StartingPrice.vo';

describe('PlaceBidUseCase', () => {
    let useCase: PlaceBidUseCase;
    let auctionRepository: jest.Mocked<AuctionRepository>;
    let eventBus: jest.Mocked<DomainEventBus>;

    beforeEach(async () => {
        const mockAuctionRepository = {
            save: jest.fn(),
            searchById: jest.fn(),
            findAll: jest.fn(),
        };

        const mockEventBus = {
            publishAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlaceBidUseCase,
                {
                    provide: 'AuctionRepository',
                    useValue: mockAuctionRepository,
                },
                {
                    provide: 'DomainEventBus',
                    useValue: mockEventBus,
                },
            ],
        }).compile();

        useCase = module.get<PlaceBidUseCase>(PlaceBidUseCase);
        auctionRepository = module.get('AuctionRepository');
        eventBus = module.get('DomainEventBus');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should place a bid successfully', async () => {
        const futureDate = new Date(Date.now() + 3600000);
        const auction = Auction.create(
            new AuctionId('550e8400-e29b-41d4-a716-446655440001'),
            new ItemId('550e8400-e29b-41d4-a716-446655440002'),
            new StartingPrice(100),
            futureDate,
        );
        auction.publish();
        auction.pullDomainEvents(); // Clear events

        auctionRepository.searchById.mockResolvedValue(auction);

        const params = {
            auctionId: '550e8400-e29b-41d4-a716-446655440001',
            bidderId: '550e8400-e29b-41d4-a716-446655440003',
            amount: 150,
        };

        await useCase.execute(params);

        expect(auctionRepository.searchById).toHaveBeenCalledWith(params.auctionId);
        expect(auctionRepository.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);

        const publishedEvents = (eventBus.publishAll as jest.Mock).mock.calls[0][0];
        expect(publishedEvents).toHaveLength(1);
        expect(publishedEvents[0].eventName).toBe('auction.bid_placed');
    });

    it('should throw error if auction not found', async () => {
        auctionRepository.searchById.mockResolvedValue(null);

        const params = {
            auctionId: '550e8400-e29b-41d4-a716-446655440001',
            bidderId: '550e8400-e29b-41d4-a716-446655440003',
            amount: 150,
        };

        await expect(useCase.execute(params)).rejects.toThrow('Auction not found');

        expect(auctionRepository.save).not.toHaveBeenCalled();
        expect(eventBus.publishAll).not.toHaveBeenCalled();
    });

    it('should throw error if auction is not active', async () => {
        const futureDate = new Date(Date.now() + 3600000);
        const auction = Auction.create(
            new AuctionId('550e8400-e29b-41d4-a716-446655440001'),
            new ItemId('550e8400-e29b-41d4-a716-446655440002'),
            new StartingPrice(100),
            futureDate,
        );
        // Don't publish, leave in draft

        auctionRepository.searchById.mockResolvedValue(auction);

        const params = {
            auctionId: '550e8400-e29b-41d4-a716-446655440001',
            bidderId: '550e8400-e29b-41d4-a716-446655440003',
            amount: 150,
        };

        await expect(useCase.execute(params)).rejects.toThrow('Auction is not active');
    });

    it('should throw error if bid amount is too low', async () => {
        const futureDate = new Date(Date.now() + 3600000);
        const auction = Auction.create(
            new AuctionId('550e8400-e29b-41d4-a716-446655440001'),
            new ItemId('550e8400-e29b-41d4-a716-446655440002'),
            new StartingPrice(100),
            futureDate,
        );
        auction.publish();

        auctionRepository.searchById.mockResolvedValue(auction);

        const params = {
            auctionId: '550e8400-e29b-41d4-a716-446655440001',
            bidderId: '550e8400-e29b-41d4-a716-446655440003',
            amount: 100, // Same as starting price
        };

        await expect(useCase.execute(params)).rejects.toThrow(
            'Bid amount must be higher than current price',
        );
    });
});
