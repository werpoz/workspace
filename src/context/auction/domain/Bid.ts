import { BidId } from './value-object/BidId.vo';
import { BidAmount } from './value-object/BidAmount.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { AuctionId } from './value-object/AuctionId.vo';

export class Bid {
    readonly id: BidId;
    readonly auctionId: AuctionId;
    readonly amount: BidAmount;
    readonly bidderId: AccountID;
    readonly createdAt: Date;

    constructor(
        id: BidId,
        auctionId: AuctionId,
        amount: BidAmount,
        bidderId: AccountID,
        createdAt: Date,
    ) {
        this.id = id;
        this.auctionId = auctionId;
        this.amount = amount;
        this.bidderId = bidderId;
        this.createdAt = createdAt;
    }

    static create(auctionId: AuctionId, amount: BidAmount, bidderId: AccountID): Bid {
        return new Bid(BidId.random(), auctionId, amount, bidderId, new Date());
    }

    toPrimitives() {
        return {
            id: this.id.value,
            auctionId: this.auctionId.value,
            amount: this.amount.value,
            bidderId: this.bidderId.value,
            createdAt: this.createdAt.toISOString(),
        };
    }
}
