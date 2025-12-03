import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export class VerificationCode extends StringValueObject {
    private static readonly CODE_LENGTH = 6;
    private static readonly CODE_REGEX = /^\d{6}$/;

    constructor(value: string) {
        super(value);
        this.ensureIsValidCode(value);
    }

    private ensureIsValidCode(value: string): void {
        if (!VerificationCode.CODE_REGEX.test(value)) {
            throw new InvalidArgumentError(
                `<${VerificationCode.name}> must be exactly ${VerificationCode.CODE_LENGTH} digits. Got: <${value}>`,
            );
        }
    }

    static generate(): VerificationCode {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return new VerificationCode(code);
    }
}
