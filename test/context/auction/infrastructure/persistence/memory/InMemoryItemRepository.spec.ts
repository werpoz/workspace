import { InMemoryItemRepository } from 'src/context/auction/infrastructure/persistence/memory/InMemoryItemRepository';
import { Item } from 'src/context/auction/domain/Item';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { ItemTitle } from 'src/context/auction/domain/value-object/ItemTitle.vo';
import { ItemDescription } from 'src/context/auction/domain/value-object/ItemDescription.vo';
import { ItemCategory } from 'src/context/auction/domain/value-object/ItemCategory.vo';
import { ItemCondition } from 'src/context/auction/domain/value-object/ItemCondition.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

describe('InMemoryItemRepository', () => {
    let repository: InMemoryItemRepository;

    beforeEach(() => {
        repository = new InMemoryItemRepository();
    });

    describe('save', () => {
        it('should save a new item', async () => {
            const itemId = ItemId.random();
            const title = new ItemTitle('Test Item');
            const description = new ItemDescription('Test description');
            const category = ItemCategory.electronics();
            const condition = ItemCondition.new();
            const ownerId = AccountID.random();

            const item = Item.create(itemId, title, description, category, condition, ownerId);

            await repository.save(item);

            const found = await repository.searchById(itemId.value);
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(itemId.value);
        });

        it('should update existing item', async () => {
            const itemId = ItemId.random();
            const title = new ItemTitle('Original Title');
            const description = new ItemDescription('Test description');
            const category = ItemCategory.electronics();
            const condition = ItemCondition.new();
            const ownerId = AccountID.random();

            const item = Item.create(itemId, title, description, category, condition, ownerId);
            await repository.save(item);

            // Update the same item (in real usage, you'd modify properties)
            await repository.save(item);

            const found = await repository.searchById(itemId.value);
            expect(found).toBeDefined();
        });
    });

    describe('searchById', () => {
        it('should find item by id', async () => {
            const itemId = ItemId.random();
            const title = new ItemTitle('Test Item');
            const description = new ItemDescription('Test description');
            const category = ItemCategory.electronics();
            const condition = ItemCondition.new();
            const ownerId = AccountID.random();

            const item = Item.create(itemId, title, description, category, condition, ownerId);
            await repository.save(item);

            const found = await repository.searchById(itemId.value);
            expect(found).toBeDefined();
            expect(found?.id.value).toBe(itemId.value);
            expect(found?.title.value).toBe('Test Item');
        });

        it('should return null if item not found', async () => {
            const result = await repository.searchById('non-existent-id');
            expect(result).toBeNull();
        });
    });

    describe('findByOwnerId', () => {
        it('should find items by owner id', async () => {
            const ownerId = new AccountID('550e8400-e29b-41d4-a716-446655440001');
            const item1 = Item.create(
                new ItemId('550e8400-e29b-41d4-a716-446655440011'),
                new ItemTitle('Item 1'),
                new ItemDescription('Description 1'),
                ItemCategory.electronics(),
                ItemCondition.new(),
                ownerId,
            );
            const item2 = Item.create(
                new ItemId('550e8400-e29b-41d4-a716-446655440012'),
                new ItemTitle('Item 2'),
                new ItemDescription('Description 2'),
                ItemCategory.collectibles(),
                ItemCondition.likeNew(),
                ownerId,
            );

            await repository.save(item1);
            await repository.save(item2);

            const items = await repository.findByOwnerId(ownerId.value);
            expect(items).toHaveLength(2);
            expect(items.map(i => i.id.value)).toContain(item1.id.value);
            expect(items.map(i => i.id.value)).toContain(item2.id.value);
        });

        it('should return empty array if no items found for owner', async () => {
            const ownerId = AccountID.random();
            const items = await repository.findByOwnerId(ownerId.value);
            expect(items).toEqual([]);
        });

        it('should not return items from other owners', async () => {
            const ownerId1 = new AccountID('550e8400-e29b-41d4-a716-446655440002');
            const ownerId2 = new AccountID('550e8400-e29b-41d4-a716-446655440003');

            const item1 = Item.create(
                new ItemId('550e8400-e29b-41d4-a716-446655440013'),
                new ItemTitle('Item 1'),
                new ItemDescription('Description 1'),
                ItemCategory.electronics(),
                ItemCondition.new(),
                ownerId1,
            );
            const item2 = Item.create(
                new ItemId('550e8400-e29b-41d4-a716-446655440014'),
                new ItemTitle('Item 2'),
                new ItemDescription('Description 2'),
                ItemCategory.electronics(),
                ItemCondition.new(),
                ownerId2,
            );

            await repository.save(item1);
            await repository.save(item2);

            const items = await repository.findByOwnerId(ownerId1.value);
            expect(items).toHaveLength(1);
            expect(items[0].id.value).toBe(item1.id.value);
        });
    });
});
