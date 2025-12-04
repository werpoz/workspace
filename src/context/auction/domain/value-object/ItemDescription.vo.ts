import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export class ItemDescription extends StringValueObject {
    constructor(value: string) {
        super(value);
        this.ensureLengthIsWithinBounds(value);
    }

    private ensureLengthIsWithinBounds(value: string): void {
        if (value.length < 10 || value.length > 2000) {
            throw new InvalidArgumentError(
                `The item description must be between 10 and 2000 characters`,
            );
        }
    }
}
