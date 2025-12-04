import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export class AuctionTitle extends StringValueObject {
    constructor(value: string) {
        super(value);
        this.ensureLengthIsWithinBounds(value);
    }

    private ensureLengthIsWithinBounds(value: string): void {
        if (value.length < 5 || value.length > 100) {
            throw new InvalidArgumentError(
                `The auction title <${value}> must be between 5 and 100 characters`,
            );
        }
    }
}
