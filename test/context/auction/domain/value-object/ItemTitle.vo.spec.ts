import { ItemTitle } from 'src/context/auction/domain/value-object/ItemTitle.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('ItemTitle', () => {
    it('should create a valid ItemTitle', () => {
        const title = new ItemTitle('Vintage Camera');
        expect(title.value).toBe('Vintage Camera');
    });

    it('should throw error if title is too short', () => {
        expect(() => new ItemTitle('AB')).toThrow(InvalidArgumentError);
        expect(() => new ItemTitle('AB')).toThrow('must be between 3 and 150 characters');
    });

    it('should throw error if title is too long', () => {
        const longTitle = 'A'.repeat(151);
        expect(() => new ItemTitle(longTitle)).toThrow(InvalidArgumentError);
    });

    it('should accept minimum length title', () => {
        const title = new ItemTitle('ABC');
        expect(title.value).toBe('ABC');
    });

    it('should accept maximum length title', () => {
        const maxTitle = 'A'.repeat(150);
        const title = new ItemTitle(maxTitle);
        expect(title.value).toBe(maxTitle);
    });
});
