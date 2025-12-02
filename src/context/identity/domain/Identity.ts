import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { AccountID } from './value-object/AccountID.vo';
import { IdentityID } from './value-object/IdentityID.vo';
import { IdentityCreatedDomainEvent } from './events/IdentityCreatedDomainEvent';

export class Identity extends AggregateRoot {
  id: IdentityID;
  accountId: AccountID;

  constructor(id: IdentityID, accountId: AccountID) {
    super();
    this.id = id;
    this.accountId = accountId;
  }

  static create(id: IdentityID, accountId: AccountID): Identity {
    const identity = new Identity(id, accountId);
    identity.record(
      new IdentityCreatedDomainEvent({
        aggregateId: id.value,
        accountId: accountId.value,
      }),
    );
    return identity;
  }

  static fromPrimitives(plainData: { id: string; accountId: string }) {
    return new Identity(
      new IdentityID(plainData.id),
      new AccountID(plainData.accountId),
    );
  }

  toPrimitives() {
    return {
      id: this.id.value,
      accountId: this.accountId.value,
    };
  }
}
