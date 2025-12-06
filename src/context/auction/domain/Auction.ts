import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { AuctionId } from './value-object/AuctionId.vo';
import { ItemId } from './value-object/ItemId.vo';
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
    readonly itemId: ItemId;
    readonly startingPrice: StartingPrice;
    private _status: AuctionStatus;
    private _bids: Bid[];
    readonly createdAt: Date;
    private _endsAt: Date; // Made mutable for anti-sniping

    constructor(
        id: AuctionId,
        itemId: ItemId,
        startingPrice: StartingPrice,
        status: AuctionStatus,
        bids: Bid[],
        createdAt: Date,
        endsAt: Date,
    ) {
        super();
        this.id = id;
        this.itemId = itemId;
        this.startingPrice = startingPrice;
        this._status = status;
        this._bids = bids;
        this.createdAt = createdAt;
        this._endsAt = endsAt;
    }

    // Getter for endsAt
    get endsAt(): Date {
        return this._endsAt;
    }

    static create(
        id: AuctionId,
        itemId: ItemId,
        startingPrice: StartingPrice,
        endsAt: Date,
    ): Auction {
        const auction = new Auction(
            id,
            itemId,
            startingPrice,
            AuctionStatus.draft(),
            [],
            new Date(),
            endsAt,
        );

        auction.record(
            new AuctionCreatedDomainEvent({
                aggregateId: id.value,
                itemId: itemId.value,
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
        // Rule 1: Auction must be active
        if (this._status.value !== 'active') {
            throw new Error('Auction is not active');
        }

        // Rule 2: Auction must not have ended
        if (new Date() > this.endsAt) {
            throw new Error('Auction has ended');
        }

        const previousPrice = this.currentPrice;

        // Rule 3: Bid must be higher than current price
        if (bidAmount.value <= previousPrice) {
            throw new Error('Bid amount must be higher than current price');
        }

        // Rule 4: Minimum increment (5% or $5, whichever is higher)
        const minIncrement = Math.max(5, previousPrice * 0.05);
        if (bidAmount.value < previousPrice + minIncrement) {
            throw new Error(
                `Bid must be at least $${minIncrement.toFixed(2)} higher than current price`
            );
        }

        // Rule 5: No self-bidding (cannot bid over your own bid)
        if (this._bids.length > 0) {
            const lastBid = this._bids[this._bids.length - 1];
            if (lastBid.bidderId.value === bidderId.value) {
                throw new Error('Cannot bid on your own bid');
            }
        }

        // TODO: Rule 6 - Owner cannot bid on their own auction
        // This requires adding ownerId to Auction aggregate
        // Implementation pending when ownerId is available

        const bid = Bid.create(this.id, bidAmount, bidderId);
        this._bids.push(bid);

        // Rule 7: Anti-sniping - Extend auction if bid in last 2 minutes
        const timeLeft = this.endsAt.getTime() - Date.now();
        const twoMinutesMs = 2 * 60 * 1000; // 2 minutes in milliseconds

        if (timeLeft < twoMinutesMs && timeLeft > 0) {
            // Extend auction by 2 minutes from now
            this._endsAt = new Date(Date.now() + twoMinutesMs);
        }

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
                itemId: this.itemId.value,
                startingPrice: this.startingPrice.value,
                endsAt: this.endsAt.toISOString(),
            }),
        );
    }

    toPrimitives() {
        return {
            id: this.id.value,
            itemId: this.itemId.value,
            startingPrice: this.startingPrice.value,
            status: this._status.value,
            bids: this._bids.map((b) => b.toPrimitives()),
            createdAt: this.createdAt.toISOString(),
            endsAt: this._endsAt.toISOString(),
        };
    }
}
