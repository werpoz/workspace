import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: process.env.WEBSOCKET_CORS_ORIGIN || '*',
        credentials: true,
    },
    namespace: '/auctions',
})
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients: Map<string, Set<string>> = new Map(); // auctionId -> Set of socket IDs

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        // Remove client from all auction rooms
        for (const [auctionId, clients] of this.connectedClients.entries()) {
            if (clients.has(client.id)) {
                clients.delete(client.id);
                if (clients.size === 0) {
                    this.connectedClients.delete(auctionId);
                }
            }
        }
    }

    @SubscribeMessage('join-auction')
    handleJoinAuction(
        @MessageBody() auctionId: string,
        @ConnectedSocket() client: Socket
    ): { success: boolean; message?: string } {
        try {
            // Join socket.io room
            client.join(`auction:${auctionId}`);

            // Track connection
            if (!this.connectedClients.has(auctionId)) {
                this.connectedClients.set(auctionId, new Set());
            }
            this.connectedClients.get(auctionId)!.add(client.id);

            console.log(`Client ${client.id} joined auction ${auctionId}`);
            console.log(`Total clients in auction ${auctionId}: ${this.connectedClients.get(auctionId)!.size}`);

            return {
                success: true,
                message: `Joined auction ${auctionId}`,
            };
        } catch (error) {
            console.error('Error joining auction:', error);
            return {
                success: false,
                message: 'Failed to join auction',
            };
        }
    }

    @SubscribeMessage('leave-auction')
    handleLeaveAuction(
        @MessageBody() auctionId: string,
        @ConnectedSocket() client: Socket
    ): { success: boolean } {
        try {
            client.leave(`auction:${auctionId}`);

            // Remove from tracking
            const clients = this.connectedClients.get(auctionId);
            if (clients) {
                clients.delete(client.id);
                if (clients.size === 0) {
                    this.connectedClients.delete(auctionId);
                }
            }

            console.log(`Client ${client.id} left auction ${auctionId}`);

            return { success: true };
        } catch (error) {
            console.error('Error leaving auction:', error);
            return { success: false };
        }
    }

    /**
     * Emit a new bid to all clients watching the auction
     */
    emitNewBid(auctionId: string, bidData: {
        bidId: string;
        amount: number;
        bidderId: string;
        timestamp: Date;
    }) {
        this.server.to(`auction:${auctionId}`).emit('new-bid', bidData);
        console.log(`Emitted new-bid event to auction ${auctionId}`);
    }

    /**
     * Emit auction published event
     */
    emitAuctionPublished(auctionId: string, auctionData: {
        id: string;
        status: string;
        publishedAt: Date;
    }) {
        this.server.to(`auction:${auctionId}`).emit('auction-published', auctionData);
        console.log(`Emitted auction-published event to auction ${auctionId}`);
    }

    /**
     * Emit auction ended event
     */
    emitAuctionEnded(auctionId: string, auctionData: {
        id: string;
        winnerId?: string;
        finalPrice?: number;
        endedAt: Date;
    }) {
        this.server.to(`auction:${auctionId}`).emit('auction-ended', auctionData);
        console.log(`Emitted auction-ended event to auction ${auctionId}`);
    }

    /**
     * Get number of clients watching an auction
     */
    getAuctionWatcherCount(auctionId: string): number {
        return this.connectedClients.get(auctionId)?.size || 0;
    }
}
