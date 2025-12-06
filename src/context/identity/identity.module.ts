import { Module } from '@nestjs/common';
import { AccountCreatedHandler } from './application/handlers/AccountCreatedHandler';
import { DrizzleAccountRepository } from './infrastructure/persistence/drizzle/DrizzleAccountRepository';
import { DrizzleIdentityRepository } from './infrastructure/persistence/drizzle/DrizzleIdentityRepository';
import { DrizzleEmailVerificationRepository } from './infrastructure/persistence/drizzle/DrizzleEmailVerificationRepository';
import { InMemmoryAccountRepository } from './infrastructure/persistence/memmory/InMemmoryAccountRepository';
import { InMemmoryIdentityRepository } from './infrastructure/persistence/memmory/InMemmoryIdentityRepository';
import { InMemoryEmailVerificationRepository } from './infrastructure/persistence/memmory/InMemoryEmailVerificationRepository';
import { DrizzleModule } from '../shared/infrastructure/persistence/drizzle/drizzle.module';
import { EventBusModule } from '../shared/eventBus.module';
import { IdentityCreatedHandler } from './application/handlers/IdentityCreatedHandler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './application/service/jwt.strategy';
import { AuthService } from './application/service/auth.service';
import { LocalStrategy } from './application/service/local.strategy';
import { AuthController } from './infrastructure/http/controller/AuthController';
import { RequestAccountVerificationUseCase } from './application/RequestAccountVerificationUseCase';
import { VerifyAccountByCodeUseCase } from './application/VerifyAccountByCodeUseCase';
import { ResendVerificationUseCase } from './application/ResendVerificationUseCase';
import { NotifierModule } from '../notifier/notifier.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    EventBusModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'secretKey',
      signOptions: { expiresIn: '60s' },
    }),
    DrizzleModule,
    NotifierModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    AccountCreatedHandler,
    IdentityCreatedHandler,
    RequestAccountVerificationUseCase,
    VerifyAccountByCodeUseCase,
    ResendVerificationUseCase,

    // Repositories
    DrizzleAccountRepository,
    InMemmoryAccountRepository,
    DrizzleIdentityRepository,
    InMemmoryIdentityRepository,
    DrizzleEmailVerificationRepository,
    InMemoryEmailVerificationRepository,
    {
      provide: 'AccountRepository',
      useClass: isProd ? DrizzleAccountRepository : InMemmoryAccountRepository,
    },
    {
      provide: 'IdentityRepository',
      useClass: isProd ? DrizzleIdentityRepository : InMemmoryIdentityRepository,
    },
    {
      provide: 'EmailVerificationRepository',
      useClass: isProd ? DrizzleEmailVerificationRepository : InMemoryEmailVerificationRepository,
    },
  ],
  exports: [AuthService, RequestAccountVerificationUseCase],
})
export class IdentityModule { }
