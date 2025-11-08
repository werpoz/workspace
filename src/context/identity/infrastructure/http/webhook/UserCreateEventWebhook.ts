import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';

@Controller('webhook/user')
export class UserCreateEventWebhook {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  register(@Req() request: Request, @Body() body) {
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

    return wh.verify(JSON.stringify(body), svixHeaders) as Record<string, any>;
  }

  private event(name: string) {
    if (name.endsWith('created')) {
      //enviar el evento que un usuario se ha creado/ registrado
    }

    if (name.endsWith('deleted')) {
      //enviar el evento que el usuario se ha borrado/
    }

    if (name.endsWith('updated')) {
      // enviar el evento que el usuario a actualizdo sus credenciales
    }
  }
}
