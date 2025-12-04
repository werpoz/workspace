import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class BidPlacedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'auction.bid_placed';

    readonly bidId: string;
    readonly amount: number;
    readonly previousPrice: number;
    readonly bidderId: string;

    constructor({
        aggregateId,
        bidId,
        amount,
        previousPrice,
        bidderId,
        eventId,
        occurredOn,
    }: {
        aggregateId: string;
        bidId: string;
        amount: number;
        previousPrice: number;
        bidderId: string;
        eventId?: string;
        occurredOn?: Date;
    }) {
        super({
            eventName: BidPlacedDomainEvent.EVENT_NAME, aggregateId, eventId, occurredOn
        });
        this.bidId = bidId;
        this.amount = amount;
        this.previousPrice = previousPrice;
        this.bidderId = bidderId;
    }

    toPrimitives() {
        return {
            aggregateId: this.aggregateId,
            bidId: this.bidId,
            amount: this.amount,
            previousPrice: this.previousPrice,
            bidderId: this.bidderId,
            eventName: BidPlacedDomainEvent.EVENT_NAME,
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
        const { bidId, amount, previousPrice, bidderId } = params.attributes;
        return new BidPlacedDomainEvent({
            aggregateId: params.aggregateId,
            bidId,
            amount,
            previousPrice,
            bidderId,
            eventId: params.eventId,
            occurredOn: params.occurredOn,
        });
    }
}
