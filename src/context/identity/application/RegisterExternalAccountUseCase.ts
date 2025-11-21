import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { Account } from '../domain/Account';
import type { AccountRepository } from '../domain/interface/AccountRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Email } from '../domain/value-object/Email.vo';
import { Inject } from '@nestjs/common';
import { Nullable } from 'src/context/shared/domain/Nullable';
import type { IdentityRepository } from '../domain/interface/IdentityRepository';
import { Identity } from '../domain/Identity';
import { Provider, ProviderType } from '../domain/value-object/Provider.vo';

export class RegisterExternalAccountUseCase {
  constructor(
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('IdentityRepository')
    private readonly identityRepository: IdentityRepository,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) { }

  async execute(email: string, externalId: string, provider: string) {
    const accountExist: Nullable<Account> =
      await this.accountRepository.searchByEmail(email);

    if (accountExist != null) {
      throw new Error(`el usuario ya esta registrado ${email}`);
    }

    const account = Account.createExternal(Uuid.random(), new Email(email));
    const identity = Identity.create(
      Uuid.random(),
      new Provider(provider as ProviderType),
      externalId,
      account.id,
    );
    await this.identityRepository.save(identity);
    await this.accountRepository.save(account);
    await this.eventBus.publishAll(identity.pullDomainEvents());
    await this.eventBus.publishAll(account.pullDomainEvents());
  }
}
