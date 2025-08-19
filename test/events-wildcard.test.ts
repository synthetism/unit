/**
 * Unit Events Wildcard Tests
 * 
 * Test suite for wildcard event pattern matching in Unit Architecture v1.0.9
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter, type Event } from '../src/events.js';

interface TestEvent extends Event {
  operation?: string;
  data?: Record<string, unknown>;
}

describe('EventEmitter Wildcard Support', () => {
  let emitter: EventEmitter<TestEvent>;
  
  beforeEach(() => {
    emitter = new EventEmitter<TestEvent>();
  });

  describe('Basic Wildcard Functionality', () => {
    it('should support * wildcard to catch all events', () => {
      const handler = vi.fn();
      emitter.on('*', handler);
      
      // Emit different event types
      emitter.emit({ type: 'test.event1', timestamp: new Date() });
      emitter.emit({ type: 'test.event2', timestamp: new Date() });
      emitter.emit({ type: 'other.event', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledTimes(3);
      
      const eventTypes = handler.mock.calls.map(call => call[0].type);
      expect(eventTypes).toEqual(['test.event1', 'test.event2', 'other.event']);
    });

    it('should support pattern matching with .*', () => {
      const handler = vi.fn();
      emitter.on('test.*', handler);
      
      // These should match test.*
      emitter.emit({ type: 'test.event1', timestamp: new Date() });
      emitter.emit({ type: 'test.event2', timestamp: new Date() });
      
      // This should not match
      emitter.emit({ type: 'other.event', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledTimes(2);
      
      const eventTypes = handler.mock.calls.map(call => call[0].type);
      expect(eventTypes).toEqual(['test.event1', 'test.event2']);
    });

    it('should support pattern matching with prefix wildcards', () => {
      const handler = vi.fn();
      emitter.on('*.error', handler);
      
      // These should match *.error
      emitter.emit({ type: 'test.error', timestamp: new Date() });
      emitter.emit({ type: 'weather.error', timestamp: new Date() });
      emitter.emit({ type: 'auth.error', timestamp: new Date() });
      
      // These should not match
      emitter.emit({ type: 'test.success', timestamp: new Date() });
      emitter.emit({ type: 'error', timestamp: new Date() }); // No prefix
      emitter.emit({ type: 'test.error.critical', timestamp: new Date() }); // Too many levels
      
      expect(handler).toHaveBeenCalledTimes(3);
      
      const eventTypes = handler.mock.calls.map(call => call[0].type);
      expect(eventTypes).toEqual(['test.error', 'weather.error', 'auth.error']);
    });

    it('should verify *.error pattern matching works in practice', () => {
      const errorHandler = vi.fn();
      const allHandler = vi.fn();
      
      // Listen for all error events
      emitter.on('*.error', errorHandler);
      
      // Listen for all events for comparison
      emitter.on('*', allHandler);
      
      // Emit various events
      const events = [
        { type: 'user.error', timestamp: new Date() },
        { type: 'network.error', timestamp: new Date() },
        { type: 'user.success', timestamp: new Date() },
        { type: 'network.timeout', timestamp: new Date() },
        { type: 'validation.error', timestamp: new Date() },
        { type: 'error', timestamp: new Date() }, // No prefix
        { type: 'system.error.fatal', timestamp: new Date() } // Too deep
      ];
      
      events.forEach(event => emitter.emit(event));
      
      // All handler should get all 7 events
      expect(allHandler).toHaveBeenCalledTimes(7);
      
      // Error handler should only get the 3 *.error events
      expect(errorHandler).toHaveBeenCalledTimes(3);
      
      const errorEventTypes = errorHandler.mock.calls.map(call => call[0].type);
      expect(errorEventTypes).toEqual(['user.error', 'network.error', 'validation.error']);
      
      // Verify no false positives
      expect(errorEventTypes).not.toContain('user.success');
      expect(errorEventTypes).not.toContain('network.timeout');
      expect(errorEventTypes).not.toContain('error'); // No prefix
      expect(errorEventTypes).not.toContain('system.error.fatal'); // Too deep
    });

    it('should not match patterns without dots', () => {
      const handler = vi.fn();
      emitter.on('test*', handler); // Invalid pattern - should only match exactly 'test*'
      
      emitter.emit({ type: 'test.event', timestamp: new Date() });
      emitter.emit({ type: 'test*', timestamp: new Date() }); // Exact match
      
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].type).toBe('test*');
    });
  });

  describe('Multiple Handler Types', () => {
    it('should support exact, wildcard, and pattern handlers simultaneously', () => {
      const exactHandler = vi.fn();
      const wildcardHandler = vi.fn();
      const patternHandler = vi.fn();
      
      emitter.on('test.event', exactHandler);
      emitter.on('*', wildcardHandler);
      emitter.on('test.*', patternHandler);
      
      emitter.emit({ type: 'test.event', timestamp: new Date() });
      
      // All three should be called
      expect(exactHandler).toHaveBeenCalledOnce();
      expect(wildcardHandler).toHaveBeenCalledOnce();
      expect(patternHandler).toHaveBeenCalledOnce();
      
      // All should receive the same event
      const event = { type: 'test.event', timestamp: expect.any(Date) };
      expect(exactHandler).toHaveBeenCalledWith(event);
      expect(wildcardHandler).toHaveBeenCalledWith(event);
      expect(patternHandler).toHaveBeenCalledWith(event);
    });

    it('should not call pattern handlers for exact matches', () => {
      const exactHandler = vi.fn();
      const patternHandler = vi.fn();
      
      emitter.on('test.event', exactHandler);
      emitter.on('test.*', patternHandler);
      
      emitter.emit({ type: 'test.other', timestamp: new Date() });
      
      // Only pattern handler should be called
      expect(exactHandler).not.toHaveBeenCalled();
      expect(patternHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Pattern Matching Edge Cases', () => {
    it('should handle complex nested patterns', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      emitter.on('weather.*', handler1);
      emitter.on('weather.current.*', handler2);
      emitter.on('*', handler3);
      
      // Test single-level matching
      emitter.emit({ type: 'weather.current', timestamp: new Date() });
      
      // weather.* should match weather.current (single level)
      expect(handler1).toHaveBeenCalledOnce();
      
      // weather.current.* should NOT match weather.current (no additional level)
      expect(handler2).not.toHaveBeenCalled();
      
      // * should match everything
      expect(handler3).toHaveBeenCalledOnce();
      
      // Reset handlers
      handler1.mockClear();
      handler2.mockClear();
      handler3.mockClear();
      
      // Test nested levels
      emitter.emit({ type: 'weather.current.success', timestamp: new Date() });
      
      // weather.* should NOT match weather.current.success (crosses dot boundary)
      expect(handler1).not.toHaveBeenCalled();
      
      // weather.current.* should match weather.current.success
      expect(handler2).toHaveBeenCalledOnce();
      
      // * should match everything
      expect(handler3).toHaveBeenCalledOnce();
    });

    it('should handle empty and special characters', () => {
      const handler = vi.fn();
      emitter.on('test.*', handler);
      
      // These should not match or cause errors
      emitter.emit({ type: '', timestamp: new Date() });
      emitter.emit({ type: 'test', timestamp: new Date() });
      emitter.emit({ type: 'test.', timestamp: new Date() });
      emitter.emit({ type: '.test', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledOnce(); // Only 'test.' should match
      expect(handler.mock.calls[0][0].type).toBe('test.');
    });
  });

  describe('Handler Management with Wildcards', () => {
    it('should support unsubscribing from wildcard handlers', () => {
      const handler = vi.fn();
      const unsubscribe = emitter.on('*', handler);
      
      emitter.emit({ type: 'test.event', timestamp: new Date() });
      expect(handler).toHaveBeenCalledOnce();
      
      unsubscribe();
      
      emitter.emit({ type: 'test.event2', timestamp: new Date() });
      expect(handler).toHaveBeenCalledOnce(); // Should not be called again
    });

    it('should support once() with wildcard patterns', () => {
      const handler = vi.fn();
      emitter.once('test.*', handler);
      
      emitter.emit({ type: 'test.event1', timestamp: new Date() });
      emitter.emit({ type: 'test.event2', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledOnce(); // Only first event
      expect(handler.mock.calls[0][0].type).toBe('test.event1');
    });

    it('should support off() with wildcard patterns', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      emitter.on('test.*', handler1);
      emitter.on('test.*', handler2);
      
      emitter.emit({ type: 'test.event', timestamp: new Date() });
      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
      
      emitter.off('test.*');
      
      emitter.emit({ type: 'test.event2', timestamp: new Date() });
      expect(handler1).toHaveBeenCalledOnce(); // No additional calls
      expect(handler2).toHaveBeenCalledOnce(); // No additional calls
    });
  });

  describe('Performance and Behavior', () => {
    it('should not break existing exact matching behavior', () => {
      const handler = vi.fn();
      emitter.on('exact.match', handler);
      
      emitter.emit({ type: 'exact.match', timestamp: new Date() });
      emitter.emit({ type: 'exact.other', timestamp: new Date() });
      emitter.emit({ type: 'other.match', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].type).toBe('exact.match');
    });

    it('should handle many wildcard patterns efficiently', () => {
      const handlers: any[] = [];
      
      // Register many pattern handlers
      for (let i = 0; i < 10; i++) {
        const handler = vi.fn();
        emitter.on(`pattern${i}.*`, handler);
        handlers.push(handler);
      }
      
      // Emit event that matches one pattern
      emitter.emit({ type: 'pattern5.test', timestamp: new Date() });
      
      // Only the matching handler should be called
      handlers.forEach((handler, index) => {
        if (index === 5) {
          expect(handler).toHaveBeenCalledOnce();
        } else {
          expect(handler).not.toHaveBeenCalled();
        }
      });
    });

    it('should provide correct event data to all handler types', () => {
      const exactHandler = vi.fn();
      const wildcardHandler = vi.fn();
      const patternHandler = vi.fn();
      
      emitter.on('test.event', exactHandler);
      emitter.on('*', wildcardHandler);
      emitter.on('test.*', patternHandler);
      
      const testEvent: TestEvent = {
        type: 'test.event',
        timestamp: new Date(),
        operation: 'testOperation',
        data: { key: 'value' }
      };
      
      emitter.emit(testEvent);
      
      // All handlers should receive the exact same event object
      expect(exactHandler).toHaveBeenCalledWith(testEvent);
      expect(wildcardHandler).toHaveBeenCalledWith(testEvent);
      expect(patternHandler).toHaveBeenCalledWith(testEvent);
    });
  });
});
