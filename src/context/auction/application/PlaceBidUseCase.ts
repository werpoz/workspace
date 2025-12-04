import { Inject, Injectable } from '@nestjs/common';
import type { AuctionRepository } from '../domain/interface/AuctionRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { BidAmount } from '../domain/value-object/BidAmount.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

@Injectable()
export class PlaceBidUseCase {
    constructor(
        @Inject('AuctionRepository')
        private readonly repository: AuctionRepository,
        @Inject('DomainEventBus')
        private readonly eventBus: DomainEventBus,
    ) { }

    async execute(params: {
        auctionId: string;
        bidderId: string;
        amount: number;
    }): Promise<void> {
        const auction = await this.repository.searchById(params.auctionId);

        if (!auction) {
            throw new Error('Auction not found');
        }

        auction.placeBid(
            new BidAmount(params.amount),
            new AccountID(params.bidderId),
        );

        await this.repository.save(auction);
        await this.eventBus.publishAll(auction.pullDomainEvents());
    }
}
