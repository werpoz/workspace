import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { AccountID } from './value-object/AccountID.vo';
import { AccountCreatedDomainEvent } from './events/AccountCreatedDomainEvent';
import { Nullable } from 'src/context/shared/domain/Nullable';
import { AccountStatus } from './value-object/AccountStatus.vo';

export class Account extends AggregateRoot {
  readonly id: AccountID;
  readonly password: Nullable<Password>;
  readonly email: Email;
  private _status: AccountStatus;

  constructor(
    id: AccountID,
    password: Nullable<Password>,
    email: Email,
    status: AccountStatus,
  ) {
    super();
    this.id = id;
    this.password = password;
    this.email = email;
    this._status = status;
  }

  get status(): AccountStatus {
    return this._status;
  }

  get isActive(): boolean {
    return this._status.isActive();
  }

  verify(): void {
    this._status = AccountStatus.active();
  }

  static createWithPassword(
    id: AccountID,
    password: Password,
    email: Email,
  ): Account {
    const account = new Account(
      id,
      password,
      email,
      AccountStatus.pendingVerification(),
    );
    account.record(
      new AccountCreatedDomainEvent({
        aggregateId: id.value,
        email: email.value,
      }),
    );
    return account;
  }

  static createExternal(id: AccountID, email: Email): Account {
    const account = new Account(
      id,
      null,
      email,
      AccountStatus.active(), // External accounts are pre-verified
    );
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
    status: string;
  }) {
    return new Account(
      new AccountID(plainData.id),
      plainData.password ? new Password(plainData.password) : null,
      new Email(plainData.email),
      new AccountStatus(plainData.status as any),
    );
  }

  toPrimitives() {
    return {
      id: this.id.value,
      password: this.password?.value ?? null,
      email: this.email.value,
      status: this._status.value,
    };
  }
}
