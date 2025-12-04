import { ItemDescription } from 'src/context/auction/domain/value-object/ItemDescription.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('ItemDescription', () => {
    it('should create a valid ItemDescription', () => {
        const description = new ItemDescription('This is a vintage camera from the 1970s in excellent condition.');
        expect(description.value).toBe('This is a vintage camera from the 1970s in excellent condition.');
    });

    it('should throw error if description is too short', () => {
        expect(() => new ItemDescription('Short')).toThrow(InvalidArgumentError);
        expect(() => new ItemDescription('Short')).toThrow('must be between 10 and 2000 characters');
    });

    it('should throw error if description is too long', () => {
        const longDesc = 'A'.repeat(2001);
        expect(() => new ItemDescription(longDesc)).toThrow(InvalidArgumentError);
    });

    it('should accept minimum length description', () => {
        const desc = new ItemDescription('1234567890');
        expect(desc.value).toBe('1234567890');
    });

    it('should accept maximum length description', () => {
        const maxDesc = 'A'.repeat(2000);
        const description = new ItemDescription(maxDesc);
        expect(description.value).toBe(maxDesc);
    });
});
