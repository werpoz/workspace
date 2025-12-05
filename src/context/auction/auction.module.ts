import { Module } from '@nestjs/common';
import { EventBusModule } from '../shared/eventBus.module';
import { InMemoryAuctionRepository } from './infrastructure/persistence/memory/InMemoryAuctionRepository';
import { InMemoryItemRepository } from './infrastructure/persistence/memory/InMemoryItemRepository';
import { CreateAuctionUseCase } from './application/CreateAuctionUseCase';
import { PublishAuctionUseCase } from './application/PublishAuctionUseCase';
import { PlaceBidUseCase } from './application/PlaceBidUseCase';
import { CreateItemUseCase } from './application/CreateItemUseCase';
import { AuctionController } from './infrastructure/http/controller/AuctionController';
import { ItemController } from './infrastructure/http/controller/ItemController';

@Module({
    imports: [EventBusModule],
    controllers: [AuctionController, ItemController],
    providers: [
        // Use Cases
        CreateAuctionUseCase,
        PublishAuctionUseCase,
        PlaceBidUseCase,
        CreateItemUseCase,

        // Repositories
        {
            provide: 'AuctionRepository',
            useClass: InMemoryAuctionRepository,
        },
        {
            provide: 'ItemRepository',
            useClass: InMemoryItemRepository,
        },
    ],
    exports: [
        CreateAuctionUseCase,
        PublishAuctionUseCase,
        PlaceBidUseCase,
        CreateItemUseCase,
    ],
})
export class AuctionModule { }
