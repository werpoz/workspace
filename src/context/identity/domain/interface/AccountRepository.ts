import { Nullable } from 'src/context/shared/domain/Nullable';
import { Account } from '../Account';

export interface AccountRepository {
  save(account: Account): Promise<void>;
  searchById(id: string): Promise<Nullable<Account>>;
  update(account: Account): Promise<void>;
  delete(id: string): Promise<void>;
}
