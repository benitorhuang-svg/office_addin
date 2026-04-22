import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'node:http';
import type { Server as HttpsServer } from 'node:https';
import { GlobalSystemState } from './system-state-store.js';
import type { ACPConnectionMethod } from '../copilot/atoms/types.js';
import { logger } from '../../atoms/logger.js';
/**
 * Molecule: Nexus Socket Relay
 * Handles real-time state broadcasts between PWA and Taskpane.
 */
export class NexusSocketRelay {
    private static wss: WebSocketServer | null = null;
    private static clients: Set<WebSocket> = new Set();

    public static attach(server: Server | HttpsServer) {
        this.wss = new WebSocketServer({ server });

        logger.info('NexusSocket', 'Nexus relay attached');

        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            logger.info('NexusSocket', 'Client connected', { totalClients: this.clients.size });

            ws.on('message', (data) => {
                try {
                    const { type, payload } = JSON.parse(data.toString());
                    if (type === 'PING') {
                        ws.send(JSON.stringify({ type: 'PONG', payload: {} }));
                        return;
                    }
                    logger.info('NexusSocket', 'Received socket message', { type });
                    // Relayer logic: Broadcast to other clients if needed, 
                    // or handle specific server-side actions.
                    if (type === 'SET_POWER' || type === 'SET_PROVIDER') {
                        // Keep the server's central state store in sync
                        GlobalSystemState.update({ 
                            power: type === 'SET_POWER' ? (payload as { on: boolean }).on ? 'ON' : 'OFF' : undefined,
                            provider: type === 'SET_PROVIDER' ? (payload as { provider: ACPConnectionMethod }).provider : undefined
                        });
                        this.broadcast('SYSTEM_STATE_UPDATED', GlobalSystemState.getState());
                    }
                } catch (e) {
                    logger.error('NexusSocket', 'Failed to parse incoming socket message', { error: e });
                }
            });

            ws.on('close', () => {
                this.clients.delete(ws);
                logger.info('NexusSocket', 'Client disconnected', { remainingClients: this.clients.size });
            });

            ws.on('error', (err) => {
                logger.error('NexusSocket', 'WebSocket connection error', { error: err });
                this.clients.delete(ws);
            });
            
            // Send initial handshake
            ws.send(JSON.stringify({ type: 'HANDSHAKE', payload: { status: 'READY' } }));
        });
    }

    public static broadcast(type: string, payload: unknown) {
        if (!this.wss) return;
        
        const message = JSON.stringify({ type, payload });
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        logger.info('NexusSocket', 'Broadcast socket event', { type, clientCount: this.clients.size });
    }
}
