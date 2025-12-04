import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export enum AuctionStatusEnum {
    DRAFT = 'draft',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export class AuctionStatus extends EnumValueObject<AuctionStatusEnum> {
    constructor(value: AuctionStatusEnum) {
        super(value, Object.values(AuctionStatusEnum));
    }

    static draft(): AuctionStatus {
        return new AuctionStatus(AuctionStatusEnum.DRAFT);
    }

    static active(): AuctionStatus {
        return new AuctionStatus(AuctionStatusEnum.ACTIVE);
    }

    static completed(): AuctionStatus {
        return new AuctionStatus(AuctionStatusEnum.COMPLETED);
    }

    static cancelled(): AuctionStatus {
        return new AuctionStatus(AuctionStatusEnum.CANCELLED);
    }

    protected throwErrorForInvalidValue(value: AuctionStatusEnum): void {
        throw new InvalidArgumentError(`The auction status ${value} is invalid`);
    }
}
