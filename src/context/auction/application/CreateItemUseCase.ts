import { Inject, Injectable } from '@nestjs/common';
import type { ItemRepository } from '../domain/interface/ItemRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Item } from '../domain/Item';
import { ItemId } from '../domain/value-object/ItemId.vo';
import { ItemTitle } from '../domain/value-object/ItemTitle.vo';
import { ItemDescription } from '../domain/value-object/ItemDescription.vo';
import { ItemCategory } from '../domain/value-object/ItemCategory.vo';
import { ItemCondition } from '../domain/value-object/ItemCondition.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

@Injectable()
export class CreateItemUseCase {
    constructor(
        @Inject('ItemRepository')
        private readonly repository: ItemRepository,
        @Inject('DomainEventBus')
        private readonly eventBus: DomainEventBus,
    ) { }

    async execute(params: {
        id: string;
        title: string;
        description: string;
        category: string;
        condition: string;
        ownerId: string;
        images?: string[];
    }): Promise<void> {
        const item = Item.create(
            new ItemId(params.id),
            new ItemTitle(params.title),
            new ItemDescription(params.description),
            new ItemCategory(params.category as any),
            new ItemCondition(params.condition as any),
            new AccountID(params.ownerId),
            params.images || [],
        );

        await this.repository.save(item);
        await this.eventBus.publishAll(item.pullDomainEvents());
    }
}
