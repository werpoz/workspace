import { Injectable } from '@nestjs/common';
import { Account } from 'src/context/identity/domain/Account';
import { Identity } from 'src/context/identity/domain/Identity';
import { IdentityRepository } from 'src/context/identity/domain/interface/IdentityRepository';
import { Nullable } from 'src/context/shared/domain/Nullable';

@Injectable()
export class InMemmoryIdentityRepository implements IdentityRepository {
  private store = new Map<string, Identity>();

  save(identity: Identity): Promise<void> {
    this.store.set(identity.id.value, identity);
    return Promise.resolve();
  }

  searchById(id: string): Promise<Nullable<Identity>> {
    const identity = this.store.get(id) ?? null;
    if (!identity) {
      return Promise.resolve(null);
    }
    return Promise.resolve(identity);
  }

  searchByExternalId(account: Account): Promise<Nullable<Identity>> {
    let identity: Nullable<Identity>;

    this.store.forEach((i) => {
      if (i.accountId.value === account.id.value) {
        identity = i;
      }
    });

    return Promise.resolve(identity);
  }

  update(identity: Identity): Promise<void> {
    this.store.set(identity.id.value, identity);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }
}
