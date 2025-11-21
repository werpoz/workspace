import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { AccountID } from './value-object/AccountID.vo';
import { IdentityID } from './value-object/IdentityID.vo';
import { Email } from './value-object/Email.vo';
import { IdentityCreatedDomainEvent } from './events/IdentityCreatedDomainEvent';
import { Provider } from './value-object/Provider.vo';

export class Identity extends AggregateRoot {
  id: IdentityID;
  provider: Provider;
  externalId: string | null;
  accountId: AccountID;

  constructor(
    id: IdentityID,
    provider: Provider,
    externalId: string | null,
    accountId: AccountID,
  ) {
    super();
    this.id = id;
    this.provider = provider;
    this.externalId = externalId;
    this.accountId = accountId;
  }

  static create(
    id: IdentityID,
    provider: Provider,
    externalId: string | null,
    accountId: AccountID,
  ): Identity {
    const identity = new Identity(id, provider, externalId, accountId);
    identity.record(
      new IdentityCreatedDomainEvent({
        aggregateId: id.value,
        provider: provider.value,
        externalId: externalId,
      }),
    );
    return identity;
  }

  static fromPrimitives(plainData: {
    id: string;
    provider: Provider;
    externalId: string | null;
    accountId: string;
  }) {
    return new Identity(
      new IdentityID(plainData.id),
      plainData.provider,
      plainData.externalId,
      new AccountID(plainData.accountId),
    );
  }

  toPrimitives() {
    return {
      id: this.id.value,
      provider: this.provider,
      externalId: this.externalId,
      accountId: this.accountId.value,
    };
  }
}
