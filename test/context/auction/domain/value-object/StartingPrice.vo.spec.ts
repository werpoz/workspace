import { StartingPrice } from 'src/context/auction/domain/value-object/StartingPrice.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('StartingPrice', () => {
    it('should create a valid StartingPrice', () => {
        const price = new StartingPrice(50);
        expect(price.value).toBe(50);
    });

    it('should accept zero as starting price', () => {
        const price = new StartingPrice(0);
        expect(price.value).toBe(0);
    });

    it('should throw error for negative price', () => {
        expect(() => new StartingPrice(-10)).toThrow(InvalidArgumentError);
        expect(() => new StartingPrice(-10)).toThrow('must be positive');
    });

    it('should accept decimal prices', () => {
        const price = new StartingPrice(49.99);
        expect(price.value).toBe(49.99);
    });

    it('should accept large prices', () => {
        const price = new StartingPrice(999999.99);
        expect(price.value).toBe(999999.99);
    });
});
