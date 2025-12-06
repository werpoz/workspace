import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { BullMQService } from 'src/context/shared/infrastructure/BullMQService';
import type { AuctionRepository } from '../../domain/interface/AuctionRepository';
import { AuctionGateway } from '../websocket/AuctionGateway';

interface CloseAuctionJob {
    auctionId: string;
    endsAt: Date;
}

@Injectable()
export class AuctionClosingWorker implements OnModuleInit {
    constructor(
        private readonly bullmq: BullMQService,
        @Inject('AuctionRepository')
        private readonly auctionRepository: AuctionRepository,
        private readonly gateway: AuctionGateway,
    ) { }

    async onModuleInit() {
        // Register worker for auction closing queue
        this.bullmq.registerWorker<CloseAuctionJob>(
            'auction-closing',
            async (job) => {
                await this.handleCloseAuction(job.data);
            },
            {
                concurrency: 3,
            }
        );

        console.log('AuctionClosingWorker initialized');
    }

    private async handleCloseAuction(data: CloseAuctionJob) {
        console.log(`Closing auction ${data.auctionId}`);

        try {
            // 1. Get auction
            const auction = await this.auctionRepository.searchById(data.auctionId);

            if (!auction) {
                console.warn(`Auction ${data.auctionId} not found`);
                return;
            }

            // 2. Check if already closed
            if (auction.status.value !== 'active') {
                console.log(`Auction ${data.auctionId} is already ${auction.status.value}`);
                return;
            }

            // 3. Check if expired
            if (auction.endsAt > new Date()) {
                console.log(`Auction ${data.auctionId} has not ended yet`);
                return;
            }

            // 4. Determine winner (highest bid)
            const winner = auction.bids.length > 0
                ? auction.bids.sort((a, b) => b.amount.value - a.amount.value)[0]
                : null;

            // 5. Close auction (for now, manually update status)
            // TODO: Add close() method to Auction aggregate
            // auction.close();

            // 6. Save
            // await this.auctionRepository.save(auction);

            // 7. Emit WebSocket event
            this.gateway.emitAuctionEnded(data.auctionId, {
                id: data.auctionId,
                winnerId: winner?.bidderId.value,
                finalPrice: winner?.amount.value,
                endedAt: new Date(),
            });

            // 8. Queue winner notification
            if (winner) {
                await this.bullmq.addJob(
                    'email-notifications',
                    'send-auction-ended-notification',
                    {
                        auctionId: data.auctionId,
                        winnerId: winner.bidderId.value,
                        finalPrice: winner.amount.value,
                    }
                );
            }

            console.log(`Auction ${data.auctionId} closed successfully`);
        } catch (error) {
            console.error(`Error closing auction ${data.auctionId}:`, error);
            throw error; // Re-throw to trigger retry
        }
    }
}
