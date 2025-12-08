import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BaileysClientAdapter } from '../../baileys/BaileysClientAdapter';
import { SyncHistoryUseCase } from '../../../application/use-cases/SyncHistoryUseCase';
import { MessageTypeValues } from '../../../domain/value-object/MessageType';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

@Controller('whatsapp/messages')
export class MessageController {
  constructor(
    private readonly adapter: BaileysClientAdapter,
    private readonly history: SyncHistoryUseCase,
  ) {}

  @Post()
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
