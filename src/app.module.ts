import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from './context/identity/identity.module';
import { NotifierModule } from './context/notifier/notifier.module';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
      }),
    }),
    CqrsModule.forRoot(),
    IdentityModule,
    NotifierModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
