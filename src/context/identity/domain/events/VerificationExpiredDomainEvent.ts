import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

type VerificationExpiredDomainEventAttributes = {
    aggregateId: string;
    accountId: string;
    verificationId: string;
};

export class VerificationExpiredDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'verification.expired';

    readonly accountId: string;
    readonly verificationId: string;

    constructor({
        aggregateId,
        accountId,
        verificationId,
        eventId,
        occurredOn,
    }: VerificationExpiredDomainEventAttributes & {
        eventId?: string;
        occurredOn?: Date;
    }) {
        super({
            eventName: VerificationExpiredDomainEvent.EVENT_NAME,
            aggregateId,
            eventId,
            occurredOn,
        });
        this.accountId = accountId;
        this.verificationId = verificationId;
    }

    toPrimitives() {
        return {
            aggregateId: this.aggregateId,
            accountId: this.accountId,
            verificationId: this.verificationId,
        };
    }

    static fromPrimitives(params: {
        aggregateId: string;
        eventId: string;
        occurredOn: Date;
        attributes: VerificationExpiredDomainEventAttributes;
    }): VerificationExpiredDomainEvent {
        return new VerificationExpiredDomainEvent({
            aggregateId: params.aggregateId,
            accountId: params.attributes.accountId,
            verificationId: params.attributes.verificationId,
            eventId: params.eventId,
            occurredOn: params.occurredOn,
        });
    }
}
