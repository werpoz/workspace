import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export enum ItemCategoryEnum {
    ELECTRONICS = 'electronics',
    FASHION = 'fashion',
    HOME = 'home',
    SPORTS = 'sports',
    ART = 'art',
    COLLECTIBLES = 'collectibles',
    BOOKS = 'books',
    OTHER = 'other',
}

export class ItemCategory extends EnumValueObject<ItemCategoryEnum> {
    constructor(value: ItemCategoryEnum) {
        super(value, Object.values(ItemCategoryEnum));
    }

    static electronics(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.ELECTRONICS);
    }

    static fashion(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.FASHION);
    }

    static home(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.HOME);
    }

    static sports(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.SPORTS);
    }

    static art(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.ART);
    }

    static collectibles(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.COLLECTIBLES);
    }

    static books(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.BOOKS);
    }

    static other(): ItemCategory {
        return new ItemCategory(ItemCategoryEnum.OTHER);
    }

    protected throwErrorForInvalidValue(value: ItemCategoryEnum): void {
        throw new InvalidArgumentError(`The item category ${value} is invalid`);
    }
}
