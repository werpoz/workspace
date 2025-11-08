import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { Account } from '../domain/Account';
import type { AccountRepository } from '../domain/interface/AccountRepository';
import { Password } from '../domain/value-object/Password.vo';
import { Email } from '../domain/value-object/Email.vo';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Inject } from '@nestjs/common';

export class RegisterAccountUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(email: string, password: string) {
    const account = Account.create(
      Uuid.random(),
      new Password(password),
      new Email(email),
      true,
    );

    await this.eventBus.publishAll(account.pullDomainEvents());
    await this.accountRepository.save(account);
  }
}
