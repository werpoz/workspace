import {
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import type { AccountRepository } from '../../domain/interface/AccountRepository';
import { JwtService } from '@nestjs/jwt';
import { Account } from '../../domain/Account';
import { AccountID } from '../../domain/value-object/AccountID.vo';
import { Email } from '../../domain/value-object/Email.vo';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AccountRepository')
    private readonly accounts: AccountRepository,
    private readonly jwtService: JwtService,
    @Inject('DomainEventBus')
    private readonly eventBus: DomainEventBus,
  ) { }

  async register(email: string, plainPassword: string) {
    const existingAccount = await this.accounts.searchByEmail(email);
    if (existingAccount) {
      throw new BadRequestException('Email already registered');
    }

    const accountId = new AccountID(Uuid.random().value);
    const emailVO = new Email(email);
    const passwordVO = new Password(plainPassword);

    const hashedPassword = await passwordVO.hash();
    const hashedPasswordVO = new Password(hashedPassword);

    const account = Account.createWithPassword(
      accountId,
      hashedPasswordVO,
      emailVO,
    );

    await this.accounts.save(account);

    await this.eventBus.publishAll(account.pullDomainEvents());

    return {
      id: account.id.value,
      email: account.email.value,
      status: account.status.value,
    };
  }

  async validateAccount(email: string, plainPassword: string) {
    const account = await this.accounts.searchByEmail(email);

    if (!account) {
      return null;
    }

    if (!account.isActive) {
      throw new UnauthorizedException('Esta cuenta no está activa.');
    }

    if (account.password === null) {
      throw new UnauthorizedException(
        'Esta cuenta solo puede iniciar sesión con proveedor externo.',
      );
    }

    const password = new Password(plainPassword);

    if (account.password && account.password.matches(password.value)) {
      const { password, ...result } = account.toPrimitives();
      return result;
    }

    return null;
  }

  async login(account: Exclude<Account, 'password'>) {
    const payload = {
      sub: account.id,
      email: account.email,
      active: account.isActive,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: account,
    };
  }
}
