import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { BaileysClientAdapter } from '../../baileys/BaileysClientAdapter';
import type { WhatsappSessionRepository } from '../../../domain/interface/WhatsappSessionRepository';
import { WhatsappSessionId } from '../../../domain/value-object/WhatsappSessionId';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

class StartSessionDto {
  phoneNumber: string;
}

@ApiTags('WhatsApp Sessions')
@Controller('whatsapp/sessions')
export class SessionController {
  constructor(
    private readonly adapter: BaileysClientAdapter,
    @Inject('WhatsappSessionRepository')
    private readonly sessionsRepo: WhatsappSessionRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear/iniciar sesión de WhatsApp (devuelve QR si aplica)' })
  @ApiBody({
    description: 'Número completo con país (sin espacios ni signos). Devuelve QR si la sesión no está vinculada.',
    examples: {
      ejemplo: {
        value: {
          phoneNumber: '5215551234567',
        },
      },
    },
  })
  async startSession(@Body() dto: StartSessionDto) {
    const session = await this.adapter.start(dto.phoneNumber);
    const qr = await this.adapter.getQr(session.id.value);
    return { ...session.toPrimitives(), qr };
  }

  @Get()
  @ApiOperation({ summary: 'Listar sesiones de WhatsApp' })
  async listSessions() {
    const sessions = await this.sessionsRepo.findAll();
    return sessions.map((s) => s.toPrimitives());
  }

  @Get(':id/qr')
  @ApiOperation({ summary: 'Obtener QR de una sesión (si está disponible)' })
  async getQr(@Param('id') id: string) {
    const qr = await this.adapter.getQr(id);
    return { qr };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una sesión' })
  async getSession(@Param('id') id: string) {
    const session = await this.sessionsRepo.findById(new WhatsappSessionId(id));
    return session ? session.toPrimitives() : null;
  }
}
