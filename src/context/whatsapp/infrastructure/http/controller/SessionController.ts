import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { BaileysClientAdapter } from '../../baileys/BaileysClientAdapter';
import type { WhatsappSessionRepository } from '../../../domain/interface/WhatsappSessionRepository';
import { WhatsappSessionId } from '../../../domain/value-object/WhatsappSessionId';

class StartSessionDto {
  phoneNumber: string;
}

@Controller('whatsapp/sessions')
export class SessionController {
  constructor(
    private readonly adapter: BaileysClientAdapter,
    @Inject('WhatsappSessionRepository')
    private readonly sessionsRepo: WhatsappSessionRepository,
  ) {}

  @Post()
  async startSession(@Body() dto: StartSessionDto) {
    const session = await this.adapter.start(dto.phoneNumber);
    const qr = await this.adapter.getQr(session.id.value);
    return { ...session.toPrimitives(), qr };
  }

  @Get()
  async listSessions() {
    const sessions = await this.sessionsRepo.findAll();
    return sessions.map((s) => s.toPrimitives());
  }

  @Get(':id/qr')
  async getQr(@Param('id') id: string) {
    const qr = await this.adapter.getQr(id);
    return { qr };
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    const session = await this.sessionsRepo.findById(new WhatsappSessionId(id));
    return session ? session.toPrimitives() : null;
  }
}
