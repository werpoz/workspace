import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class AuctionCreatedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'auction.created';

    readonly title: string;
    readonly startingPrice: number;
    readonly endsAt: string;

    constructor({
        aggregateId,
        title,
        startingPrice,
        endsAt,
        eventId,
        occurredOn,
    }: {
        aggregateId: string;
        title: string;
        startingPrice: number;
        endsAt: string;
        eventId?: string;
        occurredOn?: Date;
    }) {
        super(
            { eventName: AuctionCreatedDomainEvent.EVENT_NAME, aggregateId, eventId, occurredOn }
        );


        this.title = title;
        this.startingPrice = startingPrice;
        this.endsAt = endsAt;
    }

    toPrimitives() {
        return {
            aggregateId: this.aggregateId,
            title: this.title,
            startingPrice: this.startingPrice,
            endsAt: this.endsAt,
            eventName: AuctionCreatedDomainEvent.EVENT_NAME,
            eventId: this.eventId,
            occurredOn: this.occurredOn,
        };
    }

    static fromPrimitives(params: {
        aggregateId: string;
        attributes: any;
        eventId: string;
        occurredOn: Date;
    }): DomainEvent {
        const { title, startingPrice, endsAt } = params.attributes;
        return new AuctionCreatedDomainEvent({
            aggregateId: params.aggregateId,
            title,
            startingPrice,
            endsAt,
            eventId: params.eventId,
            occurredOn: params.occurredOn,
        });
    }
}
