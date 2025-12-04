import { AuctionStatus, AuctionStatusEnum } from 'src/context/auction/domain/value-object/AuctionStatus.vo';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('AuctionStatus', () => {
    it('should create a valid AuctionStatus', () => {
        const status = new AuctionStatus(AuctionStatusEnum.DRAFT);
        expect(status.value).toBe('draft');
    });

    it('should create draft status using factory method', () => {
        const status = AuctionStatus.draft();
        expect(status.value).toBe('draft');
    });

    it('should create active status using factory method', () => {
        const status = AuctionStatus.active();
        expect(status.value).toBe('active');
    });

    it('should create completed status using factory method', () => {
        const status = AuctionStatus.completed();
        expect(status.value).toBe('completed');
    });

    it('should create cancelled status using factory method', () => {
        const status = AuctionStatus.cancelled();
        expect(status.value).toBe('cancelled');
    });

    it('should throw error for invalid status', () => {
        expect(() => new AuctionStatus('invalid' as any)).toThrow(InvalidArgumentError);
    });

    it('should support all valid statuses', () => {
        const statuses = [
            AuctionStatusEnum.DRAFT,
            AuctionStatusEnum.ACTIVE,
            AuctionStatusEnum.COMPLETED,
            AuctionStatusEnum.CANCELLED,
        ];

        statuses.forEach(status => {
            expect(() => new AuctionStatus(status)).not.toThrow();
        });
    });
});
