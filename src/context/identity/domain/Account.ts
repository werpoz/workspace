import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { AccountID } from './value-object/AccountID';
import { AccountCreatedDomainEvent } from './events/AccountCreatedDomainEvent';
import { Nullable } from 'src/context/shared/domain/Nullable';

export class Account extends AggregateRoot {
  readonly id: AccountID;
  readonly password: Nullable<Password>;
  readonly email: Email;
  readonly isActive: boolean;

  private constructor(
    id: AccountID,
    password: Nullable<Password>,
    email: Email,
    isActive: boolean = true,
  ) {
    super();
    this.id = id;
    this.password = password;
    this.email = email;
    this.isActive = isActive;
  }

  static createWithPassword(
    id: AccountID,
    password: Password,
    email: Email,
  ): Account {
    const account = new Account(id, password, email, true);
    account.record(
      new AccountCreatedDomainEvent({
        aggregateId: id.value,
        email: email.value,
      }),
    );
    return account;
  }

  static createExternal(id: AccountID, email: Email): Account {
    const account = new Account(id, null, email, true);
    account.record(
      new AccountCreatedDomainEvent({
        aggregateId: id.value,
        email: email.value,
      }),
    );
    return account;
  }

  static fromPrimitives(plainData: {
    id: string;
    password: Nullable<string>;
    email: string;
    isActive: boolean;
    externalProvider?: string;
  }) {
    return new Account(
      new AccountID(plainData.id),
      plainData.password ? new Password(plainData.password) : null,
      new Email(plainData.email),
      plainData.isActive,
    );
  }

  toPrimitives() {
    return {
      id: this.id.value,
      password: this.password?.value ?? null,
      email: this.email.value,
      isActive: this.isActive,
    };
  }
}
