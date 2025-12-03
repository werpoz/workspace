import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

type AccountVerificationRequestedDomainEventAttributes = {
    aggregateId: string;
    email: string;
    method: 'email_link' | 'email_code';
    verificationId: string;
    token?: string;
    code?: string;
};

export class AccountVerificationRequestedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'account.verification.requested';

    readonly email: string;
    readonly method: 'email_link' | 'email_code';
    readonly verificationId: string;
    readonly token?: string;
    readonly code?: string;

    constructor({
        aggregateId,
        email,
        method,
        verificationId,
        token,
        code,
        eventId,
        occurredOn,
    }: AccountVerificationRequestedDomainEventAttributes & {
        eventId?: string;
        occurredOn?: Date;
    }) {
        super({
            eventName: AccountVerificationRequestedDomainEvent.EVENT_NAME,
            aggregateId,
            eventId,
            occurredOn,
        });
        this.email = email;
        this.method = method;
        this.verificationId = verificationId;
        this.token = token;
        this.code = code;
    }

    toPrimitives() {
        return {
            aggregateId: this.aggregateId,
            email: this.email,
            method: this.method,
            verificationId: this.verificationId,
            token: this.token,
            code: this.code,
        };
    }

    static fromPrimitives(params: {
        aggregateId: string;
        eventId: string;
        occurredOn: Date;
        attributes: AccountVerificationRequestedDomainEventAttributes;
    }): AccountVerificationRequestedDomainEvent {
        return new AccountVerificationRequestedDomainEvent({
            aggregateId: params.aggregateId,
            email: params.attributes.email,
            method: params.attributes.method,
            verificationId: params.attributes.verificationId,
            token: params.attributes.token,
            code: params.attributes.code,
            eventId: params.eventId,
            occurredOn: params.occurredOn,
        });
    }
}
