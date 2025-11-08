import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { AccountID } from './value-object/AccountID';
import { AccountCreatedDomainEvent } from './events/AccountCreatedDomainEvent';

export class Account extends AggregateRoot {
  id: AccountID;
  password: Password;
  email: Email;
  isActive: boolean;

  constructor(
    id: AccountID,
    password: Password,
    email: Email,
    isActive: boolean = true,
  ) {
    super();
    this.id = id;
    this.password = password;
    this.email = email;
    this.isActive = isActive;
  }

  static create(
    id: AccountID,
    password: Password,
    email: Email,
    isActive: boolean,
  ): Account {
    const account = new Account(id, password, email, isActive);
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
    username: string;
    password: string;
    email: string;
    isActive: boolean;
  }) {
    return new Account(
      new AccountID(plainData.id),
      new Password(plainData.password),
      new Email(plainData.email),
      plainData.isActive,
    );
  }

  toPrimitives() {
    return {
      id: this.id.value,
      password: this.password.value,
      email: this.email.value,
      isActive: this.isActive,
    };
  }
}
