import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export enum VerificationMethodEnum {
    EMAIL_LINK = 'email_link',
    EMAIL_CODE = 'email_code',
}

export class VerificationMethod extends EnumValueObject<VerificationMethodEnum> {
    constructor(value: VerificationMethodEnum) {
        super(value, Object.values(VerificationMethodEnum));
    }

    protected throwErrorForInvalidValue(value: VerificationMethodEnum): void {
        throw new InvalidArgumentError(
            `<${VerificationMethod.name}> does not allow the value <${value}>`,
        );
    }

    static emailLink(): VerificationMethod {
        return new VerificationMethod(VerificationMethodEnum.EMAIL_LINK);
    }

    static emailCode(): VerificationMethod {
        return new VerificationMethod(VerificationMethodEnum.EMAIL_CODE);
    }

    isEmailLink(): boolean {
        return this.value === VerificationMethodEnum.EMAIL_LINK;
    }

    isEmailCode(): boolean {
        return this.value === VerificationMethodEnum.EMAIL_CODE;
    }
}
