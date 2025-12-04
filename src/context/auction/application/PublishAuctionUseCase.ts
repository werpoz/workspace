import { Inject, Injectable } from '@nestjs/common';
import type { AuctionRepository } from '../domain/interface/AuctionRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';

@Injectable()
export class PublishAuctionUseCase {
    constructor(
        @Inject('AuctionRepository')
        private readonly repository: AuctionRepository,
        @Inject('DomainEventBus')
        private readonly eventBus: DomainEventBus,
    ) { }

    async execute(params: { auctionId: string }): Promise<void> {
        const auction = await this.repository.searchById(params.auctionId);

        if (!auction) {
            throw new Error('Auction not found');
        }

        auction.publish();

        await this.repository.save(auction);
        await this.eventBus.publishAll(auction.pullDomainEvents());
    }
}
