import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export enum AccountStatusEnum {
    PENDING_VERIFICATION = 'pending_verification',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
}

export class AccountStatus extends EnumValueObject<AccountStatusEnum> {
    constructor(value: AccountStatusEnum) {
        super(value, Object.values(AccountStatusEnum));
    }

    protected throwErrorForInvalidValue(value: AccountStatusEnum): void {
        throw new InvalidArgumentError(
            `<${AccountStatus.name}> does not allow the value <${value}>`,
        );
    }

    static pendingVerification(): AccountStatus {
        return new AccountStatus(AccountStatusEnum.PENDING_VERIFICATION);
    }

    static active(): AccountStatus {
        return new AccountStatus(AccountStatusEnum.ACTIVE);
    }

    static suspended(): AccountStatus {
        return new AccountStatus(AccountStatusEnum.SUSPENDED);
    }

    isPendingVerification(): boolean {
        return this.value === AccountStatusEnum.PENDING_VERIFICATION;
    }

    isActive(): boolean {
        return this.value === AccountStatusEnum.ACTIVE;
    }

    isSuspended(): boolean {
        return this.value === AccountStatusEnum.SUSPENDED;
    }
}
