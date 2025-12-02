import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AccountCreatedDomainEvent } from 'src/context/identity/domain/events/AccountCreatedDomainEvent';
import { SendEmailUseCase } from '../SendEmailUseCase';

@EventsHandler(AccountCreatedDomainEvent)
@Injectable()
export class AccountCreatedEmailHandler
  implements IEventHandler<AccountCreatedDomainEvent>
{
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {}

  async handle(event: AccountCreatedDomainEvent): Promise<void> {
    if (!event.email) {
      console.warn('[AccountCreatedEmailHandler] No email in event, skipping');
      return;
    }

    const welcomeEmailBody = this.buildWelcomeEmailTemplate(event.email);

    try {
      await this.sendEmailUseCase.execute({
        to: event.email,
        subject: '¡Bienvenido a nuestra plataforma!',
        body: welcomeEmailBody,
      });

      console.log(
        `[AccountCreatedEmailHandler] Welcome email sent to ${event.email}`,
      );
    } catch (error) {
      console.error(
        `[AccountCreatedEmailHandler] Failed to send welcome email to ${event.email}:`,
        error,
      );
    }
  }

  private buildWelcomeEmailTemplate(email: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .content {
            margin-bottom: 30px;
          }
          .content p {
            margin: 15px 0;
          }
          .highlight {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido!</h1>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            
            <p>¡Gracias por registrarte en nuestra plataforma! Estamos emocionados de tenerte con nosotros.</p>
            
            <div class="highlight">
              <strong>Tu cuenta ha sido creada exitosamente:</strong><br>
              📧 ${email}
            </div>
            
            <p>Ahora puedes acceder a todas las funcionalidades de nuestra plataforma y comenzar a disfrutar de nuestros servicios.</p>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Tu Plataforma. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
