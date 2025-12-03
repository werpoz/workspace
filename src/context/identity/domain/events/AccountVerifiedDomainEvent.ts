import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

type AccountVerifiedDomainEventAttributes = {
    aggregateId: string;
    email: string;
    verifiedAt: string;
};

export class AccountVerifiedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'account.verified';

    readonly email: string;
    readonly verifiedAt: Date;

    constructor({
        aggregateId,
        email,
        verifiedAt,
        eventId,
        occurredOn,
    }: AccountVerifiedDomainEventAttributes & {
        eventId?: string;
        occurredOn?: Date;
    }) {
        super({
            eventName: AccountVerifiedDomainEvent.EVENT_NAME,
            aggregateId,
            eventId,
            occurredOn,
        });
        this.email = email;
        this.verifiedAt = typeof verifiedAt === 'string' ? new Date(verifiedAt) : verifiedAt;
    }

    toPrimitives() {
        return {
            aggregateId: this.aggregateId,
            email: this.email,
            verifiedAt: this.verifiedAt.toISOString(),
        };
    }

    static fromPrimitives(params: {
        aggregateId: string;
        eventId: string;
        occurredOn: Date;
        attributes: AccountVerifiedDomainEventAttributes;
    }): AccountVerifiedDomainEvent {
        return new AccountVerifiedDomainEvent({
            aggregateId: params.aggregateId,
            email: params.attributes.email,
            verifiedAt: params.attributes.verifiedAt,
            eventId: params.eventId,
            occurredOn: params.occurredOn,
        });
    }
}
