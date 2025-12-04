import { Item } from '../Item';
import { Nullable } from 'src/context/shared/domain/Nullable';

export interface ItemRepository {
    save(item: Item): Promise<void>;
    searchById(id: string): Promise<Nullable<Item>>;
    findByOwnerId(ownerId: string): Promise<Item[]>;
}
