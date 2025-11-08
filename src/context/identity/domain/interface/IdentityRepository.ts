import { Nullable } from 'src/context/shared/domain/Nullable';
import { Identity } from '../Identity';
import { Account } from '../Account';

export interface IdentityRepository {
  save(account: Identity): Promise<void>;
  searchById(id: string): Promise<Nullable<Identity>>;
  searchByExternalId(accountId: Account): Promise<Nullable<Identity>>;
  update(account: Identity): Promise<void>;
  delete(id: string): Promise<void>;
}
