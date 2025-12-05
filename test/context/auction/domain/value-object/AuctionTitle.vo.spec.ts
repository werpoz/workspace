import { AuctionTitle } from 'src/context/auction/domain/value-object/AuctionTitle.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('AuctionTitle', () => {
    it('should create a valid AuctionTitle', () => {
        const title = 'Summer Auction 2024';
        const auctionTitle = new AuctionTitle(title);
        expect(auctionTitle.value).toBe(title);
    });

    it('should throw error if title is too short', () => {
        expect(() => new AuctionTitle('AB')).toThrow(InvalidArgumentError);
        expect(() => new AuctionTitle('AB')).toThrow('must be between 3 and 100 characters');
    });

    it('should throw error if title is too long', () => {
        const longTitle = 'A'.repeat(101);
        expect(() => new AuctionTitle(longTitle)).toThrow(InvalidArgumentError);
    });

    it('should accept minimum length title', () => {
        const title = new AuctionTitle('ABC');
        expect(title.value).toBe('ABC');
    });

    it('should accept maximum length title', () => {
        const maxTitle = 'A'.repeat(100);
        const title = new AuctionTitle(maxTitle);
        expect(title.value).toBe(maxTitle);
    });
});
