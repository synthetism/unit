/**
 * Tests for the final @synet/unit implementation with architectural decisions
 */

import { describe, it, expect } from 'vitest';



import type { IUnit, UnitSchema } from '../src';
import {
  Unit,
  createUnitSchema,
  validateUnitSchema,
} from '../src';

// Test implementation using new architecture
class TestUnit extends Unit {
  private constructor(name: string) {
    super(createUnitSchema({
      name: 'test-unit',
      version: '1.0.0'
    }));

    // Add initial capabilities
    this._addCapability('test', this.testMethod.bind(this));
    this._addCapability('demo', this.demoMethod.bind(this));
  }

  static create(name: string): TestUnit {
    return new TestUnit(name);
  }

  whoami(): string {
    return `TestUnit[${this.dna.name}]`;
  }

  capabilities(): string[] {
    return Array.from(this._getAllCapabilities());
  }

  help(): void {
    console.log('TestUnit - demonstrating final architecture');
    console.log(`Current capabilities: ${this.capabilities().join(', ')}`);
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    const capabilities: Record<string, (...args: unknown[]) => unknown> = {};
    for (const [name, impl] of this._capabilities.entries()) {
      capabilities[name] = impl;
    }
    return capabilities;
  }

  private testMethod(): string {
    return 'test-result';
  }

  private demoMethod(): string {
    return 'demo-result';
  }
}

describe('@synet/unit Final Architecture', () => {
  describe('UnitSchema Evolution', () => {
    it('should create schema with evolution support', () => {
      const schema = createUnitSchema({
        name: 'test',
        version: '1.0.0'
      });

      expect(schema.name).toBe('test');
      expect(schema.version).toBe('1.0.0');
      expect(schema.parent).toBeUndefined();
    });

    it('should create schema with parent lineage', () => {
      const parentSchema = createUnitSchema({
        name: 'parent-unit',
        version: '1.0.0'
      });

      const childSchema = createUnitSchema({
        name: 'child-unit',
        version: '1.0.1',
        parent: parentSchema
      });

      expect(childSchema.parent).toEqual(parentSchema);
      expect(childSchema.parent?.name).toBe('parent-unit');
    });

    it('should validate schema correctly', () => {
      const validSchema = createUnitSchema({
        name: 'test',
        version: '1.0.0'
      });

      expect(validateUnitSchema(validSchema)).toBe(true);

      // Invalid schemas
      const invalidSchemas: Partial<UnitSchema>[] = [
        { name: '', version: '1.0.0' },
        { name: 'test', version: '' },
        { name: 'test' } // missing version
      ];
      
      for (const schema of invalidSchemas) {
        expect(validateUnitSchema(schema as UnitSchema)).toBe(false);
      }
    });
  });

  describe('BaseUnit Implementation', () => {
    it('should create units with self-validation', () => {
      const unit = TestUnit.create('test');
      
      expect(unit.created).toBe(true);
      expect(unit.error).toBeUndefined();
      expect(unit.whoami()).toBe('TestUnit[test-unit]');
    });

    it('should have dynamic capabilities', () => {
      const unit = TestUnit.create('test');
      
      expect(unit.capableOf('test')).toBe(true);
      expect(unit.capableOf('demo')).toBe(true);
      expect(unit.capableOf('unknown')).toBe(false);
      
      expect(unit.capabilities()).toEqual(['test', 'demo']);
    });

    it('should execute capabilities', async () => {
      const unit = TestUnit.create('test');
      
      const result = await unit.execute('test');
      expect(result).toBe('test-result');
    });

    it('should teach capabilities', () => {
      const unit = TestUnit.create('test');
      
      const capabilities = unit.teach();
      expect(Object.keys(capabilities)).toEqual(['test', 'demo']);
      expect(typeof capabilities.test).toBe('function');
    });

    it('should learn new capabilities', () => {
      const unit = TestUnit.create('test');
      
      const newCapabilities = {
        newSkill: () => 'learned-skill'
      };
      
      unit.learn([newCapabilities]);
      
      expect(unit.capableOf('newSkill')).toBe(true);
      expect(unit.capabilities()).toContain('newSkill');
    });
  });

  describe('DNA vs Capabilities Separation', () => {
    it('should separate immutable DNA from dynamic capabilities', () => {
      const unit = TestUnit.create('test');
      
      // DNA is immutable identity - no baseCommands anymore
      expect(unit.dna.name).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      
      // Capabilities are dynamic
      expect(unit.capabilities()).toEqual(['test', 'demo']);
      
      // Learn new capability
      unit.learn([{ newCapability: () => 'new' }]);
      
      // DNA unchanged
      expect(unit.dna.name).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      
      // Capabilities expanded
      expect(unit.capabilities()).toContain('newCapability');
    });
  });

  describe('Required Methods (teach/learn/evolve)', () => {
    it('should have required methods always available', () => {
      const unit = TestUnit.create('test');
      
      // These are always available (no ugly checks needed)
      expect(typeof unit.teach).toBe('function');
      expect(typeof unit.learn).toBe('function');
      expect(typeof unit.evolve).toBe('function');
      expect(typeof unit.execute).toBe('function');
      
      // No need for unit.teach?.() checks
      const capabilities = unit.teach();
      expect(capabilities).toBeDefined();
    });
  });

  describe('Unit Composition', () => {
    it('should enable clean unit composition', () => {
      const unit1 = TestUnit.create('unit1');
      const unit2 = TestUnit.create('unit2');
      
      // Unit1 learns from unit2
      const unit2Capabilities = unit2.teach();
      unit1.learn([unit2Capabilities]);
      
      // Unit1 now has unit2's capabilities
      expect(unit1.capableOf('test')).toBe(true);
      expect(unit1.capableOf('demo')).toBe(true);
    });
  });

  describe('Error Handling with string errors', () => {
    it('should use string errors for simplicity', () => {
      // Create a unit that fails validation
      class FailingUnit extends Unit {
        constructor() {
          super(createUnitSchema({
            name: 'failing-unit',
            version: '1.0.0'
          }));
          
          // Mark as failed during construction
          this._markFailed('Test failure', ['detail1', 'detail2']);
        }
        
        whoami(): string {
          return 'FailingUnit';
        }
        
        capabilities(): string[] {
          return this._getAllCapabilities();
        }
        
        teach(): Record<string, (...args: unknown[]) => unknown> {
          return {};
        }
        
        help(): void {
          console.log('This unit failed');
        }
      }
      
      const unit = new FailingUnit();
      
      expect(unit.created).toBe(false);
      expect(unit.error).toBe('Test failure');
      expect(unit.stack).toEqual(['detail1', 'detail2']);
      
      // String error is simple to work with
      expect(typeof unit.error).toBe('string');
    });
  });

  describe('Unit Evolution', () => {
    it('should track evolution lineage in DNA', () => {
      const unit = TestUnit.create('test');
      
      // Check initial state
      expect(unit.dna.name).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      expect(unit.dna.parent).toBeUndefined();
      
      // Evolve the unit
      const evolved = unit.evolve('advanced-test-unit', {
        advancedFeature: () => 'advanced-result'
      });
      
      // Check evolution tracking
      expect(evolved.dna.name).toBe('advanced-test-unit');
      expect(evolved.dna.version).toBe('1.0.1'); // Version incremented
      expect(evolved.dna.parent).toBeDefined();
      expect(evolved.dna.parent?.name).toBe('test-unit');
      expect(evolved.dna.parent?.version).toBe('1.0.0');
      
      // Check capabilities
      expect(evolved.capableOf('advancedFeature')).toBe(true);
      expect(evolved.capabilities()).toContain('advancedFeature');
    });

    it('should support multiple generations of evolution', () => {
      const unit = TestUnit.create('gen1');
      
      // First evolution
      const gen2 = unit.evolve('gen2-unit');
      expect(gen2.dna.parent?.name).toBe('test-unit');
      
      // Second evolution
      const gen3 = gen2.evolve('gen3-unit');
      expect(gen3.dna.parent?.name).toBe('gen2-unit');
      expect(gen3.dna.parent?.parent?.name).toBe('test-unit');
    });
  });
});
