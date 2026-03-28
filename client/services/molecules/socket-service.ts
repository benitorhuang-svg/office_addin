import { SocketEventMap, NexusSocketHandler } from "../atoms/types";
import { SocketEvent } from "../atoms/enums";
import { SOCKET_CONFIG } from "../atoms/socket-config";

/**
 * Molecule: Nexus Socket Service
 * Industrial-grade client handler for real-time WebSocket communication.
 * ACHIEVED: Zero-Any type safety across all listeners and command queues.
 */
export class SocketService {
    private static instance: SocketService | null = null;
    private ws: WebSocket | null = null;
    
    // Strictly typed handlers (casting to unknown for internal storage only)
    private listeners: Map<keyof SocketEventMap, NexusSocketHandler<unknown>[]> = new Map();
    
    private reconnectTimeout: number | null = null;
    private heartbeatInterval: number | null = null;
    private retryCount: number = 0;
    
    // Command Queue with generic indexing
    private commandQueue: { type: keyof SocketEventMap; payload: unknown }[] = [];

    private constructor() {
        this.connect();
    }

    public static getInstance(): SocketService {
        if (!this.instance) {
            this.instance = new SocketService();
        }
        return this.instance;
    }

    /**
     * Subscribe to socket events with a returnable unsubscribe function.
     */
    public static on<T extends keyof SocketEventMap>(type: T, handler: NexusSocketHandler<SocketEventMap[T]>): () => void {
        const instance = this.getInstance();
        if (!instance.listeners.has(type)) {
            instance.listeners.set(type, []);
        }
        instance.listeners.get(type)?.push(handler as NexusSocketHandler<unknown>);
        return () => instance.off(type, handler);
    }

    /**
     * Send Typed Payload to Server
     */
    public static send<T extends keyof SocketEventMap>(type: T, payload: SocketEventMap[T]) {
        this.getInstance().send(type, payload);
    }

    private async connect() {
        try {
            const { resolveLocalApiUrl } = await import("./local-server-resolver");
            const baseUrl = await resolveLocalApiUrl("");
            const wsUrl = baseUrl.replace(/^http/, 'ws');
            
            console.log(`%c[SOCKET] Fusion_Uplink: ${wsUrl}`, "color: #3b82f6; font-weight: bold;");
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('%c[SOCKET] Matrix_Ready: ON', "color: #10b981; font-weight: bold;");
                this.retryCount = 0;
                this.clearReconnect();
                this.startHeartbeat();
                this.flushQueue(); 
            };

            this.ws.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    const type = parsed.type as keyof SocketEventMap;
                    const payload = parsed.payload;

                    if (type === SocketEvent.PONG) return; 
                    
                    const handlers = this.listeners.get(type);
                    if (handlers) {
                        handlers.forEach(handler => handler(payload));
                    }
                } catch (e) {
                    console.error('[SOCKET] Inbound_Matrix_Parse_Fail:', e);
                }
            };

            this.ws.onclose = () => {
                console.warn('[SOCKET] Uplink_Offline. Reconnecting...');
                this.stopHeartbeat();
                this.scheduleReconnect();
            };

            this.ws.onerror = (err) => {
                console.error('[SOCKET] Matrix_Critical:', err);
                this.ws?.close();
            };
        } catch (e) {
            console.error('[SOCKET] Connection_Handshake_Fail:', e);
            this.scheduleReconnect();
        }
    }

    private flushQueue() {
        while (this.commandQueue.length > 0) {
            const cmd = this.commandQueue.shift();
            if (cmd) this.send(cmd.type, cmd.payload as SocketEventMap[keyof SocketEventMap]);
        }
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = window.setInterval(() => {
            this.send(SocketEvent.PING, {});
        }, SOCKET_CONFIG.HEARTBEAT_MS);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimeout) return;
        const delay = Math.min(
            SOCKET_CONFIG.BASE_RETRY_MS * Math.pow(2, this.retryCount) + Math.random() * 1000, 
            SOCKET_CONFIG.MAX_RETRY_MS
        );
        this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectTimeout = null;
            this.retryCount++;
            this.connect();
        }, delay);
    }

    private clearReconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    public off<T extends keyof SocketEventMap>(type: T, handler: NexusSocketHandler<SocketEventMap[T]>) {
        const handlers = this.listeners.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler as NexusSocketHandler<unknown>);
            if (index !== -1) handlers.splice(index, 1);
        }
    }

    public send<T extends keyof SocketEventMap>(type: T, payload: SocketEventMap[T]) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        } else {
            console.warn(`[SOCKET] Buffering_Data: ${type}`);
            this.commandQueue.push({ type, payload });
            if (this.commandQueue.length > SOCKET_CONFIG.COMMAND_QUEUE_LIMIT) this.commandQueue.shift(); 
        }
    }
}
