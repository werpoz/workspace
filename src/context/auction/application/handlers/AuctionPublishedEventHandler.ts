import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AuctionPublishedDomainEvent } from '../../domain/events/AuctionPublishedDomainEvent';
import { AuctionGateway } from '../../infrastructure/websocket/AuctionGateway';
import { BullMQService } from 'src/context/shared/infrastructure/BullMQService';

@Injectable()
@EventsHandler(AuctionPublishedDomainEvent)
export class AuctionPublishedEventHandler implements IEventHandler<AuctionPublishedDomainEvent> {
    constructor(
        private readonly gateway: AuctionGateway,
        private readonly bullmq: BullMQService,
    ) { }

    async handle(event: AuctionPublishedDomainEvent) {
        console.log('Handling AuctionPublishedDomainEvent:', event);

        // 1. Broadcast to WebSocket clients
        this.gateway.emitAuctionPublished(event.aggregateId, {
            id: event.aggregateId,
            status: 'active',
            publishedAt: event.occurredOn,
        });

        // 2. Schedule auction closing job based on endsAt
        const endsAt = new Date(event.endsAt);
        const now = new Date();
        const delay = endsAt.getTime() - now.getTime();

        if (delay > 0) {
            await this.bullmq.addJob(
                'auction-closing',
                'close-auction',
                {
                    auctionId: event.aggregateId,
                    endsAt: event.endsAt,
                },
                {
                    delay, // Close auction at exact time
                }
            );

            console.log(`Scheduled auction ${event.aggregateId} to close in ${delay}ms`);
        }

        console.log('AuctionPublishedEvent handled: WebSocket emitted + Closing job scheduled');
    }
}
