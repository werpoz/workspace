import { Inject, Injectable } from '@nestjs/common';
import { Auction } from 'src/context/auction/domain/Auction';
import { AuctionRepository } from 'src/context/auction/domain/interface/AuctionRepository';
import { Nullable } from 'src/context/shared/domain/Nullable';
import { DRIZZLE } from 'src/context/shared/infrastructure/persistence/drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import { AuctionId } from 'src/context/auction/domain/value-object/AuctionId.vo';
import { ItemId } from 'src/context/auction/domain/value-object/ItemId.vo';
import { StartingPrice } from 'src/context/auction/domain/value-object/StartingPrice.vo';
import { AuctionStatus } from 'src/context/auction/domain/value-object/AuctionStatus.vo';
import { Bid } from 'src/context/auction/domain/Bid';
import { BidAmount } from 'src/context/auction/domain/value-object/BidAmount.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { BidId } from 'src/context/auction/domain/value-object/BidId.vo';

@Injectable()
export class DrizzleAuctionRepository implements AuctionRepository {
    constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) { }

    async save(auction: Auction): Promise<void> {
        const data = auction.toPrimitives();

        // Upsert Auction
        await this.db.insert(schema.auctions).values({
            id: data.id,
            title: 'Untitled Auction', // Placeholder
            description: 'No description',
            startingPrice: data.startingPrice,
            startDate: new Date(data.createdAt),
            endDate: new Date(data.endsAt),
            sellerId: '00000000-0000-0000-0000-000000000000', // Placeholder
            itemId: data.itemId,
            status: data.status,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: schema.auctions.id,
            set: {
                status: data.status,
                endDate: new Date(data.endsAt),
                updatedAt: new Date(),
            }
        });

        const bids = data.bids;
        if (bids.length > 0) {
            for (const bid of bids) {
                await this.db.insert(schema.bids).values({
                    id: bid.id,
                    auctionId: data.id,
                    bidderId: bid.bidderId,
                    amount: bid.amount,
                    createdAt: new Date(bid.createdAt)
                }).onConflictDoNothing();
            }
        }
    }

    async searchById(id: string): Promise<Nullable<Auction>> {
        const result = await this.db.query.auctions.findFirst({
            where: eq(schema.auctions.id, id),
        });

        if (!result) return null;

        const bidsResult = await this.db.select().from(schema.bids).where(eq(schema.bids.auctionId, id));

        const bids = bidsResult.map(b => new Bid(
            new BidId(b.id),
            new AuctionId(b.auctionId),
            new BidAmount(b.amount),
            new AccountID(b.bidderId),
            b.createdAt
        ));

        return new Auction(
            new AuctionId(result.id),
            new ItemId(result.itemId),
            new StartingPrice(result.startingPrice),
            new AuctionStatus(result.status as any),
            bids,
            result.createdAt,
            result.endDate
        );
    }
}
