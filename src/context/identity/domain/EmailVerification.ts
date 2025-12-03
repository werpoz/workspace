import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { AccountID } from './value-object/AccountID.vo';
import { VerificationMethod, VerificationMethodEnum } from './value-object/VerificationMethod.vo';
import { VerificationToken } from './value-object/VerificationToken.vo';
import { VerificationCode } from './value-object/VerificationCode.vo';
import { Nullable } from 'src/context/shared/domain/Nullable';

export class EmailVerification extends AggregateRoot {
    readonly id: Uuid;
    readonly accountId: AccountID;
    readonly method: VerificationMethod;
    readonly token: Nullable<VerificationToken>;
    readonly code: Nullable<VerificationCode>;
    readonly expiresAt: Date;
    private _attempts: number;
    private _verified: boolean;
    private _verifiedAt: Nullable<Date>;

    private constructor(
        id: Uuid,
        accountId: AccountID,
        method: VerificationMethod,
        token: Nullable<VerificationToken>,
        code: Nullable<VerificationCode>,
        expiresAt: Date,
        attempts: number,
        verified: boolean,
        verifiedAt: Nullable<Date>,
    ) {
        super();
        this.id = id;
        this.accountId = accountId;
        this.method = method;
        this.token = token;
        this.code = code;
        this.expiresAt = expiresAt;
        this._attempts = attempts;
        this._verified = verified;
        this._verifiedAt = verifiedAt;
    }

    get attempts(): number {
        return this._attempts;
    }

    get verified(): boolean {
        return this._verified;
    }

    get verifiedAt(): Nullable<Date> {
        return this._verifiedAt;
    }

    static create(
        accountId: AccountID,
        method: VerificationMethod,
        expiryMinutes: number = 30,
    ): EmailVerification {
        const id = Uuid.random();
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        let token: Nullable<VerificationToken> = null;
        let code: Nullable<VerificationCode> = null;

        if (method.isEmailLink()) {
            token = new VerificationToken(Uuid.random().value);
        } else {
            code = VerificationCode.generate();
        }

        return new EmailVerification(
            id,
            accountId,
            method,
            token,
            code,
            expiresAt,
            0,
            false,
            null,
        );
    }

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isValid(): boolean {
        return !this._verified && !this.isExpired() && this._attempts < 3;
    }

    incrementAttempts(): void {
        this._attempts++;
    }

    verify(): void {
        this._verified = true;
        this._verifiedAt = new Date();
    }

    static fromPrimitives(plainData: {
        id: string;
        accountId: string;
        method: string;
        token: Nullable<string>;
        code: Nullable<string>;
        expiresAt: string;
        attempts: number;
        verified: boolean;
        verifiedAt: Nullable<string>;
    }): EmailVerification {
        return new EmailVerification(
            new Uuid(plainData.id),
            new AccountID(plainData.accountId),
            new VerificationMethod(plainData.method as VerificationMethodEnum),
            plainData.token ? new VerificationToken(plainData.token) : null,
            plainData.code ? new VerificationCode(plainData.code) : null,
            new Date(plainData.expiresAt),
            plainData.attempts,
            plainData.verified,
            plainData.verifiedAt ? new Date(plainData.verifiedAt) : null,
        );
    }

    toPrimitives() {
        return {
            id: this.id.value,
            accountId: this.accountId.value,
            method: this.method.value,
            token: this.token?.value ?? null,
            code: this.code?.value ?? null,
            expiresAt: this.expiresAt.toISOString(),
            attempts: this._attempts,
            verified: this._verified,
            verifiedAt: this._verifiedAt?.toISOString() ?? null,
        };
    }
}
