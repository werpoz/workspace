import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { ExternalUserCreatedEvent } from 'src/context/identity/application/events/ExternalUserCreatedEvent';
import type { ClerkEmailCreatedEvent } from '../../types/email';

@Controller('webhook/email')
export class EmailCreateEventWebhook {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {}

  @Post()
  register(@Req() request: Request, @Body() body: ClerkEmailCreatedEvent) {
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

    wh.verify(JSON.stringify(body), svixHeaders) as Record<string, any>;

    this.handleEvent(body.type, body);

    return true;
  }

  private handleEvent(name: string, data: ClerkEmailCreatedEvent) {
    if (name.endsWith('created')) {
      this.eventBus.publish(
        new ExternalUserCreatedEvent(
          data.instance_id,
          data.data.to_email_address,
        ),
      );
    }
  }
}
