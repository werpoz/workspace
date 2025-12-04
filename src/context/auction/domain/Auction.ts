import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { AuctionId } from './value-object/AuctionId.vo';
import { AuctionTitle } from './value-object/AuctionTitle.vo';
import { StartingPrice } from './value-object/StartingPrice.vo';
import { AuctionStatus } from './value-object/AuctionStatus.vo';
import { Bid } from './Bid';
import { BidAmount } from './value-object/BidAmount.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { AuctionCreatedDomainEvent } from './events/AuctionCreatedDomainEvent';
import { BidPlacedDomainEvent } from './events/BidPlacedDomainEvent';
import { AuctionPublishedDomainEvent } from './events/AuctionPublishedDomainEvent';


export class Auction extends AggregateRoot {
    readonly id: AuctionId;
    readonly title: AuctionTitle;
    readonly startingPrice: StartingPrice;
    private _status: AuctionStatus;
    private _bids: Bid[];
    readonly createdAt: Date;
    readonly endsAt: Date;

    constructor(
        id: AuctionId,
        title: AuctionTitle,
        startingPrice: StartingPrice,
        status: AuctionStatus,
        bids: Bid[],
        createdAt: Date,
        endsAt: Date,
    ) {
        super();
        this.id = id;
        this.title = title;
        this.startingPrice = startingPrice;
        this._status = status;
        this._bids = bids;
        this.createdAt = createdAt;
        this.endsAt = endsAt;
    }

    static create(
        id: AuctionId,
        title: AuctionTitle,
        startingPrice: StartingPrice,
        endsAt: Date,
    ): Auction {
        const auction = new Auction(
            id,
            title,
            startingPrice,
            AuctionStatus.draft(),
            [],
            new Date(),
            endsAt,
        );

        auction.record(
            new AuctionCreatedDomainEvent({
                aggregateId: id.value,
                title: title.value,
                startingPrice: startingPrice.value,
                endsAt: endsAt.toISOString(),
            }),
        );

        return auction;
    }

    get status(): AuctionStatus {
        return this._status;
    }

    get bids(): Bid[] {
        return [...this._bids];
    }

    get currentPrice(): number {
        if (this._bids.length === 0) {
            return this.startingPrice.value;
        }
        // Assuming bids are ordered or we find the max
        // For simplicity, let's assume the last bid is the highest for now, 
        // but a robust implementation would find the max.
        return Math.max(...this._bids.map((b) => b.amount.value));
    }

    placeBid(bidAmount: BidAmount, bidderId: AccountID): void {
        if (this._status.value !== 'active') {
            throw new Error('Auction is not active');
        }

        const previousPrice = this.currentPrice;

        if (bidAmount.value <= previousPrice) {
            throw new Error('Bid amount must be higher than current price');
        }

        if (new Date() > this.endsAt) {
            throw new Error('Auction has ended');
        }

        const bid = Bid.create(this.id, bidAmount, bidderId);
        this._bids.push(bid);

        this.record(
            new BidPlacedDomainEvent({
                aggregateId: this.id.value,
                bidId: bid.id.value,
                amount: bid.amount.value,
                previousPrice,
                bidderId: bidderId.value,
            }),
        );
    }

    publish(): void {
        if (this._status.value !== 'draft') {
            throw new Error('Only draft auctions can be published');
        }

        this._status = AuctionStatus.active();

        this.record(
            new AuctionPublishedDomainEvent({
                aggregateId: this.id.value,
                title: this.title.value,
                startingPrice: this.startingPrice.value,
                endsAt: this.endsAt.toISOString(),
            }),
        );
    }

    toPrimitives() {
        return {
            id: this.id.value,
            title: this.title.value,
            startingPrice: this.startingPrice.value,
            status: this._status.value,
            bids: this._bids.map((b) => b.toPrimitives()),
            createdAt: this.createdAt.toISOString(),
            endsAt: this.endsAt.toISOString(),
        };
    }
}
