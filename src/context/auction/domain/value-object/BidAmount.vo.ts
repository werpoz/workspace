import { NumberValueObject } from 'src/context/shared/domain/value-object/NumberValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export class BidAmount extends NumberValueObject {
    constructor(value: number) {
        super(value);
        this.ensureIsPositive(value);
    }

    private ensureIsPositive(value: number): void {
        if (value <= 0) {
            throw new InvalidArgumentError(
                `The bid amount <${value}> must be greater than zero`,
            );
        }
    }
}
