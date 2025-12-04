import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export class ItemTitle extends StringValueObject {
    constructor(value: string) {
        super(value);
        this.ensureLengthIsWithinBounds(value);
    }

    private ensureLengthIsWithinBounds(value: string): void {
        if (value.length < 3 || value.length > 150) {
            throw new InvalidArgumentError(
                `The item title <${value}> must be between 3 and 150 characters`,
            );
        }
    }
}
