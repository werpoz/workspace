import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BaileysClientAdapter } from '../../baileys/BaileysClientAdapter';
import { SyncHistoryUseCase } from '../../../application/use-cases/SyncHistoryUseCase';
import { MessageTypeValues } from '../../../domain/value-object/MessageType';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

class SendMessageDto {
  sessionId: string;
  to: string;
  from: string;
  @IsEnum(MessageTypeValues)
  type: MessageTypeValues;
  @IsString()
  @IsNotEmpty()
  content: string;
  @IsOptional()
  @IsString()
  caption?: string;
@IsOptional()
@IsString()
clientMessageId?: string;
}

@ApiTags('WhatsApp Messages')
@Controller('whatsapp/messages')
export class MessageController {
  constructor(
    private readonly adapter: BaileysClientAdapter,
    private readonly history: SyncHistoryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensaje (texto, media, sticker, contacto, ubicación, reacción)' })
  @ApiBody({
    description: 'Payload de mensaje a enviar',
    examples: {
      texto: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'text',
          content: 'Hola desde la API',
        },
      },
      imagen: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'image',
          content: 'https://minio.local/whatsapp-media/img.png',
          caption: 'Foto',
        },
      },
      video: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'video',
          content: 'https://minio.local/whatsapp-media/video.mp4',
          caption: 'Video corto',
        },
      },
      documento: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'document',
          content: 'https://minio.local/whatsapp-media/file.pdf',
        },
      },
      sticker: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'sticker',
          content: 'https://minio.local/whatsapp-media/sticker.webp',
        },
      },
      audio: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'audio',
          content: 'https://minio.local/whatsapp-media/audio.ogg',
        },
      },
      contacto: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'contact',
          caption: 'John Doe',
          content: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL;TYPE=cell:+5215558889999\nEND:VCARD',
        },
      },
      ubicacion: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'location',
          content: JSON.stringify({
            lat: 19.432608,
            lng: -99.133209,
            name: 'CDMX',
            address: 'Zócalo',
          }),
        },
      },
      reaccion: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'reaction',
          content: JSON.stringify({
            text: '👍',
            key: 'msg-id-a-reaccionar',
            remoteJid: '5215551234567@s.whatsapp.net',
            fromMe: false,
          }),
        },
      },
    },
  })
  async send(@Body() dto: SendMessageDto) {
    const result = await this.adapter.sendMessage({
      sessionId: dto.sessionId,
      to: dto.to,
      from: dto.from,
      type: dto.type,
      content: dto.content,
      caption: dto.caption,
      clientMessageId: dto.clientMessageId,
    });
    return result;
  }

  @Get(':sessionId')
  async historyBySession(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
  ) {
    const messages = await this.history.execute({ sessionId });
    return limit ? messages.slice(-Number(limit)).map((m) => m.toDTO()) : messages.map((m) => m.toDTO());
  }
}
