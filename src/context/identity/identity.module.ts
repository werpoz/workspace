import { Module } from '@nestjs/common';
import { AccountCreatedHandler } from './application/handlers/AccountCreatedHandler';
import { InMemmoryAccountRepository } from './infrastructure/persistence/memmory/InMemmoryAccountRepository';
import { EventBusModule } from '../shared/eventBus.module';
import { InMemmoryIdentityRepository } from './infrastructure/persistence/memmory/InMemmoryIdentityRepository';
import { IdentityCreatedHandler } from './application/handlers/IdentityCreatedHandler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './application/service/jwt.strategy';
import { AuthService } from './application/service/auth.service';
import { LocalStrategy } from './application/service/local.strategy';
import { AuthController } from './infrastructure/http/controller/AuthController';

@Module({
  imports: [
    EventBusModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'secretKey',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    AccountCreatedHandler,
    IdentityCreatedHandler,
    {
      provide: 'AccountRepository',
      useClass: InMemmoryAccountRepository,
    },
    {
      provide: 'IdentityRepository',
      useClass: InMemmoryIdentityRepository,
    },
  ],
  exports: [AuthService],
})
export class IdentityModule {}
