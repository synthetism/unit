import { describe, it, expect, beforeEach } from 'vitest';
import { 
  Unit, 
  createUnitSchema, 
  type UnitProps, 
  type UnitCore, 
  type TeachingContract,
  type IUnit,
  Capabilities, 
  Schema, 
  Validator 
} from '../src/index.js';

// Test unit implementation for testing base Unit class
interface TestUnitProps extends UnitProps {
  testValue: string;
  initialized: boolean;
}

interface TestUnitConfig {
  testValue: string;
  metadata?: Record<string, unknown>;
}

class TestUnit extends Unit<TestUnitProps> {
  protected constructor(props: TestUnitProps) {
    super(props);
  }

  protected build(): UnitCore {
    const capabilities = Capabilities.create(this.dna.id, {
      process: (...args: unknown[]) => this.processImpl(...args),
      getValue: (...args: unknown[]) => this.getValueImpl(...args),
      testMethod: (...args: unknown[]) => this.testMethodImpl(...args)
    });

    const schema = Schema.create(this.dna.id, {
      process: {
        name: 'process',
        description: 'Process input data',
        parameters: {
          type: 'object',
          properties: {
            data: { type: 'string', description: 'Data to process' }
          },
          required: ['data']
        },
        response: { type: 'string' }
      },
      getValue: {
        name: 'getValue', 
        description: 'Get unit value',
        parameters: {
          type: 'object',
          properties: {}
        },
        response: { type: 'string' }
      },
      testMethod: {
        name: 'testMethod',
        description: 'Test method implementation',
        parameters: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Test input' }
          },
          required: ['input']
        },
        response: { type: 'string' }
      }
    });

    const validator = Validator.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }

  static create(config: TestUnitConfig): TestUnit {
    const props: TestUnitProps = {
      dna: createUnitSchema({ id: 'test-unit', version: '1.0.7' }),
      testValue: config.testValue,
      initialized: true,
      created: new Date(),
      metadata: config.metadata || {}
    };
    return new TestUnit(props);
  }

  capabilities(): Capabilities {
    return this._unit.capabilities;
  }

  schema(): Schema {
    return this._unit.schema;
  }

  validator(): Validator {
    return this._unit.validator;
  }

  whoami(): string {
    return `TestUnit[${this.dna.id}@${this.dna.version}]`;
  }

  help(): void {
    console.log(`TestUnit - processes data and provides test value: ${this.props.testValue}`);
  }

  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }

  // Test helper methods to access protected properties
  getTestValue(): string {
    return this.props.testValue;
  }

  getCreated(): Date | undefined {
    return this.props.created;
  }

  getMetadata(): Record<string, unknown> {
    return this.props.metadata || {};
  }

  // Native method implementations
  private processImpl(...args: unknown[]): string {
    const input = args[0] as { data: string };
    return `processed: ${input.data}`;
  }

  private getValueImpl(...args: unknown[]): string {
    return this.props.testValue;
  }

  private testMethodImpl(...args: unknown[]): string {
    const input = args[0] as { input: string };
    return `test: ${input.input}`;
  }

  // Public getter for testing
  get testValue(): string {
    return this.props.testValue;
  }
}

// Another test unit for composition testing
class SimpleUnit extends Unit<UnitProps> {
  protected constructor(props: UnitProps) {
    super(props);
  }

  protected build(): UnitCore {
    const capabilities = Capabilities.create(this.dna.id, {
      simple: (...args: unknown[]) => this.simpleImpl(...args)
    });

    const schema = Schema.create(this.dna.id, {
      simple: {
        name: 'simple',
        description: 'Simple operation',
        parameters: {
          type: 'object',
          properties: {
            value: { type: 'string', description: 'Input value' }
          }
        }
      }
    });

    const validator = Validator.create({
      unitId: this.dna.id,
      capabilities,
      schema
    });

    return { capabilities, schema, validator };
  }

  static create(): SimpleUnit {
    const props: UnitProps = {
      dna: createUnitSchema({ id: 'simple-unit', version: '1.0.7' }),
      created: new Date()
    };
    return new SimpleUnit(props);
  }

  capabilities(): Capabilities { return this._unit.capabilities; }
  schema(): Schema { return this._unit.schema; }
  validator(): Validator { return this._unit.validator; }

  whoami(): string {
    return `SimpleUnit[${this.dna.id}@${this.dna.version}]`;
  }

  help(): void {
    console.log('SimpleUnit - provides simple operations');
  }

  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }

  private simpleImpl(...args: unknown[]): string {
    const input = args[0] as { value: string };
    return `simple: ${input?.value || 'default'}`;
  }
}

describe('Unit v1.0.7', () => {
  let testUnit: TestUnit;
  let simpleUnit: SimpleUnit;

  beforeEach(() => {
    testUnit = TestUnit.create({ testValue: 'test123' });
    simpleUnit = SimpleUnit.create();
  });

  describe('Unit Creation', () => {
    it('should create unit with consciousness trinity', () => {
      expect(testUnit).toBeDefined();
      expect(testUnit.capabilities()).toBeDefined();
      expect(testUnit.schema()).toBeDefined();
      expect(testUnit.validator()).toBeDefined();
    });

    it('should have correct DNA structure', () => {
      expect(testUnit.dna.id).toBe('test-unit');
      expect(testUnit.dna.version).toBe('1.0.7');
      expect(testUnit.dna.parent).toBeUndefined();
    });

    it('should store props immutably', () => {
      expect(testUnit.testValue).toBe('test123');
      
      // Props should be frozen
      expect(() => {
        (testUnit as any).props.testValue = 'changed';
      }).toThrow();
    });

    it('should validate consciousness integrity during construction', () => {
      expect(() => {
        // This should work fine
        TestUnit.create({ testValue: 'valid' });
      }).not.toThrow();
    });
  });

  describe('Identity and Metadata', () => {
    it('should provide correct identity through whoami()', () => {
      const identity = testUnit.whoami();
      expect(identity).toBe('TestUnit[test-unit@1.0.7]');
    });

    it('should handle metadata correctly', () => {
      const unitWithMeta = TestUnit.create({
        testValue: 'test',
        metadata: { custom: 'value', number: 42 }
      });

      expect(unitWithMeta.getMetadata()).toEqual({ custom: 'value', number: 42 });
    });

    it('should have creation timestamp', () => {
      expect(testUnit.getCreated()).toBeInstanceOf(Date);
      expect(testUnit.getCreated()!.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Capability System', () => {
    it('should check capabilities correctly with can()', () => {
      expect(testUnit.can('process')).toBe(true);
      expect(testUnit.can('getValue')).toBe(true);
      expect(testUnit.can('testMethod')).toBe(true);
      expect(testUnit.can('nonexistent')).toBe(false);
    });

    it('should list capabilities through getCapabilities()', () => {
      const caps = testUnit.getCapabilities();
      expect(caps).toContain('process');
      expect(caps).toContain('getValue');
      expect(caps).toContain('testMethod');
      expect(caps.length).toBe(3);
    });

    it('should execute native capabilities', async () => {
      const result = await testUnit.execute('process', { data: 'input data' });
      expect(result).toBe('processed: input data');

      const value = await testUnit.execute('getValue');
      expect(value).toBe('test123');

      const testResult = await testUnit.execute('testMethod', { input: 'hello' });
      expect(testResult).toBe('test: hello');
    });

    it('should throw error for non-existent capabilities', async () => {
      await expect(testUnit.execute('nonexistent')).rejects.toThrow();
    });
  });

  describe('Schema System', () => {
    it('should check schema existence with hasSchema()', () => {
      expect(testUnit.hasSchema('process')).toBe(true);
      expect(testUnit.hasSchema('getValue')).toBe(true);
      expect(testUnit.hasSchema('testMethod')).toBe(true); // Added to schema for consistency
      expect(testUnit.hasSchema('nonexistent')).toBe(false);
    });

    it('should retrieve schemas with getSchema()', () => {
      const processSchema = testUnit.getSchema('process');
      expect(processSchema).toBeDefined();
      expect(processSchema!.name).toBe('process');
      expect(processSchema!.description).toBe('Process input data');
      
      const nonExistentSchema = testUnit.getSchema('nonexistent');
      expect(nonExistentSchema).toBeUndefined();
    });
  });

  describe('Teaching and Learning', () => {
    it('should create teaching contract with consciousness trinity', () => {
      const contract = testUnit.teach();
      
      expect(contract.unitId).toBe('test-unit');
      expect(contract.capabilities).toBeInstanceOf(Capabilities);
      expect(contract.schema).toBeInstanceOf(Schema);
      expect(contract.validator).toBeInstanceOf(Validator);
    });

    it('should learn capabilities from other units', () => {
      const simpleContract = simpleUnit.teach();
      
      // Before learning
      expect(testUnit.can('simple-unit.simple')).toBe(false);
      
      // Learn from simple unit
      testUnit.learn([simpleContract]);
      
      // After learning
      expect(testUnit.can('simple-unit.simple')).toBe(true);
    });

    it('should execute learned capabilities with namespace', async () => {
      const simpleContract = simpleUnit.teach();
      testUnit.learn([simpleContract]);
      
      const result = await testUnit.execute('simple-unit.simple', { value: 'test value' });
      expect(result).toBe('simple: test value');
    });

    it('should handle multiple teaching contracts', () => {
      const anotherSimple = SimpleUnit.create();
      
      testUnit.learn([simpleUnit.teach(), anotherSimple.teach()]);
      
      expect(testUnit.can('simple-unit.simple')).toBe(true);
    });
  });

  describe('Evolution', () => {
    it('should evolve into new unit with preserved lineage', () => {
      const evolved = testUnit.evolve('evolved-test-unit');
      
      // New unit should be different instance
      expect(evolved).not.toBe(testUnit);
      
      // Identity should be updated (test through whoami)
      expect(evolved.whoami()).toContain('evolved-test-unit');
      expect(evolved.whoami()).not.toBe(testUnit.whoami());
      
      // Original unit should be unchanged
      expect(testUnit.whoami()).toContain('test-unit');
    });

    it('should preserve capabilities after evolution', () => {
      const evolved = testUnit.evolve('evolved-test-unit');
      
      expect(evolved.can('process')).toBe(true);
      expect(evolved.can('getValue')).toBe(true);
      expect(evolved.can('testMethod')).toBe(true);
    });

    it('should preserve learned capabilities after evolution', () => {
      // Learn capability first
      testUnit.learn([simpleUnit.teach()]);
      expect(testUnit.can('simple-unit.simple')).toBe(true);
      
      // Evolve
      const evolved = testUnit.evolve('evolved-with-learned');
      
      // Should preserve learned capabilities (they get re-namespaced)
      expect(evolved.can('test-unit.simple-unit.simple')).toBe(true);
    });

    it('should evolve with additional capabilities', () => {
      const evolved = testUnit.evolve('enhanced-unit', {
        newCapability: (...args: unknown[]) => {
          const input = args[0] as string;
          return `new: ${input}`;
        }
      });
      
      expect(evolved.can('enhanced-unit.newCapability')).toBe(true);
      expect(evolved.can('process')).toBe(true); // Original capabilities preserved
    });
  });

  describe('Value Object Behavior', () => {
    it('should implement value equality correctly', () => {
      const unit1 = TestUnit.create({ testValue: 'same' });
      const unit2 = TestUnit.create({ testValue: 'same' });
      const unit3 = TestUnit.create({ testValue: 'different' });
      
      // Same props should be equal
      expect(unit1.equals(unit2)).toBe(true);
      
      // Different props should not be equal
      expect(unit1.equals(unit3)).toBe(false);
    });

    it('should have immutable props', () => {
      const originalValue = testUnit.testValue;
      
      // Direct mutation should be prevented
      expect(() => {
        (testUnit as any).props.testValue = 'mutated';
      }).toThrow();
      
      // Value should remain unchanged
      expect(testUnit.testValue).toBe(originalValue);
    });
  });

  describe('Error Handling', () => {
    it('should throw meaningful errors for capability execution failures', async () => {
      // Mock a capability that throws
      const errorUnit = TestUnit.create({ testValue: 'error-test' });
      errorUnit.capabilities().set('errorCapability', () => {
        throw new Error('Capability execution failed');
      });
      
      await expect(errorUnit.execute('errorCapability')).rejects.toThrow('Capability execution failed');
    });

    it('should provide helpful error messages for missing capabilities', async () => {
      await expect(testUnit.execute('missing-capability')).rejects.toThrow(/Capability 'missing-capability' not found/);
    });
  });

  describe('Self-Documentation', () => {
    it('should provide help method', () => {
      // Should not throw
      expect(() => testUnit.help()).not.toThrow();
    });

    it('should have whoami method return meaningful identity', () => {
      const identity = testUnit.whoami();
      expect(identity).toContain('TestUnit');
      expect(identity).toContain('test-unit');
      expect(identity).toContain('1.0.7');
    });
  });
});
