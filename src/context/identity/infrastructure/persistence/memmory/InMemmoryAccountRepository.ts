import { Injectable } from '@nestjs/common';
import { Account } from 'src/context/identity/domain/Account';
import { AccountRepository } from 'src/context/identity/domain/interface/AccountRepository';
import { Nullable } from 'src/context/shared/domain/Nullable';

@Injectable()
export class InMemmoryAccountRepository implements AccountRepository {
  private store = new Map<string, Account>();

  save(account: Account): Promise<void> {
    this.store.set(account.id.value, account);
    return Promise.resolve();
  }

  searchById(id: string): Promise<Nullable<Account>> {
    const account = this.store.get(id) ?? null;
    if (!account) {
      return Promise.resolve(null);
    }
    return Promise.resolve(account);
  }

  searchByEmail(email: string): Promise<Nullable<Account>> {
    let account: Nullable<Account>;

    this.store.forEach((e) => {
      if (e.email.value == email) {
        account = e;
      }
    });

    return Promise.resolve(account);
  }

  update(account: Account): Promise<void> {
    this.store.set(account.id.value, account);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }
}
