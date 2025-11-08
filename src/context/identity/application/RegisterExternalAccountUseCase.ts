import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { Account } from '../domain/Account';
import type { AccountRepository } from '../domain/interface/AccountRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Email } from '../domain/value-object/Email.vo';
import { Inject } from '@nestjs/common';
import { Nullable } from 'src/context/shared/domain/Nullable';

export class RegisterExternalAccountUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(email: string) {
    const accountExist: Nullable<Account> =
      await this.accountRepository.searchByEmail(email);

    //TODO: deberia lanzar un error , algo como RegisterExternalAccountUseCase
    if (accountExist) throw new Error(`el usuario ya esta registrado ${email}`);

    const account = Account.createExternal(Uuid.random(), new Email(email));
    await this.accountRepository.save(account);
    await this.eventBus.publishAll(account.pullDomainEvents());
  }
}
