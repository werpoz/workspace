import { Injectable } from '@nestjs/common';
import type { Item } from 'src/context/auction/domain/Item';
import type { ItemRepository } from 'src/context/auction/domain/interface/ItemRepository';
import type { Nullable } from 'src/context/shared/domain/Nullable';

@Injectable()
export class InMemoryItemRepository implements ItemRepository {
    private items = new Map<string, Item>();

    async save(item: Item): Promise<void> {
        this.items.set(item.id.value, item);
    }

    async searchById(id: string): Promise<Nullable<Item>> {
        return this.items.get(id) ?? null;
    }

    async findByOwnerId(ownerId: string): Promise<Item[]> {
        const items: Item[] = [];
        for (const item of this.items.values()) {
            if (item.ownerId.value === ownerId) {
                items.push(item);
            }
        }
        return items;
    }
}
