import { Inject, Injectable } from '@nestjs/common';
import type { AuctionRepository } from '../domain/interface/AuctionRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Auction } from '../domain/Auction';
import { AuctionId } from '../domain/value-object/AuctionId.vo';
import { ItemId } from '../domain/value-object/ItemId.vo';
import { StartingPrice } from '../domain/value-object/StartingPrice.vo';

@Injectable()
export class CreateAuctionUseCase {
    constructor(
        @Inject('AuctionRepository')
        private readonly repository: AuctionRepository,
        @Inject('DomainEventBus')
        private readonly eventBus: DomainEventBus,
    ) { }

    async execute(params: {
        id: string;
        itemId: string;
        startingPrice: number;
        endsAt: Date;
    }): Promise<void> {
        // Validate that auction ends in the future
        if (params.endsAt <= new Date()) {
            throw new Error('Auction end date must be in the future');
        }

        const auction = Auction.create(
            new AuctionId(params.id),
            new ItemId(params.itemId),
            new StartingPrice(params.startingPrice),
            params.endsAt,
        );

        await this.repository.save(auction);
        await this.eventBus.publishAll(auction.pullDomainEvents());
    }
}
