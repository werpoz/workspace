import { NumberValueObject } from 'src/context/shared/domain/value-object/NumberValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export class StartingPrice extends NumberValueObject {
    constructor(value: number) {
        super(value);
        this.ensureIsPositive(value);
    }

    private ensureIsPositive(value: number): void {
        if (value < 0) {
            throw new InvalidArgumentError(
                `The starting price <${value}> must be positive`,
            );
        }
    }
}
