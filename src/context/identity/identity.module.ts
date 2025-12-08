import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AccountCreatedHandler } from './application/handlers/AccountCreatedHandler';
import { EventBusModule } from '../shared/eventBus.module';
import { IdentityCreatedHandler } from './application/handlers/IdentityCreatedHandler';
import { JwtStrategy } from './application/service/jwt.strategy';
import { AuthService } from './application/service/auth.service';
import { LocalStrategy } from './application/service/local.strategy';
import { AuthController } from './infrastructure/http/controller/AuthController';
import { RequestAccountVerificationUseCase } from './application/RequestAccountVerificationUseCase';
import { VerifyAccountByCodeUseCase } from './application/VerifyAccountByCodeUseCase';
import { ResendVerificationUseCase } from './application/ResendVerificationUseCase';
import { DrizzleAccountRepository } from './infrastructure/persistence/postgres/DrizzleAccountRepository';
import { DrizzleIdentityRepository } from './infrastructure/persistence/postgres/DrizzleIdentityRepository';
import { DrizzleEmailVerificationRepository } from './infrastructure/persistence/postgres/DrizzleEmailVerificationRepository';
import { InMemmoryAccountRepository } from './infrastructure/persistence/memmory/InMemmoryAccountRepository';
import { InMemmoryIdentityRepository } from './infrastructure/persistence/memmory/InMemmoryIdentityRepository';
import { InMemoryEmailVerificationRepository } from './infrastructure/persistence/memmory/InMemoryEmailVerificationRepository';
import { DatabaseModule } from '../shared/infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule,
    EventBusModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        return {
          secret: config.get<string>('JWT_SECRET') ?? 'change-me',
          signOptions: {
            expiresIn: (config.get<string | number>('JWT_EXPIRES_IN') ?? '1h') as any,
          },
        };
      },
    }),
    DatabaseModule,
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
    // Base providers for DI resolution
    DrizzleAccountRepository,
    DrizzleIdentityRepository,
    DrizzleEmailVerificationRepository,
    InMemmoryAccountRepository,
    InMemmoryIdentityRepository,
    InMemoryEmailVerificationRepository,
    {
      provide: 'AccountRepository',
      useFactory: (
        config: ConfigService,
        drizzle: DrizzleAccountRepository,
        memory: InMemmoryAccountRepository,
      ) =>
        (config.get<string>('NODE_ENV') ?? process.env.NODE_ENV) === 'dev'
          ? memory
          : drizzle,
      inject: [
        ConfigService,
        DrizzleAccountRepository,
        InMemmoryAccountRepository,
      ],
    },
    {
      provide: 'IdentityRepository',
      useFactory: (
        config: ConfigService,
        drizzle: DrizzleIdentityRepository,
        memory: InMemmoryIdentityRepository,
      ) =>
        (config.get<string>('NODE_ENV') ?? process.env.NODE_ENV) === 'dev'
          ? memory
          : drizzle,
      inject: [
        ConfigService,
        DrizzleIdentityRepository,
        InMemmoryIdentityRepository,
      ],
    },
    {
      provide: 'EmailVerificationRepository',
      useFactory: (
        config: ConfigService,
        drizzle: DrizzleEmailVerificationRepository,
        memory: InMemoryEmailVerificationRepository,
      ) =>
        (config.get<string>('NODE_ENV') ?? process.env.NODE_ENV) === 'dev'
          ? memory
          : drizzle,
      inject: [
        ConfigService,
        DrizzleEmailVerificationRepository,
        InMemoryEmailVerificationRepository,
      ],
    },
  ],
  exports: [AuthService, RequestAccountVerificationUseCase],
})
export class IdentityModule { }
