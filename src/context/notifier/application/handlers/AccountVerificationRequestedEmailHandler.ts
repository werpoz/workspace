import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AccountVerificationRequestedDomainEvent } from 'src/context/identity/domain/events/AccountVerificationRequestedDomainEvent';
import { SendEmailUseCase } from '../../../notifier/application/SendEmailUseCase';
import { Logger } from '@nestjs/common';

@EventsHandler(AccountVerificationRequestedDomainEvent)
export class AccountVerificationRequestedEmailHandler
    implements IEventHandler<AccountVerificationRequestedDomainEvent> {
    private readonly logger = new Logger(
        AccountVerificationRequestedEmailHandler.name,
    );

    constructor(private readonly sendEmailUseCase: SendEmailUseCase) { }

    async handle(event: AccountVerificationRequestedDomainEvent): Promise<void> {
        this.logger.log(`Sending verification email to ${event.email}`);

        let emailBody: string;
        let emailSubject: string;

        if (event.method === 'email_code') {
            emailSubject = 'Verify your account';
            emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome!</h2>
            <p>Thank you for registering. Please use the following code to verify your account:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
              ${event.code}
            </div>
            <p>This code will expire in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </body>
        </html>
      `;
        } else {
            emailSubject = 'Verify your account';
            const verificationLink = `${process.env.APP_URL}/auth/verify/${event.token}`;
            emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome!</h2>
            <p>Thank you for registering. Please click the button below to verify your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Account
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666;">${verificationLink}</p>
            <p>This link will expire in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </body>
        </html>
      `;
        }

        try {
            await this.sendEmailUseCase.execute({
                to: event.email,
                subject: emailSubject,
                body: emailBody,
            });

            this.logger.log(`Verification email sent successfully to ${event.email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send verification email to ${event.email}`,
                error,
            );
            throw error;
        }
    }
}
