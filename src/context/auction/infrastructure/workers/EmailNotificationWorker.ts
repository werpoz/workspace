import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { BullMQService } from 'src/context/shared/infrastructure/BullMQService';
import { SendEmailUseCase } from 'src/context/notifier/application/SendEmailUseCase';
import type { AuctionRepository } from '../../domain/interface/AuctionRepository';

interface OutbidNotificationJob {
    auctionId: string;
    newBidderId: string;
    newAmount: number;
    timestamp: Date;
}

interface AuctionEndedNotificationJob {
    auctionId: string;
    winnerId?: string;
    finalPrice?: number;
}

@Injectable()
export class EmailNotificationWorker implements OnModuleInit {
    constructor(
        private readonly bullmq: BullMQService,
        private readonly sendEmailUseCase: SendEmailUseCase,
        @Inject('AuctionRepository')
        private readonly auctionRepository: AuctionRepository,
    ) { }

    async onModuleInit() {
        // Register worker for email notifications queue
        this.bullmq.registerWorker<OutbidNotificationJob | AuctionEndedNotificationJob>(
            'email-notifications',
            async (job) => {
                switch (job.name) {
                    case 'send-outbid-notification':
                        await this.handleOutbidNotification(job.data as OutbidNotificationJob);
                        break;
                    case 'send-auction-ended-notification':
                        await this.handleAuctionEndedNotification(job.data as AuctionEndedNotificationJob);
                        break;
                    default:
                        console.warn(`Unknown job type: ${job.name}`);
                }
            },
            {
                concurrency: 5,
                limiter: {
                    max: 10, // Max 10 emails
                    duration: 1000, // Per second
                },
            }
        );

        console.log('EmailNotificationWorker initialized');
    }

    private async handleOutbidNotification(data: OutbidNotificationJob) {
        console.log('Processing outbid notification:', data);

        // TODO: Get previous bidders from auction
        // For now, just log
        // const auction = await this.auctionRepository.searchById(data.auctionId);
        // const previousBidders = auction?.bids.filter(b => b.bidderId !== data.newBidderId);

        // In a real implementation, you would:
        // 1. Get all previous bidders
        // 2. Send email to each one
        // await this.sendEmailUseCase.execute({
        //     to: bidder.email,
        //     subject: 'You have been outbid!',
        //     body: `Someone placed a bid of $${data.newAmount} on auction ${data.auctionId}`
        // });

        console.log(`Outbid notifications sent for auction ${data.auctionId}`);
    }

    private async handleAuctionEndedNotification(data: AuctionEndedNotificationJob) {
        console.log('Processing auction ended notification:', data);

        // TODO: Send email to winner
        // In a real implementation:
        // 1. Get winner's email
        // 2. Send congratulations email
        // await this.sendEmailUseCase.execute({
        //     to: winner.email,
        //     subject: 'Congratulations! You won the auction!',
        //     body: `You won the auction with a bid of $${data.finalPrice}`
        // });

        console.log(`Winner notification sent for auction ${data.auctionId}`);
    }
}
