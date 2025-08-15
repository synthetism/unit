/**
 * Event interfaces for Unit Architecture v1.0.9
 * Smith Architecture: structured events with consciousness-first design
 */

export interface EventError {
  message: string;           // Universal: error description
  code?: string;            // Node.js: ENOENT, EACCES, etc. / Browser: could be HTTP codes
  path?: string;            // File operations
  syscall?: string;         // Node.js: 'open', 'write', etc.
  errno?: number;           // Node.js: error number
  stack?: string;           // Debug info (optional)
}

/**
 * Base event interface - all events must have a type
 */
export interface Event {
  type: string;
  timestamp: Date;
  error?: EventError;
}

/**
 * Event emitter interface - provider-agnostic contract
 * Enables different backends (memory, Node.js, custom) via injection
 */
export interface IEventEmitter<TEvent extends Event = Event> {
  on<T extends TEvent>(type: string, handler: (event: T) => void): () => void;
  once<T extends TEvent>(type: string, handler: (event: T) => void): () => void;
  off(type: string): void;
  emit(event: TEvent): void;
  removeAllListeners(): void;
  listenerCount(type: string): number;
  eventTypes(): string[];
}

/**
 * Memory-based EventEmitter implementation (zero dependencies)
 * Default event emitter for all Units - ships with @synet/unit
 * Can be used in any environment (browser, Node.js, Deno, etc.)
 */
export class EventEmitter<TEvent extends Event = Event>
  implements IEventEmitter<TEvent>
{
  private observers: Map<string, ((event: TEvent) => void)[]> = new Map();

  /**
   * Subscribe to events of a specific type with enhanced type safety
   */
  on<T extends TEvent>(type: string, handler: (event: T) => void): () => void {
    const handlers = this.observers.get(type) || [];
    const typedHandler = handler as (event: TEvent) => void;

    if (!handlers.includes(typedHandler)) {
      handlers.push(typedHandler);
      this.observers.set(type, handlers);
    }

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.observers.get(type);
      if (!currentHandlers) return;

      const index = currentHandlers.indexOf(typedHandler);
      if (index !== -1) {
        currentHandlers.splice(index, 1);
        if (currentHandlers.length === 0) {
          this.observers.delete(type);
        } else {
          this.observers.set(type, currentHandlers);
        }
      }
    };
  }

  /**
   * One-time event subscription with enhanced type safety
   */
  once<T extends TEvent>(
    type: string,
    handler: (event: T) => void,
  ): () => void {
    const wrappedHandler = (event: TEvent) => {
      handler(event as T);
      this.off(type);
    };

    return this.on(type, wrappedHandler);
  }

  /**
   * Remove all handlers for a specific event type
   */
  off(type: string): void {
    this.observers.delete(type);
  }

  /**
   * Emit an event to all subscribed handlers
   */
  emit(event: TEvent): void {
    const handlers = this.observers.get(event.type) || [];
    for (const handler of handlers) {
      handler(event);
    }
  }

  /**
   * Remove all handlers for all event types
   */
  removeAllListeners(): void {
    this.observers.clear();
  }

  /**
   * Get count of handlers for an event type
   */
  listenerCount(type: string): number {
    return this.observers.get(type)?.length ?? 0;
  }

  /**
   * Get all active event types
   */
  eventTypes(): string[] {
    return Array.from(this.observers.keys());
  }

  /**
   * Check if there are any handlers for a specific event type
   */
  hasHandlers(type: string): boolean {
    return this.listenerCount(type) > 0;
  }
}