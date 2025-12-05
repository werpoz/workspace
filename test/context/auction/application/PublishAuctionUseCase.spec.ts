import { Test, TestingModule } from '@nestjs/testing';
import { PublishAuctionUseCase } from 'src/context/auction/application/PublishAuctionUseCase';
import type { AuctionRepository } from 'src/context/auction/domain/interface/AuctionRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Auction } from 'src/context/auction/domain/Auction';
import { AuctionId } from 'src/context/auction/domain/value-object/AuctionId.vo';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { StartingPrice } from 'src/context/auction/domain/value-object/StartingPrice.vo';

describe('PublishAuctionUseCase', () => {
    let useCase: PublishAuctionUseCase;
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
                PublishAuctionUseCase,
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

        useCase = module.get<PublishAuctionUseCase>(PublishAuctionUseCase);
        auctionRepository = module.get('AuctionRepository');
        eventBus = module.get('DomainEventBus');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should publish a draft auction successfully', async () => {
        const futureDate = new Date(Date.now() + 3600000);
        const auction = Auction.create(
            new AuctionId('550e8400-e29b-41d4-a716-446655440001'),
            new ItemId('550e8400-e29b-41d4-a716-446655440002'),
            new StartingPrice(100),
            futureDate,
        );
        auction.pullDomainEvents(); // Clear creation event

        auctionRepository.searchById.mockResolvedValue(auction);

        const params = { auctionId: '550e8400-e29b-41d4-a716-446655440001' };

        await useCase.execute(params);

        expect(auctionRepository.searchById).toHaveBeenCalledWith(params.auctionId);
        expect(auctionRepository.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);

        const savedAuction = (auctionRepository.save as jest.Mock).mock.calls[0][0];
        expect(savedAuction.status.value).toBe('active');
    });

    it('should throw error if auction not found', async () => {
        auctionRepository.searchById.mockResolvedValue(null);

        const params = { auctionId: '550e8400-e29b-41d4-a716-446655440001' };

        await expect(useCase.execute(params)).rejects.toThrow('Auction not found');

        expect(auctionRepository.save).not.toHaveBeenCalled();
        expect(eventBus.publishAll).not.toHaveBeenCalled();
    });

    it('should publish AuctionPublishedDomainEvent', async () => {
        const futureDate = new Date(Date.now() + 3600000);
        const auction = Auction.create(
            new AuctionId('550e8400-e29b-41d4-a716-446655440001'),
            new ItemId('550e8400-e29b-41d4-a716-446655440002'),
            new StartingPrice(100),
            futureDate,
        );
        auction.pullDomainEvents();

        auctionRepository.searchById.mockResolvedValue(auction);

        const params = { auctionId: '550e8400-e29b-41d4-a716-446655440001' };

        await useCase.execute(params);

        const publishedEvents = (eventBus.publishAll as jest.Mock).mock.calls[0][0];
        expect(publishedEvents).toHaveLength(1);
        expect(publishedEvents[0].eventName).toBe('auction.published');
    });

    it('should throw error if auction is already active', async () => {
        const futureDate = new Date(Date.now() + 3600000);
        const auction = Auction.create(
            new AuctionId('550e8400-e29b-41d4-a716-446655440001'),
            new ItemId('550e8400-e29b-41d4-a716-446655440002'),
            new StartingPrice(100),
            futureDate,
        );
        auction.publish(); // Publish once

        auctionRepository.searchById.mockResolvedValue(auction);

        const params = { auctionId: '550e8400-e29b-41d4-a716-446655440001' };

        await expect(useCase.execute(params)).rejects.toThrow(
            'Only draft auctions can be published',
        );
    });
});
