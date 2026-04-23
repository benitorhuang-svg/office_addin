/**
 * Shared Event Bus (Agent Communication)
 * Allows agents to communicate asynchronously and broadcast state changes.
 */

import { logger } from "@shared/logger/index.js";

type EventHandler = (data: unknown) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  /**
   * Subscribe to an event.
   */
  public on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from an event.
   */
  public off(event: string, handler: EventHandler): void {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  /**
   * Emit an event.
   */
  public async emit(event: string, data: unknown): Promise<void> {
    const set = this.handlers.get(event);
    if (!set) return;

    const promises = Array.from(set).map(async (handler) => {
      try {
        await handler(data);
      } catch (err) {
        logger.error("EventBus", `Error in handler for event [${event}]`, err);
      }
    });

    await Promise.allSettled(promises);
  }
}

export const eventBus = new EventBus();
