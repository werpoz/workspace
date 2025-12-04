import { BidAmount } from 'src/context/auction/domain/value-object/BidAmount.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('BidAmount', () => {
    it('should create a valid BidAmount', () => {
        const amount = new BidAmount(100);
        expect(amount.value).toBe(100);
    });

    it('should throw error for zero amount', () => {
        expect(() => new BidAmount(0)).toThrow(InvalidArgumentError);
        expect(() => new BidAmount(0)).toThrow('must be greater than zero');
    });

    it('should throw error for negative amount', () => {
        expect(() => new BidAmount(-50)).toThrow(InvalidArgumentError);
    });

    it('should accept decimal amounts', () => {
        const amount = new BidAmount(99.99);
        expect(amount.value).toBe(99.99);
    });

    it('should accept large amounts', () => {
        const amount = new BidAmount(1000000);
        expect(amount.value).toBe(1000000);
    });
});
