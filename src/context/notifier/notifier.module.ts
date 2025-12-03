import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SendEmailUseCase } from './application/SendEmailUseCase';
import {
  EmailSenderFactory,
  EmailProvider,
} from './infrastructure/email/EmailSenderFactory';
import { AccountCreatedEmailHandler } from './application/handlers/AccountCreatedEmailHandler';
import { AccountVerificationRequestedEmailHandler } from './application/handlers/AccountVerificationRequestedEmailHandler';
import { EventBusModule } from '../shared/eventBus.module';

@Module({
  imports: [ConfigModule, EventBusModule],
  providers: [
    SendEmailUseCase,
    AccountCreatedEmailHandler,
    AccountVerificationRequestedEmailHandler,
    {
      provide: 'EmailSender',
      useFactory: (configService: ConfigService) => {
        const provider = (configService.get<string>('EMAIL_PROVIDER') ||
          'test') as EmailProvider;

        return EmailSenderFactory.create(provider, {
          resendApiKey: configService.get<string>('RESEND_API_KEY'),
          smtpHost: configService.get<string>('SMTP_HOST'),
          smtpPort: configService.get<number>('SMTP_PORT'),
          smtpUser: configService.get<string>('SMTP_USER'),
          smtpPass: configService.get<string>('SMTP_PASS'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SendEmailUseCase],
})
export class NotifierModule { }

