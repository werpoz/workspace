import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class AuctionPublishedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'auction.published';

    readonly itemId: string;
    readonly startingPrice: number;
    readonly endsAt: string;

    constructor({
        aggregateId,
        itemId,
        startingPrice,
        endsAt,
        eventId,
        occurredOn,
    }: {
        aggregateId: string;
        itemId: string;
        startingPrice: number;
        endsAt: string;
        eventId?: string;
        occurredOn?: Date;
    }) {
        super({
            eventName: AuctionPublishedDomainEvent.EVENT_NAME,
            aggregateId,
            eventId,
            occurredOn,
        });
        this.itemId = itemId;
        this.startingPrice = startingPrice;
        this.endsAt = endsAt;
    }

    toPrimitives() {
        return {
            aggregateId: this.aggregateId,
            itemId: this.itemId,
            startingPrice: this.startingPrice,
            endsAt: this.endsAt,
            eventName: AuctionPublishedDomainEvent.EVENT_NAME,
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
        const { itemId, startingPrice, endsAt } = params.attributes;
        return new AuctionPublishedDomainEvent({
            aggregateId: params.aggregateId,
            itemId,
            startingPrice,
            endsAt,
            eventId: params.eventId,
            occurredOn: params.occurredOn,
        });
    }
}
