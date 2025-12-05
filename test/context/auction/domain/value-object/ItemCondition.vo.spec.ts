import { ItemCondition, ItemConditionEnum } from 'src/context/auction/domain/value-object/ItemCondition.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('ItemCondition', () => {
    it('should create a valid ItemCondition', () => {
        const condition = new ItemCondition(ItemConditionEnum.NEW);
        expect(condition.value).toBe('new');
    });

    it('should create new condition using factory method', () => {
        const condition = ItemCondition.new();
        expect(condition.value).toBe('new');
    });

    it('should create like_new condition using factory method', () => {
        const condition = ItemCondition.likeNew();
        expect(condition.value).toBe('like_new');
    });

    it('should create good condition using factory method', () => {
        const condition = ItemCondition.good();
        expect(condition.value).toBe('good');
    });

    it('should create fair condition using factory method', () => {
        const condition = ItemCondition.fair();
        expect(condition.value).toBe('fair');
    });

    it('should create poor condition using factory method', () => {
        const condition = ItemCondition.poor();
        expect(condition.value).toBe('poor');
    });

    it('should throw error for invalid condition', () => {
        expect(() => new ItemCondition('invalid' as any)).toThrow(InvalidArgumentError);
    });

    it('should support all valid conditions', () => {
        const conditions = [
            ItemConditionEnum.NEW,
            ItemConditionEnum.LIKE_NEW,
            ItemConditionEnum.GOOD,
            ItemConditionEnum.FAIR,
            ItemConditionEnum.POOR,
        ];

        conditions.forEach(cond => {
            expect(() => new ItemCondition(cond)).not.toThrow();
        });
    });
});
