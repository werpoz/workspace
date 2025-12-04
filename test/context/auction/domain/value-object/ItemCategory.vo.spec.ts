import { ItemCategory, ItemCategoryEnum } from 'src/context/auction/domain/value-object/ItemCategory.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('ItemCategory', () => {
    it('should create a valid ItemCategory', () => {
        const category = new ItemCategory(ItemCategoryEnum.ELECTRONICS);
        expect(category.value).toBe('electronics');
    });

    it('should create electronics category using factory method', () => {
        const category = ItemCategory.electronics();
        expect(category.value).toBe('electronics');
    });

    it('should create fashion category using factory method', () => {
        const category = ItemCategory.fashion();
        expect(category.value).toBe('fashion');
    });

    it('should create home category using factory method', () => {
        const category = ItemCategory.home();
        expect(category.value).toBe('home');
    });

    it('should throw error for invalid category', () => {
        expect(() => new ItemCategory('invalid' as any)).toThrow(InvalidArgumentError);
    });

    it('should support all valid categories', () => {
        const categories = [
            ItemCategoryEnum.ELECTRONICS,
            ItemCategoryEnum.FASHION,
            ItemCategoryEnum.HOME,
            ItemCategoryEnum.SPORTS,
            ItemCategoryEnum.ART,
            ItemCategoryEnum.COLLECTIBLES,
            ItemCategoryEnum.BOOKS,
            ItemCategoryEnum.OTHER,
        ];

        categories.forEach(cat => {
            expect(() => new ItemCategory(cat)).not.toThrow();
        });
    });
});
