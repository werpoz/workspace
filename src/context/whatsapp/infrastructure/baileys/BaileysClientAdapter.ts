import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from 'src/context/shared/infrastructure/database/redis.provider';
import Redis from 'ioredis';
import { StartSessionUseCase } from '../../application/use-cases/StartSessionUseCase';
import { HandleConnectionUpdateUseCase } from '../../application/use-cases/HandleConnectionUpdateUseCase';
import { HandleIncomingMessageUseCase } from '../../application/use-cases/HandleIncomingMessageUseCase';
import { SendMessageUseCase } from '../../application/use-cases/SendMessageUseCase';
import { MessageTypeValues } from '../../domain/value-object/MessageType';
import { SyncHistoryUseCase } from '../../application/use-cases/SyncHistoryUseCase';
import { WhatsappSession } from '../../domain/WhatsappSession';
import { useMultiRedisAuthState } from '../auth/useMultiRedisAuthState';
import { PostgresAuthSnapshotRepository } from '../persistence/postgres/PostgresAuthSnapshotRepository';
import { BufferJSON, DisconnectReason, type AuthenticationState } from 'baileys';
import { UpdateMessageStatusUseCase } from '../../application/use-cases/UpdateMessageStatusUseCase';
import { WhatsappGateway } from '../ws/WhatsappGateway';
import { IdempotencyService } from '../idempotency/IdempotencyService';
import { S3MediaStorage } from '../storage/S3MediaStorage';
import type { MessageRepository } from '../../domain/interface/MessageRepository';
import { MessageId } from '../../domain/value-object/MessageId';
import { Message } from '../../domain/Message';
import type { ContactRepository } from '../../domain/interface/ContactRepository';
import type { ChatRepository } from '../../domain/interface/ChatRepository';
import { Contact } from '../../domain/Contact';
import { Chat } from '../../domain/Chat';

@Injectable()
export class BaileysClientAdapter {
  private readonly logger = new Logger(BaileysClientAdapter.name);
  private readonly sockets = new Map<string, any>();
  private readonly retryMap = new Map<string, number>();
  private readonly lastQrEmitted = new Map<string, number>();

  constructor(
    private readonly startSession: StartSessionUseCase,
    private readonly handleConnectionUpdate: HandleConnectionUpdateUseCase,
    private readonly handleIncomingMessage: HandleIncomingMessageUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly syncHistoryUseCase: SyncHistoryUseCase,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly snapshots: PostgresAuthSnapshotRepository,
    private readonly updateMessageStatus: UpdateMessageStatusUseCase,
    private readonly gateway: WhatsappGateway,
    private readonly idempotency: IdempotencyService,
    private readonly mediaStorage: S3MediaStorage,
    @Inject('MessageRepository')
    private readonly messages: MessageRepository,
    @Inject('ContactRepository')
    private readonly contacts: ContactRepository,
    @Inject('ChatRepository')
    private readonly chats: ChatRepository,
  ) {}

  async start(phoneNumber: string): Promise<WhatsappSession> {
    const session = await this.startSession.execute({ phoneNumber });
    const sessionId = session.id.value;

    await this.restoreFromSnapshot(sessionId);

    const baileys = await import('baileys');
    const { state, saveCreds } = await useMultiRedisAuthState(
      this.redis,
      sessionId,
    );

    const socket = baileys.makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    socket.ev?.on('connection.update', async (update: any) => {
      const state = update.connection ?? 'unknown';
      const qr = update.qr as string | undefined;
      await this.handleConnectionUpdate.execute({
        sessionId,
        state,
        qr,
        reason: update.lastDisconnect?.error?.message,
      });
      if (state === 'close') {
        const statusCode = update.lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect =
          statusCode !== DisconnectReason.loggedOut &&
          statusCode !== DisconnectReason.connectionClosed &&
          statusCode !== DisconnectReason.connectionLost &&
          statusCode !== DisconnectReason.restartRequired &&
          statusCode !== DisconnectReason.timedOut;
        if (shouldReconnect) {
          const retries = (this.retryMap.get(sessionId) ?? 0) + 1;
          this.retryMap.set(sessionId, retries);
          const backoff = Math.min(30000, 2000 * retries);
          this.logger.log(
            `Reconectando sesión ${sessionId}, statusCode=${statusCode}, backoff=${backoff}ms`,
          );
          setTimeout(
            () => this.start(phoneNumber).catch(() => null),
            backoff,
          );
        }
      } else if (state === 'open' || state === 'connected') {
        this.retryMap.set(sessionId, 0);
      }
      if (qr) {
        await this.redis.setex(this.qrKey(sessionId), 120, qr);
      }
      const now = Date.now();
      const last = this.lastQrEmitted.get(sessionId) ?? 0;
      if (!qr || now - last > 2000) {
        if (qr) this.lastQrEmitted.set(sessionId, now);
        this.gateway.emitConnectionUpdate({ sessionId, state, qr });
      }
    });

    socket.ev?.on('messages.upsert', async (m: any) => {
      const messages = m?.messages ?? [];
      for (const msg of messages) {
        const key = msg.key ?? {};
        const remoteJid = key.remoteJid ?? '';
        const idempotencyKey = key.id
          ? `wa:in:${sessionId}:${key.id}`
          : `wa:in:${sessionId}:${remoteJid}:${msg.messageTimestamp}`;

        const mediaInfo = this.detectMessageKind(msg);
        const text =
          msg.message?.conversation ??
          msg.message?.extendedTextMessage?.text ??
          msg.message?.ephemeralMessage?.message?.conversation ??
          msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ??
          '';

        await this.idempotency.withInboundDedupe(
          idempotencyKey,
          60 * 5,
          async () => {
            let type = mediaInfo?.type ?? MessageTypeValues.TEXT;
            let content = text;
            let caption: string | undefined = text || undefined;

            if (mediaInfo?.isMedia) {
              const { downloadMediaMessage } = await import('baileys');
              const logger = {
                info: () => undefined,
                error: () => undefined,
                warn: () => undefined,
                debug: () => undefined,
                trace: () => undefined,
                child: () => logger,
                level: 'silent',
              };
              const ctx = {
                reuploadRequest: async () => undefined,
                logger,
              };
              const buffer = await downloadMediaMessage(
                msg,
                'buffer',
                {},
                ctx as any,
              );
              const url = await this.mediaStorage.upload(
                buffer as Buffer,
                mediaInfo.mime ?? 'application/octet-stream',
                `whatsapp/${sessionId}`,
              );
              type = mediaInfo.type;
              content = url;
              caption = mediaInfo.caption ?? caption;
            } else if (mediaInfo) {
              type = mediaInfo.type;
              content = mediaInfo.content;
              caption = mediaInfo.caption ?? caption;
            } else if (!text) {
              return;
            }

            const stored = await this.handleIncomingMessage.execute({
              sessionId,
              from: remoteJid,
              to: phoneNumber,
              type,
              content: caption ? `${caption} ${content}` : content,
              key: {
                id: key.id,
                remoteJid: remoteJid,
                fromMe: key.fromMe,
              },
            });
            this.gateway.emitIncomingMessage(sessionId, stored.toDTO());
          },
        );
      }
      await this.persistSnapshot(sessionId, state);
    });

    socket.ev?.on('messages.update', async (updates: any[]) => {
      for (const update of updates) {
        const status = update.update?.status;
        const messageId = update.key?.id;
        if (!messageId || status === undefined) continue;
        const normalized =
          status === 1
            ? 'sent'
            : status === 2
              ? 'delivered'
              : status === 3
                ? 'read'
                : status === 4
                  ? 'played'
                  : 'sent';
        await this.updateMessageStatus.execute({
          messageId,
          status: normalized as any,
        });
        this.gateway.emitMessageStatus(sessionId, {
          messageId,
          status: normalized,
        });
      }
    });

    socket.ev?.on('contacts.upsert', async (payload: any[]) => {
      const list = (payload ?? []).map(
        (c) => {
          const jid = c.id ?? c?.notify ?? '';
          return new Contact(
            jid,
            c.name ?? c.notify,
            c.notify,
            jid ? jid.split('@')?.[0] : undefined,
          );
        },
      );
      await this.contacts.upsertMany(list);
      this.gateway.emitContacts(sessionId, list.map((c) => c.toPrimitives()));
    });

    socket.ev?.on('contacts.update', async (payload: any[]) => {
      const list = (payload ?? []).map(
        (c) => {
          const jid = c.id ?? c?.notify ?? '';
          return new Contact(
            jid,
            c.name ?? c.notify,
            c.notify,
            jid ? jid.split('@')?.[0] : undefined,
          );
        },
      );
      await this.contacts.upsertMany(list);
      this.gateway.emitContacts(sessionId, list.map((c) => c.toPrimitives()));
    });

    socket.ev?.on('chats.upsert', async (payload: any[]) => {
      const list = (payload ?? []).map(
        (chat) =>
          new Chat(
            chat.id,
            chat.name ?? chat.subject,
            chat.unreadCount ?? 0,
            chat.conversationTimestamp
              ? new Date(chat.conversationTimestamp * 1000)
              : undefined,
          ),
      );
      await this.chats.upsertMany(list);
      this.gateway.emitChats(sessionId, list.map((c) => c.toPrimitives()));
    });

    socket.ev?.on('chats.update', async (payload: any[]) => {
      const list = (payload ?? []).map(
        (chat) =>
          new Chat(
            chat.id,
            chat.name ?? chat.subject,
            chat.unreadCount ?? 0,
            chat.conversationTimestamp
              ? new Date(chat.conversationTimestamp * 1000)
              : undefined,
          ),
      );
      await this.chats.upsertMany(list);
      this.gateway.emitChats(sessionId, list.map((c) => c.toPrimitives()));
    });

    socket.ev?.on('presence.update', async (presence: any) => {
      const { id, presences } = presence || {};
      this.gateway.emitPresence(sessionId, {
        id,
        presences,
      });
      // Emit typing hints when available
      if (presences) {
        Object.entries(presences).forEach(([jid, status]: any) => {
          if (status?.lastKnownPresence === 'composing') {
            this.gateway.emitTyping(sessionId, { from: jid, state: 'typing' });
          } else if (status?.lastKnownPresence === 'paused') {
            this.gateway.emitTyping(sessionId, { from: jid, state: 'paused' });
          }
        });
      }
    });

    socket.ev?.on('creds.update', async () => {
      await saveCreds();
      await this.persistSnapshot(sessionId, state);
    });

    this.sockets.set(sessionId, socket);
    return session;
  }

  async sendMessage(params: {
    sessionId: string;
    to: string;
    from: string;
    type: MessageTypeValues;
    content: string;
    caption?: string;
    replyToMessageId?: string;
    forwardFromMessageId?: string;
    clientMessageId?: string;
  }) {
    const socket = this.sockets.get(params.sessionId);
    const idempotencyKey = params.clientMessageId
      ? `wa:out:${params.sessionId}:${params.clientMessageId}`
      : `wa:out:${params.sessionId}:${params.to}:${params.content}`;

    let dto: any = null;
    await this.idempotency.withOutboundIdempotency(
      idempotencyKey,
      60 * 5,
      async () => {
        const message = await this.sendMessageUseCase.execute(params);

        const quotedMessage = params.replyToMessageId
          ? await this.messages.findById(
              new MessageId(params.replyToMessageId),
            )
          : undefined;

        const forwardSource = params.forwardFromMessageId
          ? await this.messages.findById(
              new MessageId(params.forwardFromMessageId),
            )
          : undefined;

        if (socket) {
          const payload = await this.buildOutgoingPayload(
            params,
            forwardSource ?? undefined,
            quotedMessage ?? undefined,
          );
          await socket.sendMessage(params.to, payload, {
            messageId: params.clientMessageId ?? message.id.value,
          });
        } else {
          this.logger.warn(
            `Socket no inicializado para session ${params.sessionId}; se guardó el mensaje pendiente`,
          );
        }

        dto = message.toDTO();
      },
    );

    return dto;
  }

  private async buildOutgoingPayload(params: {
    type: MessageTypeValues;
    content: string;
    caption?: string;
    forwardFromMessageId?: string;
  }, forwardSource?: Message, quotedMessage?: Message) {
    const payload: any = {};
    // base content
    if (params.type === MessageTypeValues.TEXT) {
      payload.text = params.content;
    } else if (
      params.type === MessageTypeValues.IMAGE ||
      params.type === MessageTypeValues.VIDEO ||
      params.type === MessageTypeValues.DOCUMENT ||
      params.type === MessageTypeValues.AUDIO ||
      params.type === MessageTypeValues.STICKER
    ) {
      const isDoc = params.type === MessageTypeValues.DOCUMENT;
      const isVideo = params.type === MessageTypeValues.VIDEO;
      const isImage = params.type === MessageTypeValues.IMAGE;
      const isAudio = params.type === MessageTypeValues.AUDIO;
      const isSticker = params.type === MessageTypeValues.STICKER;
      const field = isDoc
        ? 'document'
        : isVideo
          ? 'video'
          : isAudio
            ? 'audio'
            : isSticker
              ? 'sticker'
              : 'image';

      payload[field] = { url: params.content };
      payload.caption = params.caption ?? (isImage || isVideo ? '' : undefined);
    } else if (params.type === MessageTypeValues.CONTACT) {
      payload.contacts = {
        displayName: params.caption ?? 'Contact',
        contacts: [
          {
            vcard: params.content,
          },
        ],
      };
    } else if (params.type === MessageTypeValues.LOCATION) {
      let parsed: any = {};
      try {
        parsed = JSON.parse(params.content);
      } catch {
        parsed = {};
      }
      payload.location = {
        degreesLatitude: parsed.lat ?? 0,
        degreesLongitude: parsed.lng ?? 0,
        name: parsed.name,
        address: parsed.address,
      };
    } else if (params.type === MessageTypeValues.REACTION) {
      let parsed: any = {};
      try {
        parsed = JSON.parse(params.content);
      } catch {
        parsed = {};
      }
      if (!parsed.text || !parsed.key) {
        payload.text = params.content;
      } else {
        payload.react = {
          text: parsed.text,
          key: {
            id: parsed.key,
            remoteJid: parsed.remoteJid,
            fromMe: parsed.fromMe,
          },
        };
      }
    } else {
      payload.text = params.content;
    }

    if (quotedMessage) {
      const quoted = this.buildQuotedMessageStub(quotedMessage);
      if (quoted) {
        payload.quoted = quoted;
      }
    }

    if (forwardSource) {
      payload.contextInfo = {
        ...(payload.contextInfo ?? {}),
        forwardingScore: 1,
        isForwarded: true,
      };
    }

    return payload;
  }

  async getQr(sessionId: string): Promise<string | null> {
    return (await this.redis.get(this.qrKey(sessionId))) ?? null;
  }

  private buildQuotedMessageStub(message: Message) {
    const key =
      message.key ??
      {
        id: message.id.value,
        remoteJid: message.direction.isOutgoing()
          ? message.to.value
          : message.from.value,
        fromMe: message.direction.isOutgoing(),
      };
    const textPreview = message.content.value;
    if (!key?.id || !key.remoteJid) return null;
    return {
      key,
      message: {
        conversation: textPreview,
      },
    };
  }

  async getMessages(sessionId: string) {
    return this.syncHistoryUseCase.execute({ sessionId });
  }

  private authCredsKey(sessionId: string): string {
    return `wa:auth:${sessionId}:creds`;
  }

  private authKeysKey(sessionId: string): string {
    return `wa:auth:${sessionId}:keys`;
  }

  private authKey(sessionId: string): string {
    return `wa:auth:${sessionId}`;
  }

  private qrKey(sessionId: string): string {
    return `wa:qr:${sessionId}`;
  }

  private async persistSnapshot(sessionId: string, state: AuthenticationState) {
    try {
      const credsJson = await this.redis.get(this.authCredsKey(sessionId));
      if (!credsJson) {
        return;
      }

      const keysRaw = await this.redis.hgetall(this.authKeysKey(sessionId));
      const keysParsed = Object.fromEntries(
        Object.entries(keysRaw).map(([k, v]) => [
          k,
          JSON.parse(v, (key, value) => {
            if (
              value &&
              typeof value === 'object' &&
              value.type === 'Buffer' &&
              Array.isArray(value.data)
            ) {
              return Buffer.from(value.data);
            }
            return value;
          }),
        ]),
      );

      await this.snapshots.saveSnapshot(
        sessionId,
        JSON.parse(credsJson, (key, value) => {
          if (
            value &&
            typeof value === 'object' &&
            value.type === 'Buffer' &&
            Array.isArray(value.data)
          ) {
            return Buffer.from(value.data);
          }
          return value;
        }),
        keysParsed,
      );
    } catch (error) {
      this.logger.warn(`No se pudo snapshotear auth state: ${error}`);
    }
  }

  private async restoreFromSnapshot(sessionId: string) {
    const credsKey = this.authCredsKey(sessionId);
    const keysKey = this.authKeysKey(sessionId);

    const hasCreds = await this.redis.exists(credsKey);
    if (hasCreds) return;

    const snapshot = await this.snapshots.getSnapshot(sessionId);
    if (!snapshot) return;

    const pipeline = this.redis.pipeline();
    pipeline.set(
      credsKey,
      JSON.stringify(snapshot.creds, BufferJSON.replacer),
    );

    const keyEntries = Object.entries(snapshot.keys ?? {});
    for (const [field, value] of keyEntries) {
      pipeline.hset(
        keysKey,
        field,
        JSON.stringify(value, BufferJSON.replacer),
      );
    }

    await pipeline.exec();
    this.logger.log(`Auth state restaurado desde snapshot para ${sessionId}`);
  }

  private detectMessageKind(msg: any):
    | { type: MessageTypeValues; mime?: string; isMedia?: boolean; caption?: string; content?: string }
    | null {
    const message = msg.message || {};
    if (message.imageMessage) {
      return {
        type: MessageTypeValues.IMAGE,
        mime: message.imageMessage.mimetype,
        isMedia: true,
        caption: message.imageMessage.caption,
      };
    }
    if (message.videoMessage) {
      return {
        type: MessageTypeValues.VIDEO,
        mime: message.videoMessage.mimetype,
        isMedia: true,
        caption: message.videoMessage.caption,
      };
    }
    if (message.audioMessage) {
      return {
        type: MessageTypeValues.AUDIO,
        mime: message.audioMessage.mimetype,
        isMedia: true,
      };
    }
    if (message.documentMessage) {
      return {
        type: MessageTypeValues.DOCUMENT,
        mime: message.documentMessage.mimetype,
        isMedia: true,
      };
    }
    if (message.stickerMessage) {
      return {
        type: MessageTypeValues.STICKER,
        mime: message.stickerMessage.mimetype,
        isMedia: true,
      };
    }
    if (message.contactMessage) {
      return {
        type: MessageTypeValues.CONTACT,
        content: message.contactMessage.vcard ?? JSON.stringify(message.contactMessage),
      };
    }
    if (message.locationMessage) {
      return {
        type: MessageTypeValues.LOCATION,
        content: JSON.stringify({
          lat: message.locationMessage.degreesLatitude,
          lng: message.locationMessage.degreesLongitude,
          name: message.locationMessage.name,
          address: message.locationMessage.address,
        }),
      };
    }
    if (message.reactionMessage) {
      return {
        type: MessageTypeValues.REACTION as MessageTypeValues,
        content: JSON.stringify({
          text: message.reactionMessage.text,
          key: message.reactionMessage.key?.id,
          remoteJid: message.reactionMessage.key?.remoteJid,
          fromMe: message.reactionMessage.key?.fromMe,
        }),
      };
    }
    return null;
  }
}
