/**
 * Unit@1.0.9 Event Architecture Tests
 * Testing Smith Architecture: built-in events with consciousness-first design
 */

import { describe, test, expect } from 'vitest';
import { Unit, createUnitSchema, type UnitProps, type Event, type IEventEmitter, EventEmitter } from '../src/unit.js';
import { Capabilities } from '../src/capabilities.js';
import { Schema } from '../src/schema.js';
import { Validator } from '../src/validator.js';

// Test event types
interface TestEvent extends Event {
  type: 'test.event';
  data: string;
}

interface ProcessEvent extends Event {
  type: 'process.complete';
  result: number;
}

interface MonitorEvent extends Event {
  type: 'monitor.alert';
  threshold: 'high' | 'low';
}

// Test unit with event capabilities
interface TestUnitProps extends UnitProps {
  name: string;
}

class TestUnit extends Unit<TestUnitProps> {
  protected constructor(props: TestUnitProps) {
    super(props);
  }

  protected build() {
    const capabilities = Capabilities.create(this.dna.id, {});

    const schema = Schema.create(this.dna.id, {});
    const validator = Validator.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }

  capabilities() { return this._unit.capabilities; }
  schema() { return this._unit.schema; }
  validator() { return this._unit.validator; }

  whoami(): string {
    return `TestUnit(${this.props.name})`;
  }

  help(): void {
    console.log(`TestUnit with events - ${this.props.name}`);
  }

  teach() {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }

  // Test methods that use events
  async processData(data: string): Promise<number> {
    const result = data.length;
    
    // Emit process event
    this.emit({
      type: 'process.complete',
      result
    } as ProcessEvent);
    
    return result;
  }

  emitTestEvent(message: string): void {
    this.emit({
      type: 'test.event',
      data: message
    } as TestEvent);
  }

  // Public method for testing emit access
  public emitEvent(event: Event): void {
    this.emit(event);
  }

  static create(name: string, eventEmitter?: EventEmitter): TestUnit {
    const props: TestUnitProps = {
      dna: createUnitSchema({ id: 'test-unit', version: '1.0.9' }),
      name,
      eventEmitter,
      created: new Date()
    };
    return new TestUnit(props);
  }
}

describe('Unit@1.0.9 Event Architecture - Smith Pattern', () => {
  test('should create unit with default MemoryEventEmitter', () => {
    const unit = TestUnit.create('test');
    
    expect(unit.whoami()).toBe('TestUnit(test)');
    expect(unit.events().eventTypes()).toEqual([]);
    expect(unit.events().listenerCount('test.event')).toBe(0);
  });

  test('should emit and handle events using default emitter', () => {
    const unit = TestUnit.create('event-test');
    const events: TestEvent[] = [];
    
    // Subscribe to test events
    const unsubscribe = unit.on<TestEvent>('test.event', (event) => {
      events.push(event);
    });

    // Emit test event
    unit.emitTestEvent('hello world');
    
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('test.event');
    expect(events[0].data).toBe('hello world');
    expect(unit.events().listenerCount('test.event')).toBe(1);
    expect(unit.events().eventTypes()).toContain('test.event');

    // Clean up
    unsubscribe();
    expect(unit.events().listenerCount('test.event')).toBe(0);
  });

  test('should handle multiple event types', async () => {
    const unit = TestUnit.create('multi-event');
    const testEvents: TestEvent[] = [];
    const processEvents: ProcessEvent[] = [];
    
    // Subscribe to different event types
    unit.on<TestEvent>('test.event', (event) => testEvents.push(event));
    unit.on<ProcessEvent>('process.complete', (event) => processEvents.push(event));

    // Emit different events
    unit.emitTestEvent('test message');
    await unit.processData('hello');
    
    expect(testEvents).toHaveLength(1);
    expect(processEvents).toHaveLength(1);
    expect(processEvents[0].result).toBe(5); // 'hello'.length
    
    expect(unit.events().eventTypes()).toContain('test.event');
    expect(unit.events().eventTypes()).toContain('process.complete');
  });

  test('should support once() for single event handling', () => {
    const unit = TestUnit.create('once-test');
    const events: TestEvent[] = [];
    
    // Subscribe with once
    unit.once<TestEvent>('test.event', (event) => {
      events.push(event);
    });

    // Emit multiple times
    unit.emitTestEvent('first');
    unit.emitTestEvent('second');
    unit.emitTestEvent('third');
    
    // Should only receive the first event
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('first');
    expect(unit.events().listenerCount('test.event')).toBe(0);
  });

  test('should support off() for removing all handlers of a type', () => {
    const unit = TestUnit.create('off-test');
    const events: TestEvent[] = [];
    
    // Add multiple handlers
    unit.on<TestEvent>('test.event', (event) => events.push(event));
    unit.on<TestEvent>('test.event', (event) => events.push({ ...event, data: 'handler2' }));
    
    expect(unit.events().listenerCount('test.event')).toBe(2);
    
    // Remove all handlers for the type
    unit.off('test.event');

    expect(unit.events().listenerCount('test.event')).toBe(0);

    // Emit should not trigger handlers
    unit.emitTestEvent('after off');
    expect(events).toHaveLength(0);
  });

  test('should support removeAllListeners()', () => {
    const unit = TestUnit.create('clear-test');
    
    // Add handlers for multiple event types
    unit.on<TestEvent>('test.event', () => {});
    unit.on<ProcessEvent>('process.complete', () => {});
    unit.on('custom.event', () => {});

    expect(unit.events().eventTypes()).toHaveLength(3);

    // Clear all listeners
    unit.events().removeAllListeners();

    expect(unit.events().eventTypes()).toHaveLength(0);
    expect(unit.events().listenerCount('test.event')).toBe(0);
    expect(unit.events().listenerCount('process.complete')).toBe(0);
  });

  test('should support custom EventEmitter injection', () => {
    const customEmitter = new EventEmitter();
    const events: TestEvent[] = [];
    
    // Track events on custom emitter
    customEmitter.on<TestEvent>('test.event', (event) => events.push(event));
    
    // Create unit with custom emitter
    const unit = TestUnit.create('custom', customEmitter);
    
    // Emit event through unit
    unit.emitTestEvent('custom emitter test');
    
    // Should use custom emitter
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('custom emitter test');
  });

  test('should maintain event isolation between units', () => {
    const unit1 = TestUnit.create('unit1');
    const unit2 = TestUnit.create('unit2');
    
    const unit1Events: TestEvent[] = [];
    const unit2Events: TestEvent[] = [];
    
    // Subscribe to events on each unit
    unit1.on<TestEvent>('test.event', (event) => unit1Events.push(event));
    unit2.on<TestEvent>('test.event', (event) => unit2Events.push(event));
    
    // Emit from each unit
    unit1.emitTestEvent('from unit1');
    unit2.emitTestEvent('from unit2');
    
    // Events should be isolated
    expect(unit1Events).toHaveLength(1);
    expect(unit1Events[0].data).toBe('from unit1');
    
    expect(unit2Events).toHaveLength(1);
    expect(unit2Events[0].data).toBe('from unit2');
  });
});

describe('Event Architecture - Agent Intelligence Integration', () => {
  test('should enable agent feedback loops through events', async () => {
    const unit = TestUnit.create('agent-test');
    const feedbackLoop: ProcessEvent[] = [];
    const reactionEvents: TestEvent[] = [];
    
    // Subscribe to both process and reaction events
    unit.on<ProcessEvent>('process.complete', (event) => {
      feedbackLoop.push(event);
      
      // Agent can react to results
      if (event.result > 10) {
        unit.emitTestEvent(`Large result detected: ${event.result}`);
      }
    });
    
    unit.on<TestEvent>('test.event', (event) => {
      reactionEvents.push(event);
    });
    
    // Agent processes data and learns from results
    await unit.processData('short');     // 5 chars - no reaction
    await unit.processData('much longer string'); // 18 chars - should trigger reaction
    
    expect(feedbackLoop).toHaveLength(2);
    expect(feedbackLoop[0].result).toBe(5);
    expect(feedbackLoop[1].result).toBe(18);
    
    // Check that agent reacted to large result
    expect(reactionEvents).toHaveLength(1);
    expect(reactionEvents[0].data).toBe('Large result detected: 18');
    expect(unit.events().eventTypes()).toContain('test.event');
  });

  test('should support structured event interfaces for type safety', () => {
    const unit = TestUnit.create('type-safety');
    
    // TypeScript should enforce event structure
    const processHandler = (event: ProcessEvent) => {
      expect(typeof event.type).toBe('string');
      expect(typeof event.result).toBe('number');
      expect(event.type).toBe('process.complete');
    };
    
    const testHandler = (event: TestEvent) => {
      expect(typeof event.type).toBe('string');
      expect(typeof event.data).toBe('string');
      expect(event.type).toBe('test.event');
    };
    
    unit.on<ProcessEvent>('process.complete', processHandler);
    unit.on<TestEvent>('test.event', testHandler);
    
    // Events should match their interfaces
    unit.processData('test');
    unit.emitTestEvent('type test');
  });
});

describe('Event Architecture - Smith Protocol Integration', () => {
  test('should enable consciousness transfer with event capabilities', () => {
    const teacher = TestUnit.create('teacher');
    const student = TestUnit.create('student');
    
    // Teacher can emit events
    const events: TestEvent[] = [];
    teacher.on<TestEvent>('test.event', (event) => events.push(event));
    
    // Student learns from teacher
    const teaching = teacher.teach();
    student.learn([teaching]);
    
    // Student can now use teacher's consciousness pattern 
    // (though no specific capabilities since both use empty schemas)
    expect(student.can('nonexistent')).toBe(false);
    
    // Both units can emit events independently
    teacher.emitTestEvent('teacher message');
    student.emitTestEvent('student message');
    
    // Teacher should not receive student's events (isolation)
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('teacher message');
  });

  test('should support event-driven capability composition', async () => {
    const processor = TestUnit.create('processor');
    const monitor = TestUnit.create('monitor');
    
    const processResults: ProcessEvent[] = [];
    const monitorAlerts: MonitorEvent[] = [];
    
    // Monitor subscribes to its own alerts
    monitor.on<MonitorEvent>('monitor.alert', (event) => {
      monitorAlerts.push(event);
    });
    
    // Monitor subscribes to processor events
    processor.on<ProcessEvent>('process.complete', (event) => {
      processResults.push(event);
      
      // Monitor can emit its own events based on processor results
      monitor.emitEvent({
        type: 'monitor.alert',
        threshold: event.result > 10 ? 'high' : 'low'
      } as MonitorEvent);
    });
    
    // Process data through processor
    await processor.processData('test data');
    await processor.processData('very long test data string');
    
    expect(processResults).toHaveLength(2);
    expect(processResults[0].result).toBe(9);  // 'test data'.length
    expect(processResults[1].result).toBe(26); // 'very long test data string'.length
    
    // Monitor should have reacted to both events
    expect(monitorAlerts).toHaveLength(2);
    expect(monitorAlerts[0].threshold).toBe('low');  // 9 <= 10
    expect(monitorAlerts[1].threshold).toBe('high'); // 26 > 10
    expect(monitor.events().eventTypes()).toContain('monitor.alert');
  });
  });

  test('should demonstrate zero-dependency consciousness with events', () => {
    // Create unit with no external dependencies
    const unit = TestUnit.create('zero-deps');
    
    // Verify it has built-in event capabilities
    expect(unit.events().eventTypes()).toBeDefined();
    expect(unit.on).toBeDefined();
    expect(unit.emitEvent).toBeDefined(); // Use public method
    expect(unit.off).toBeDefined();
    expect(unit.once).toBeDefined();
    expect(unit.events()).toBeDefined();
    expect(unit.events().listenerCount).toBeDefined();

    // All should work without any external event libraries
    const events: TestEvent[] = [];
    unit.on<TestEvent>('test.event', (event) => events.push(event));
    unit.emitTestEvent('zero dependency test');
    
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('zero dependency test');
 });

