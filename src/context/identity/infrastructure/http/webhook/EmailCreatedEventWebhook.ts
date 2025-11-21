import { Body, Controller, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { ExternalUserCreatedEvent } from 'src/context/identity/application/events/ExternalUserCreatedEvent';
import { Provider } from 'src/context/identity/domain/value-object/Provider.vo';
import type { ClerkUserCreatedEvent } from '../../types/webhook.user.created';

@Controller('webhook/email')
export class EmailCreateEventWebhook {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) { }

  @Post()
  register(@Req() request: RawBodyRequest<Request>, @Body() body: ClerkUserCreatedEvent) {
    const headerPayload: IncomingHttpHeaders = request.headers;

    const svixHeaders = {
      'svix-id': headerPayload['svix-id']!,
      'svix-signature': headerPayload['svix-signature']!,
      'svix-timestamp': headerPayload['svix-timestamp']!,
    } as Record<string, string>;

    const signingSecret = this.configService.getOrThrow<string>(
      'CLERK_WEBHOOK_SECRET',
    );
    const wh = new Webhook(signingSecret);

    if (!request.rawBody) {
      throw new Error('Webhook Error: Missing raw body');
    }

    wh.verify(request.rawBody, svixHeaders) as Record<string, any>;

    this.handleEvent(body);

    return true;
  }

  private handleEvent(data: ClerkUserCreatedEvent) {
    if (data.type.endsWith('created')) {
      this.eventBus.publish(
        new ExternalUserCreatedEvent(
          data.data.id,
          data.data.email_addresses[0].email_address,
          new Provider('clerk').value,
        ),
      );
    }
  }
}
