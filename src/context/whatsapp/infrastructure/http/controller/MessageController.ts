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
  replyToMessageId?: string;
  @IsOptional()
  @IsString()
  forwardFromMessageId?: string;
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
      texto_reply: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'text',
          content: 'Respondiendo a tu mensaje',
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      texto_forward: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'text',
          content: 'Mensaje reenviado',
          forwardFromMessageId: 'uuid-mensaje-original',
        },
      },
      imagen_reply: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'image',
          content: 'https://minio.local/whatsapp-media/img.png',
          caption: 'Foto respondida',
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      imagen_forward: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'image',
          content: 'https://minio.local/whatsapp-media/img.png',
          caption: 'Foto reenviada',
          forwardFromMessageId: 'uuid-mensaje-original',
        },
      },
      video_reply: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'video',
          content: 'https://minio.local/whatsapp-media/video.mp4',
          caption: 'Video respondido',
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      video_forward: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'video',
          content: 'https://minio.local/whatsapp-media/video.mp4',
          caption: 'Video reenviado',
          forwardFromMessageId: 'uuid-mensaje-original',
        },
      },
      documento_reply: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'document',
          content: 'https://minio.local/whatsapp-media/file.pdf',
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      documento_forward: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'document',
          content: 'https://minio.local/whatsapp-media/file.pdf',
          forwardFromMessageId: 'uuid-mensaje-original',
        },
      },
      sticker_reply: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'sticker',
          content: 'https://minio.local/whatsapp-media/sticker.webp',
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      sticker_forward: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'sticker',
          content: 'https://minio.local/whatsapp-media/sticker.webp',
          forwardFromMessageId: 'uuid-mensaje-original',
        },
      },
      audio_reply: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'audio',
          content: 'https://minio.local/whatsapp-media/audio.ogg',
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      audio_forward: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'audio',
          content: 'https://minio.local/whatsapp-media/audio.ogg',
          forwardFromMessageId: 'uuid-mensaje-original',
        },
      },
      contacto_reply: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'contact',
          caption: 'John Doe',
          content:
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:John Doe\n' +
            'TEL;TYPE=cell:+5215558889999\n' +
            'END:VCARD',
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      contacto_forward: {
        value: {
          sessionId: 'uuid-sesion',
          to: '5215551234567@s.whatsapp.net',
          from: '5215550000000@s.whatsapp.net',
          type: 'contact',
          caption: 'John Doe',
          content:
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:John Doe\n' +
            'TEL;TYPE=cell:+5215558889999\n' +
            'END:VCARD',
          forwardFromMessageId: 'uuid-mensaje-original',
        },
      },
      ubicacion_reply: {
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
          replyToMessageId: 'uuid-mensaje-origen',
        },
      },
      ubicacion_forward: {
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
          forwardFromMessageId: 'uuid-mensaje-original',
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
      replyToMessageId: dto.replyToMessageId,
      forwardFromMessageId: dto.forwardFromMessageId,
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
