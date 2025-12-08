import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'whatsapp',
  cors: true,
})
export class WhatsappGateway {
  @WebSocketServer()
  server: Server;

  emitConnectionUpdate(payload: {
    sessionId: string;
    state: string;
    qr?: string;
  }) {
    this.server?.to(payload.sessionId).emit('connection.update', payload);
    this.server?.emit('connection.update', payload);
  }

  emitIncomingMessage(sessionId: string, message: any) {
    this.server?.to(sessionId).emit('message.incoming', message);
    this.server?.emit('message.incoming', message);
  }

  emitMessageStatus(sessionId: string, data: { messageId: string; status: string }) {
    this.server?.to(sessionId).emit('message.status', data);
    this.server?.emit('message.status', data);
  }

  emitPresence(sessionId: string, data: any) {
    this.server?.to(sessionId).emit('presence.update', data);
    this.server?.emit('presence.update', data);
  }

  emitTyping(sessionId: string, data: { from: string; state: 'typing' | 'paused' }) {
    this.server?.to(sessionId).emit('typing', data);
    this.server?.emit('typing', data);
  }

  emitContacts(sessionId: string, contacts: any[]) {
    this.server?.to(sessionId).emit('contacts.upsert', contacts);
    this.server?.emit('contacts.upsert', contacts);
  }

  emitChats(sessionId: string, chats: any[]) {
    this.server?.to(sessionId).emit('chats.upsert', chats);
    this.server?.emit('chats.upsert', chats);
  }
}
