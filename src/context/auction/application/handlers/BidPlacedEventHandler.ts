import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { BidPlacedDomainEvent } from '../../domain/events/BidPlacedDomainEvent';
import { AuctionGateway } from '../../infrastructure/websocket/AuctionGateway';
import { BullMQService } from 'src/context/shared/infrastructure/BullMQService';

@Injectable()
@EventsHandler(BidPlacedDomainEvent)
export class BidPlacedEventHandler implements IEventHandler<BidPlacedDomainEvent> {
    constructor(
        private readonly gateway: AuctionGateway,
        private readonly bullmq: BullMQService,
    ) { }

    async handle(event: BidPlacedDomainEvent) {
        console.log('Handling BidPlacedDomainEvent:', event);

        const auctionId = event.aggregateId; // auction ID is the aggregate

        // 1. Broadcast to WebSocket clients (real-time)
        this.gateway.emitNewBid(auctionId, {
            bidId: event.bidId,
            amount: event.amount,
            bidderId: event.bidderId,
            timestamp: event.occurredOn,
        });

        // 2. Queue email notification job (async)
        await this.bullmq.addJob(
            'email-notifications',
            'send-outbid-notification',
            {
                auctionId,
                newBidderId: event.bidderId,
                newAmount: event.amount,
                timestamp: event.occurredOn,
            }
        );

        console.log('BidPlacedEvent handled: WebSocket emitted + Email job queued');
    }
}
