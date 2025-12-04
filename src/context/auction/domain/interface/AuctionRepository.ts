import { Auction } from '../Auction';
import { Nullable } from 'src/context/shared/domain/Nullable';

export interface AuctionRepository {
    save(auction: Auction): Promise<void>;
    searchById(id: string): Promise<Nullable<Auction>>;
}
