import { Item } from 'src/context/auction/domain/Item';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { ItemTitle } from 'src/context/auction/domain/value-object/ItemTitle.vo';
import { ItemDescription } from 'src/context/auction/domain/value-object/ItemDescription.vo';
import { ItemCategory, ItemCategoryEnum } from 'src/context/auction/domain/value-object/ItemCategory.vo';
import { ItemCondition, ItemConditionEnum } from 'src/context/auction/domain/value-object/ItemCondition.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

describe('Item Aggregate', () => {
    const validItemId = ItemId.random();
    const validTitle = new ItemTitle('Vintage Camera');
    const validDescription = new ItemDescription('A beautiful vintage camera from the 1970s in excellent condition.');
    const validCategory = new ItemCategory(ItemCategoryEnum.ELECTRONICS);
    const validCondition = new ItemCondition(ItemConditionEnum.LIKE_NEW);
    const validOwnerId = AccountID.random();
    const validImages = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];

    describe('create', () => {
        it('should create an item successfully', () => {
            const item = Item.create(
                validItemId,
                validTitle,
                validDescription,
                validCategory,
                validCondition,
                validOwnerId,
                validImages,
            );

            expect(item.id).toBe(validItemId);
            expect(item.title).toBe(validTitle);
            expect(item.description).toBe(validDescription);
            expect(item.category).toBe(validCategory);
            expect(item.condition).toBe(validCondition);
            expect(item.ownerId).toBe(validOwnerId);
            expect(item.images).toEqual(validImages);
        });

        it('should create item without images', () => {
            const item = Item.create(
                validItemId,
                validTitle,
                validDescription,
                validCategory,
                validCondition,
                validOwnerId,
            );

            expect(item.images).toEqual([]);
        });

        it('should publish ItemCreatedDomainEvent', () => {
            const item = Item.create(
                validItemId,
                validTitle,
                validDescription,
                validCategory,
                validCondition,
                validOwnerId,
                validImages,
            );

            const events = item.pullDomainEvents();
            expect(events).toHaveLength(1);
            expect(events[0].eventName).toBe('item.created');
        });

        it('should set createdAt timestamp', () => {
            const beforeCreate = new Date();
            const item = Item.create(
                validItemId,
                validTitle,
                validDescription,
                validCategory,
                validCondition,
                validOwnerId,
            );
            const afterCreate = new Date();

            expect(item.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
            expect(item.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
        });
    });

    describe('toPrimitives', () => {
        it('should convert item to primitives', () => {
            const item = Item.create(
                validItemId,
                validTitle,
                validDescription,
                validCategory,
                validCondition,
                validOwnerId,
                validImages,
            );

            const primitives = item.toPrimitives();

            expect(primitives).toEqual({
                id: validItemId.value,
                title: validTitle.value,
                description: validDescription.value,
                category: validCategory.value,
                condition: validCondition.value,
                ownerId: validOwnerId.value,
                images: validImages,
                createdAt: item.createdAt.toISOString(),
            });
        });
    });
});
