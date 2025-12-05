import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuctionUseCase } from 'src/context/auction/application/CreateAuctionUseCase';
import type { AuctionRepository } from 'src/context/auction/domain/interface/AuctionRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';

describe('CreateAuctionUseCase', () => {
    let useCase: CreateAuctionUseCase;
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
                CreateAuctionUseCase,
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

        useCase = module.get<CreateAuctionUseCase>(CreateAuctionUseCase);
        auctionRepository = module.get('AuctionRepository');
        eventBus = module.get('DomainEventBus');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should create an auction successfully', async () => {
        const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
        const params = {
            id: '550e8400-e29b-41d4-a716-446655440001',
            itemId: '550e8400-e29b-41d4-a716-446655440002',
            startingPrice: 100,
            endsAt: futureDate,
        };

        await useCase.execute(params);

        expect(auctionRepository.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);

        const savedAuction = (auctionRepository.save as jest.Mock).mock.calls[0][0];
        expect(savedAuction.id.value).toBe(params.id);
        expect(savedAuction.itemId.value).toBe(params.itemId);
        expect(savedAuction.startingPrice.value).toBe(params.startingPrice);
    });

    it('should throw error if end date is in the past', async () => {
        const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
        const params = {
            id: '550e8400-e29b-41d4-a716-446655440001',
            itemId: '550e8400-e29b-41d4-a716-446655440002',
            startingPrice: 100,
            endsAt: pastDate,
        };

        await expect(useCase.execute(params)).rejects.toThrow(
            'Auction end date must be in the future',
        );

        expect(auctionRepository.save).not.toHaveBeenCalled();
        expect(eventBus.publishAll).not.toHaveBeenCalled();
    });

    it('should throw error if end date is now', async () => {
        const now = new Date();
        const params = {
            id: '550e8400-e29b-41d4-a716-446655440001',
            itemId: '550e8400-e29b-41d4-a716-446655440002',
            startingPrice: 100,
            endsAt: now,
        };

        await expect(useCase.execute(params)).rejects.toThrow(
            'Auction end date must be in the future',
        );
    });

    it('should publish AuctionCreatedDomainEvent', async () => {
        const futureDate = new Date(Date.now() + 3600000);
        const params = {
            id: '550e8400-e29b-41d4-a716-446655440001',
            itemId: '550e8400-e29b-41d4-a716-446655440002',
            startingPrice: 100,
            endsAt: futureDate,
        };

        await useCase.execute(params);

        const publishedEvents = (eventBus.publishAll as jest.Mock).mock.calls[0][0];
        expect(publishedEvents).toHaveLength(1);
        expect(publishedEvents[0].eventName).toBe('auction.created');
    });
});
