import { Module } from '@nestjs/common';
import { EventBusModule } from '../shared/eventBus.module';
import { NotifierModule } from '../notifier/notifier.module';
import { DrizzleAuctionRepository } from './infrastructure/persistence/drizzle/DrizzleAuctionRepository';
import { DrizzleModule } from '../shared/infrastructure/persistence/drizzle/drizzle.module';
import { InMemoryItemRepository } from './infrastructure/persistence/memory/InMemoryItemRepository';
import { InMemoryAuctionRepository } from './infrastructure/persistence/memory/InMemoryAuctionRepository';
import { CreateAuctionUseCase } from './application/CreateAuctionUseCase';
import { PublishAuctionUseCase } from './application/PublishAuctionUseCase';
import { PlaceBidUseCase } from './application/PlaceBidUseCase';
import { CreateItemUseCase } from './application/CreateItemUseCase';
import { AuctionController } from './infrastructure/http/controller/AuctionController';
import { ItemController } from './infrastructure/http/controller/ItemController';
import { AuctionGateway } from './infrastructure/websocket/AuctionGateway';
import { BidPlacedEventHandler } from './application/handlers/BidPlacedEventHandler';
import { AuctionPublishedEventHandler } from './application/handlers/AuctionPublishedEventHandler';
import { BullMQService } from '../shared/infrastructure/BullMQService';
import { EmailNotificationWorker } from './infrastructure/workers/EmailNotificationWorker';
import { AuctionClosingWorker } from './infrastructure/workers/AuctionClosingWorker';

const isProd = process.env.NODE_ENV === 'production';

@Module({
    imports: [EventBusModule, NotifierModule, DrizzleModule],
    controllers: [AuctionController, ItemController],
    providers: [
        // Use Cases
        CreateAuctionUseCase,
        PublishAuctionUseCase,
        PlaceBidUseCase,
        CreateItemUseCase,

        // Repositories
        DrizzleAuctionRepository,
        InMemoryAuctionRepository,
        {
            provide: 'AuctionRepository',
            useClass: isProd ? DrizzleAuctionRepository : InMemoryAuctionRepository,
        },
        {
            provide: 'ItemRepository',
            useClass: InMemoryItemRepository,
        },

        // WebSocket Gateway
        AuctionGateway,

        // Event Handlers
        BidPlacedEventHandler,
        AuctionPublishedEventHandler,

        // BullMQ
        BullMQService,

        // Workers
        EmailNotificationWorker,
        AuctionClosingWorker,
    ],
    exports: [
        CreateAuctionUseCase,
        PublishAuctionUseCase,
        PlaceBidUseCase,
        CreateItemUseCase,
        AuctionGateway,
        BullMQService,
    ],
})
export class AuctionModule { }
