/**
 * Tests for the final @synet/unit implementation with architectural decisions
 */

import { describe, it, expect } from 'vitest';



import type { IUnit, UnitSchema, CapabilityContract } from '../src';
import {
  Unit,
  createUnitSchema,
  validateUnitSchema,
  TeachingContract,
} from '../src';

// Test implementation using new architecture
class TestUnit extends Unit {
  private constructor(name: string) {
    super(createUnitSchema({
      id: `${name}-unit`,
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
    return `TestUnit[${this.dna.id}]`;
  }

  capabilities(): string[] {
    return Array.from(this._getAllCapabilities());
  }

  help(): void {
    console.log('TestUnit - demonstrating final architecture');
    console.log(`Current capabilities: ${this.capabilities().join(', ')}`);
  }

  teach(): TeachingContract {
    // Simple, explicit teaching - no filtering boilerplate
    return {
      unitId: this.dna.id,
      capabilities: {
        test: () => this.testMethod(),
        demo: () => this.demoMethod()
      }
    };
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
        id: 'test',
        version: '1.0.0'
      });

      expect(schema.id).toBe('test');
      expect(schema.version).toBe('1.0.0');
      expect(schema.parent).toBeUndefined();
    });

    it('should create schema with parent lineage', () => {
      const parentSchema = createUnitSchema({
        id: 'parent-unit',
        version: '1.0.0'
      });

      const childSchema = createUnitSchema({
        id: 'child-unit',
        version: '1.0.1',
        parent: parentSchema
      });

      expect(childSchema.parent).toEqual(parentSchema);
      expect(childSchema.parent?.id).toBe('parent-unit');
    });

    it('should validate schema correctly', () => {
      const validSchema = createUnitSchema({
        id: 'test',
        version: '1.0.0'
      });

      expect(validateUnitSchema(validSchema)).toBe(true);

      // Invalid schemas
      const invalidSchemas: Partial<UnitSchema>[] = [
        { id: '', version: '1.0.0' },
        { id: 'test', version: '' },
        { id: 'test' } // missing version
      ];
      
      for (const schema of invalidSchemas) {
        expect(validateUnitSchema(schema as UnitSchema)).toBe(false);
      }
    });

    it('should validate unit IDs with strict rules', () => {
      // Valid IDs
      expect(() => createUnitSchema({ id: 'signer', version: '1.0.0' })).not.toThrow();
      expect(() => createUnitSchema({ id: 'quantum-signer', version: '1.0.0' })).not.toThrow();
      expect(() => createUnitSchema({ id: 'my-vault', version: '1.0.0' })).not.toThrow();
      
      // Invalid IDs should throw
      expect(() => createUnitSchema({ id: 'My Signer', version: '1.0.0' })).toThrow('Unit ID must be lowercase');
      expect(() => createUnitSchema({ id: 'SIGNER', version: '1.0.0' })).toThrow('Unit ID must be lowercase');
      expect(() => createUnitSchema({ id: 'signer.v2', version: '1.0.0' })).toThrow('alphanumeric + hyphens');
      expect(() => createUnitSchema({ id: '', version: '1.0.0' })).toThrow('Unit ID cannot be empty');
      expect(() => createUnitSchema({ id: '123signer', version: '1.0.0' })).toThrow('starting with letter');
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
      
      expect(unit.can('test')).toBe(true);
      expect(unit.can('demo')).toBe(true);
      expect(unit.can('unknown')).toBe(false);
      
      expect(unit.capabilities()).toEqual(['test', 'demo']);
    });

    it('should execute capabilities', async () => {
      const unit = TestUnit.create('test');
      
      const result = await unit.execute('test');
      expect(result).toBe('test-result');
    });

    it('should teach capabilities', () => {
      const unit = TestUnit.create('test');
      
      const contract = unit.teach();
      expect(contract).toHaveProperty('unitId');
      expect(contract).toHaveProperty('capabilities');
      expect(contract.unitId).toBe('test-unit');
      expect(Object.keys(contract.capabilities)).toHaveLength(2);
      expect(contract.capabilities).toHaveProperty('test');
      expect(contract.capabilities).toHaveProperty('demo');
      expect(typeof contract.capabilities.test).toBe('function');
    });

    it('should learn new capabilities', () => {
      const unit = TestUnit.create('test');
      
      const newTeachingContract: TeachingContract = {
        unitId: 'external',
        capabilities: {
          learnedSkill: () => 'learned-skill'
        }
      };
      
      unit.learn([newTeachingContract]);
      
      expect(unit.can('external.learnedSkill')).toBe(true);
      expect(unit.capabilities()).toContain('external.learnedSkill');
    });
  });

  describe('DNA vs Capabilities Separation', () => {
    it('should separate immutable DNA from dynamic capabilities', () => {
      const unit = TestUnit.create('test');
      
      // DNA is immutable identity - no baseCommands anymore
      expect(unit.dna.id).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      
      // Capabilities are dynamic
      expect(unit.capabilities()).toEqual(['test', 'demo']);
      
      // Learn new capability
      const newTeachingContract: TeachingContract = {
        unitId: 'external',
        capabilities: {
          newFeature: () => 'new'
        }
      };
      unit.learn([newTeachingContract]);
      
      // DNA unchanged
      expect(unit.dna.id).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      
      // Capabilities expanded
      expect(unit.capabilities()).toContain('external.newFeature');
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
      const unit2Contract = unit2.teach();
      unit1.learn([unit2Contract]);
      
      // Unit1 now has unit2's capabilities (namespaced)
      expect(unit1.can('unit2-unit.test')).toBe(true);
      expect(unit1.can('unit2-unit.demo')).toBe(true);
    });
  });

  describe('Error Handling with string errors', () => {
    it('should use string errors for simplicity', () => {
      // Create a unit that fails validation
      class FailingUnit extends Unit {
        constructor() {
          super(createUnitSchema({
            id: 'failing-unit',
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
        
        teach(): TeachingContract {
          // Return empty contract - this unit has nothing to teach since it failed
          return {
            unitId: this.dna.id,
            capabilities: {}
          };
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
      expect(unit.dna.id).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      expect(unit.dna.parent).toBeUndefined();
      
      // Evolve the unit
      const evolved = unit.evolve('advanced-test-unit', {
        advancedFeature: () => 'advanced-result'
      });
      
      // Check evolution tracking
      expect(evolved.dna.id).toBe('advanced-test-unit');
      expect(evolved.dna.version).toBe('1.0.1'); // Version incremented
      expect(evolved.dna.parent).toBeDefined();
      expect(evolved.dna.parent?.id).toBe('test-unit');
      expect(evolved.dna.parent?.version).toBe('1.0.0');
      
      // Check capabilities
      expect(evolved.can('advancedFeature')).toBe(true);
      expect(evolved.capabilities()).toContain('advancedFeature');
    });

    it('should support multiple generations of evolution', () => {
      const unit = TestUnit.create('gen1');
      
      // First evolution
      const gen2 = unit.evolve('gen2-unit');
      expect(gen2.dna.parent?.id).toBe('gen1-unit');
      
      // Second evolution
      const gen3 = gen2.evolve('gen3-unit');
      expect(gen3.dna.parent?.id).toBe('gen2-unit');
      expect(gen3.dna.parent?.parent?.id).toBe('gen1-unit');
    });
  });

  describe('Simple Use Case Verification', () => {
    it('should support unit.learn([unit.teach(), unit2.teach()]) pattern', () => {
      const unit1 = TestUnit.create('unit1');
      const unit2 = TestUnit.create('unit2'); 
      const unit3 = TestUnit.create('unit3');
      
      // Before learning
      expect(unit3.capabilities()).toHaveLength(2); // testMethod, demoMethod
       // Learn from both units at once - this should work
      const allContracts = [unit1.teach(), unit2.teach()];
      unit3.learn(allContracts);
      
      // After learning - should have capabilities from both units
      expect(unit3.capabilities().length).toBeGreaterThan(2);
      
      // Debug: let's see what capabilities actually exist
      console.log('Available capabilities:', unit3.capabilities());
      
      // Check that namespaced capabilities exist
      // Note: units created with TestUnit.create() have different IDs based on the parameter
      expect(unit3.can('unit1-unit.test')).toBe(true);
      expect(unit3.can('unit1-unit.demo')).toBe(true);
      expect(unit3.can('unit2-unit.test')).toBe(true);
      expect(unit3.can('unit2-unit.demo')).toBe(true);
    });
    
    it('should explain the "bound methodName" behavior', () => {
      const unit1 = TestUnit.create('teacher');
      const unit2 = TestUnit.create('student');
      
      // Get contract from unit1
      const contract = unit1.teach();
      
      // Check that we have clean native method names
      expect(Object.keys(contract.capabilities)).toContain('test');
      expect(Object.keys(contract.capabilities)).toContain('demo');
      
      // Learn the capabilities
      unit2.learn([contract]);
      
      // The new naming is clean and deterministic
      expect(unit2.can('teacher-unit.test')).toBe(true);
      expect(unit2.can('teacher-unit.demo')).toBe(true);
    });
  });
});
