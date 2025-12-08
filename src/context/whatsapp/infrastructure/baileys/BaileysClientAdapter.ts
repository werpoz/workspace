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
        const text =
          msg.message?.conversation ??
          msg.message?.extendedTextMessage?.text ??
          msg.message?.ephemeralMessage?.message?.conversation ??
          msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ??
          '';
        if (!text) {
          continue;
        }
        const stored = await this.handleIncomingMessage.execute({
          sessionId,
          from: remoteJid,
          to: phoneNumber,
          type: MessageTypeValues.TEXT,
          content: text,
          key: {
            id: key.id,
            remoteJid: remoteJid,
            fromMe: key.fromMe,
          },
        });
        this.gateway.emitIncomingMessage(sessionId, stored.toDTO());
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
    clientMessageId?: string;
  }) {
    const socket = this.sockets.get(params.sessionId);
    const message = await this.sendMessageUseCase.execute(params);

    if (socket) {
      const payload =
        params.type === 'text'
          ? { text: params.content }
          : { caption: params.content };
      await socket.sendMessage(params.to, payload, {
        messageId: params.clientMessageId ?? message.id.value,
      });
    } else {
      this.logger.warn(
        `Socket no inicializado para session ${params.sessionId}; se guardó el mensaje pendiente`,
      );
    }

    return message.toDTO();
  }

  async getQr(sessionId: string): Promise<string | null> {
    return (await this.redis.get(this.qrKey(sessionId))) ?? null;
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
}
