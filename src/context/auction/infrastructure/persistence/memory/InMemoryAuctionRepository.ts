import { Injectable } from '@nestjs/common';
import type { Auction } from 'src/context/auction/domain/Auction';
import type { AuctionRepository } from 'src/context/auction/domain/interface/AuctionRepository';
import type { Nullable } from 'src/context/shared/domain/Nullable';

@Injectable()
export class InMemoryAuctionRepository implements AuctionRepository {
    private auctions = new Map<string, Auction>();

    async save(auction: Auction): Promise<void> {
        this.auctions.set(auction.id.value, auction);
    }

    async searchById(id: string): Promise<Nullable<Auction>> {
        return this.auctions.get(id) ?? null;
    }
}
