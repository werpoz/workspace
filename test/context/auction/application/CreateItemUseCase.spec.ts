import { Test, TestingModule } from '@nestjs/testing';
import { CreateItemUseCase } from 'src/context/auction/application/CreateItemUseCase';
import type { ItemRepository } from 'src/context/auction/domain/interface/ItemRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';

describe('CreateItemUseCase', () => {
    let useCase: CreateItemUseCase;
    let itemRepository: jest.Mocked<ItemRepository>;
    let eventBus: jest.Mocked<DomainEventBus>;

    beforeEach(async () => {
        const mockItemRepository = {
            save: jest.fn(),
            searchById: jest.fn(),
            findByOwnerId: jest.fn(),
        };

        const mockEventBus = {
            publishAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateItemUseCase,
                {
                    provide: 'ItemRepository',
                    useValue: mockItemRepository,
                },
                {
                    provide: 'DomainEventBus',
                    useValue: mockEventBus,
                },
            ],
        }).compile();

        useCase = module.get<CreateItemUseCase>(CreateItemUseCase);
        itemRepository = module.get('ItemRepository');
        eventBus = module.get('DomainEventBus');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should create an item successfully', async () => {
        const params = {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Vintage Camera',
            description: 'A beautiful vintage camera from the 1970s in excellent condition.',
            category: 'electronics',
            condition: 'like_new',
            ownerId: '550e8400-e29b-41d4-a716-446655440002',
            images: ['https://example.com/image1.jpg'],
        };

        await useCase.execute(params);

        expect(itemRepository.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);

        const savedItem = (itemRepository.save as jest.Mock).mock.calls[0][0];
        expect(savedItem.id.value).toBe(params.id);
        expect(savedItem.title.value).toBe(params.title);
        expect(savedItem.description.value).toBe(params.description);
        expect(savedItem.category.value).toBe(params.category);
        expect(savedItem.condition.value).toBe(params.condition);
        expect(savedItem.ownerId.value).toBe(params.ownerId);
        expect(savedItem.images).toEqual(params.images);
    });

    it('should create item without images', async () => {
        const params = {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Vintage Camera',
            description: 'A beautiful vintage camera from the 1970s in excellent condition.',
            category: 'electronics',
            condition: 'like_new',
            ownerId: '550e8400-e29b-41d4-a716-446655440002',
        };

        await useCase.execute(params);

        const savedItem = (itemRepository.save as jest.Mock).mock.calls[0][0];
        expect(savedItem.images).toEqual([]);
    });

    it('should publish ItemCreatedDomainEvent', async () => {
        const params = {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Vintage Camera',
            description: 'A beautiful vintage camera from the 1970s in excellent condition.',
            category: 'electronics',
            condition: 'like_new',
            ownerId: '550e8400-e29b-41d4-a716-446655440002',
        };

        await useCase.execute(params);

        const publishedEvents = (eventBus.publishAll as jest.Mock).mock.calls[0][0];
        expect(publishedEvents).toHaveLength(1);
        expect(publishedEvents[0].eventName).toBe('item.created');
    });

    it('should handle all item categories', async () => {
        const categories = ['electronics', 'fashion', 'home', 'sports', 'art', 'collectibles', 'books', 'other'];

        for (const category of categories) {
            const params = {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Test Item',
                description: 'Test description for category test',
                category,
                condition: 'new',
                ownerId: '550e8400-e29b-41d4-a716-446655440002',
            };

            await useCase.execute(params);

            const savedItem = (itemRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedItem.category.value).toBe(category);

            jest.clearAllMocks();
        }
    });

    it('should handle all item conditions', async () => {
        const conditions = ['new', 'like_new', 'good', 'fair', 'poor'];

        for (const condition of conditions) {
            const params = {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Test Item',
                description: 'Test description for condition test',
                category: 'electronics',
                condition,
                ownerId: '550e8400-e29b-41d4-a716-446655440002',
            };

            await useCase.execute(params);

            const savedItem = (itemRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedItem.condition.value).toBe(condition);

            jest.clearAllMocks();
        }
    });
});
