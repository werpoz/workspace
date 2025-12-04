import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export enum ItemConditionEnum {
    NEW = 'new',
    LIKE_NEW = 'like_new',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor',
}

export class ItemCondition extends EnumValueObject<ItemConditionEnum> {
    constructor(value: ItemConditionEnum) {
        super(value, Object.values(ItemConditionEnum));
    }

    static new(): ItemCondition {
        return new ItemCondition(ItemConditionEnum.NEW);
    }

    static likeNew(): ItemCondition {
        return new ItemCondition(ItemConditionEnum.LIKE_NEW);
    }

    static good(): ItemCondition {
        return new ItemCondition(ItemConditionEnum.GOOD);
    }

    static fair(): ItemCondition {
        return new ItemCondition(ItemConditionEnum.FAIR);
    }

    static poor(): ItemCondition {
        return new ItemCondition(ItemConditionEnum.POOR);
    }

    protected throwErrorForInvalidValue(value: ItemConditionEnum): void {
        throw new InvalidArgumentError(`The item condition ${value} is invalid`);
    }
}
