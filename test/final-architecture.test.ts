/**
 * Tests for the final @synet/unit implementation with architectural decisions
 */

import { describe, it, expect } from 'vitest';
import type { Unit, UnitSchema } from '../src';
import {
  BaseUnit,
  createUnitSchema,
  validateUnitSchema,
} from '../src';

// Test implementation using new architecture
class TestUnit extends BaseUnit {
  private constructor(name: string) {
    super(createUnitSchema({
      name: 'test-unit',
      version: '1.0.0',
      baseCommands: ['test', 'demo'],
      description: 'Test unit for final architecture'
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

  help(): void {
    console.log('TestUnit - demonstrating final architecture');
    console.log(`Base commands: ${this.dna.baseCommands.join(', ')}`);
    console.log(`Current capabilities: ${this.getCapabilities().join(', ')}`);
  }

  private testMethod(): string {
    return 'test-result';
  }

  private demoMethod(): string {
    return 'demo-result';
  }
}

describe('@synet/unit Final Architecture', () => {
  describe('UnitSchema with baseCommands', () => {
    it('should create schema with baseCommands', () => {
      const schema = createUnitSchema({
        name: 'test',
        version: '1.0.0',
        baseCommands: ['cmd1', 'cmd2'],
        description: 'Test schema'
      });

      expect(schema.name).toBe('test');
      expect(schema.version).toBe('1.0.0');
      expect(schema.baseCommands).toEqual(['cmd1', 'cmd2']);
      expect(schema.description).toBe('Test schema');
    });

    it('should validate schema correctly', () => {
      const validSchema = createUnitSchema({
        name: 'test',
        version: '1.0.0',
        baseCommands: ['cmd']
      });

      expect(validateUnitSchema(validSchema)).toBe(true);

      // Invalid schemas
      const invalidSchemas: Partial<UnitSchema>[] = [
        { name: '', version: '1.0.0', baseCommands: ['cmd'] },
        { name: 'test', version: '', baseCommands: ['cmd'] },
        { name: 'test', version: '1.0.0', baseCommands: [] }
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
      
      expect(unit.getCapabilities()).toEqual(['test', 'demo']);
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
      expect(unit.getCapabilities()).toContain('newSkill');
    });
  });

  describe('DNA vs Capabilities Separation', () => {
    it('should separate immutable DNA from dynamic capabilities', () => {
      const unit = TestUnit.create('test');
      
      // DNA is immutable identity
      expect(unit.dna.baseCommands).toEqual(['test', 'demo']);
      
      // Capabilities are dynamic
      expect(unit.getCapabilities()).toEqual(['test', 'demo']);
      
      // Learn new capability
      unit.learn([{ newCapability: () => 'new' }]);
      
      // DNA unchanged
      expect(unit.dna.baseCommands).toEqual(['test', 'demo']);
      
      // Capabilities expanded
      expect(unit.getCapabilities()).toContain('newCapability');
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
      class FailingUnit extends BaseUnit {
        constructor() {
          super(createUnitSchema({
            name: 'failing-unit',
            version: '1.0.0',
            baseCommands: ['fail']
          }));
          
          // Mark as failed during construction
          this._markFailed('Test failure', ['detail1', 'detail2']);
        }
        
        whoami(): string {
          return 'FailingUnit';
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
});
