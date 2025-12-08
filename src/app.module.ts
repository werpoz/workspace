import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from './context/identity/identity.module';
import { NotifierModule } from './context/notifier/notifier.module';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './context/whatsapp/whatsapp.module';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string()
          .uri()
          .default('postgres://whatsapp:whatsapp@localhost:5432/whatsapp'),
        DATABASE_POOL_MAX: Joi.number().default(10),
        REDIS_URL: Joi.string().default('redis://localhost:6379'),
        REDIS_TLS: Joi.boolean().default(false),
        KAFKA_BROKERS: Joi.string().default('localhost:9092'),
        S3_ENDPOINT: Joi.string().default('http://localhost:9000'),
        S3_ACCESS_KEY: Joi.string().default('minioadmin'),
        S3_SECRET_KEY: Joi.string().default('minioadmin'),
        S3_BUCKET: Joi.string().default('whatsapp-media'),
        JWT_SECRET: Joi.string().default('change-me'),
        JWT_EXPIRES_IN: Joi.string().default('1h'),
      }),
    }),
    CqrsModule.forRoot(),
    IdentityModule,
    NotifierModule,
    WhatsappModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
