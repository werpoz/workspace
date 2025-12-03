import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';
import { validate as uuidValidate } from 'uuid';

export class VerificationToken extends StringValueObject {
    constructor(value: string) {
        VerificationToken.ensureIsValidToken(value);
        super(value);
    }

    private static ensureIsValidToken(value: string): void {
        if (!value || value.trim() === '') {
            throw new InvalidArgumentError(
                `<${VerificationToken.name}> cannot be empty.`,
            );
        }

        if (!uuidValidate(value)) {
            throw new InvalidArgumentError(
                `<${VerificationToken.name}> does not allow the value <${value}>. Must be a valid UUID.`,
            );
        }
    }
}
