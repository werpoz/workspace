import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from './context/identity/identity.module';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        CLERK_SECRET_KEY: Joi.string().required(),
        CLERK_PUBLISHABLE_KEY: Joi.string().required(),
      }),
    }),
    CqrsModule.forRoot(),
    IdentityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
