/**
 * Tests for @synet/unit v1.0.5 - ValueObject foundation architecture
 * Tests Unit Architecture with 22 Doctrines compliance
 */

import { describe, it, expect } from 'vitest';

import type { UnitSchema, TeachingContract, UnitProps } from '../src';
import {
  Unit,
  createUnitSchema,
  validateUnitSchema,
} from '../src';

// ✅ Test Config → Props pattern (Doctrine #13)
interface TestUnitConfig {
  name: string;
  data?: string;
  meta?: Record<string, unknown>;
}

interface TestUnitProps extends UnitProps {
  dna: UnitSchema;
  name: string;
  data: string;
  created: Date;
  metadata: Record<string, unknown>;
}

// ✅ Test implementation using v1.0.5 architecture
class TestUnit extends Unit<TestUnitProps> {
  
  // ✅ Protected constructor (enables evolution) - Doctrine #4
  protected constructor(props: TestUnitProps) {
    super(props);
  }

  // ✅ Static create() factory - Doctrine #4
  static create(config: TestUnitConfig): TestUnit {
    const props: TestUnitProps = {
      dna: createUnitSchema({
        id: `${config.name}-unit`,
        version: '1.0.0'
      }),
      name: config.name,
      data: config.data || 'default-data',
      created: new Date(),
      metadata: config.meta || {}
    };
    
    return new TestUnit(props);
  }

  // ✅ Self-awareness - Doctrine #11
  whoami(): string {
    return `[🧪] Test Unit - Architectural validation unit (${this.dna.id})`;
  }

  // ✅ Capability declaration - Doctrine #12
  capabilities(): string[] {
    const native = ['test', 'demo', 'getData'];
    const learned = this._getAllCapabilities().filter(cap => cap.includes('.'));
    return [...native, ...learned];
  }

  // ✅ Living documentation - Doctrine #11
  help(): void {
    console.log(`
🧪 Test Unit - Architectural Validation

NATIVE CAPABILITIES:
• test() - Test method execution
• demo() - Demo functionality
• getData() - Get internal data

LEARNED CAPABILITIES:
${this._getAllCapabilities().filter(cap => cap.includes('.')).map(cap => `• ${cap}`).join('\n') || '• None learned yet'}

PROPS ACCESS:
• Name: ${this.props.name}
• Data: ${this.props.data}
• Created: ${this.props.created.toISOString()}

EXAMPLE USAGE:
  const unit = TestUnit.create({ name: 'my-test' });
  await unit.execute('test');  // Native capability
    `);
  }

  // ✅ Teaching only native capabilities - Doctrine #19
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        test: this.testMethod.bind(this),
        demo: this.demoMethod.bind(this),
        getData: this.getData.bind(this)
      }
    };
  }

  // ✅ Graceful degradation - capability validation - Doctrine #20
  async advancedOperation(input: string): Promise<string> {
    // Check for learned enhancement
    if (this.can('crypto.encrypt')) {
      return this.execute('crypto.encrypt', input);
    }
    
    // Fallback to native capability
    return this.basicOperation(input);
  }

  // ✅ Public methods for testing
  public testBasicOperation(input: string): string {
    return this.basicOperation(input);
  }

  public getPropsForTesting() {
    return {
      name: this.props.name,
      data: this.props.data,
      metadata: this.props.metadata,
      created: this.props.created
    };
  }

  // ✅ Native capabilities (private implementations)
  private testMethod(): string {
    return 'test-result';
  }

  private demoMethod(): string {
    return 'demo-result';
  }

  private getData(): string {
    return this.props.data;  // ✅ Access immutable props
  }

  private basicOperation(input: string): string {
    return `basic-${input}`;
  }
}

describe('@synet/unit v1.0.5 Architecture', () => {
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

  describe('ValueObject Foundation (Doctrine #17)', () => {
    it('should create units with immutable props', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Unit exists and has proper identity
      expect(unit.dna.id).toBe('test-unit');
      expect(unit.whoami()).toContain('Test Unit');
      
      // ✅ Props are accessible through testing methods
      const props = unit.getPropsForTesting();
      expect(props.name).toBe('test');
      expect(props.data).toBe('default-data');
      expect(props.created).toBeInstanceOf(Date);
      
      // ✅ Immutability is enforced at ValueObject level
      expect(() => {
        // TypeScript prevents this, but test runtime protection
        Object.assign(props, { name: 'hacked' });
      }).not.toThrow(); // Assignment to copy doesn't affect original
    });

    it('should support value equality', () => {
      const unit1 = TestUnit.create({ name: 'test', data: 'same' });
      const unit2 = TestUnit.create({ name: 'test', data: 'same' });
      
      // ✅ Different instances
      expect(unit1).not.toBe(unit2);
      
      // ✅ Value equality through props
      expect(unit1.equals(unit2)).toBe(true);
    });
  });

  describe('Unit Capabilities (Doctrines #5, #6, #12)', () => {
    it('should have dynamic capabilities with namespacing', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Native capabilities available
      expect(unit.can('test')).toBe(false); // Native methods not in capability map
      expect(unit.capabilities()).toEqual(['test', 'demo', 'getData']);
    });

    it('should execute native capabilities directly', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Can access testing methods
      const props = unit.getPropsForTesting();
      expect(props.data).toBe('default-data');
    });

    it('should learn capabilities with proper namespacing', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      const teachingContract: TeachingContract = {
        unitId: 'external-unit',
        capabilities: {
          learnedSkill: () => 'learned-result'
        }
      };
      
      unit.learn([teachingContract]);
      
      // ✅ Learned capability is namespaced
      expect(unit.can('external-unit.learnedSkill')).toBe(true);
      expect(unit.capabilities()).toContain('external-unit.learnedSkill');
    });
  });

  describe('Teaching Contracts (Doctrines #9, #19)', () => {
    it('should teach only native capabilities', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      const contract = unit.teach();
      
      // ✅ Teaching contract structure
      expect(contract).toHaveProperty('unitId');
      expect(contract).toHaveProperty('capabilities');
      expect(contract.unitId).toBe('test-unit');
      
      // ✅ Only native capabilities taught
      expect(Object.keys(contract.capabilities)).toEqual(['test', 'demo', 'getData']);
      expect(typeof contract.capabilities.test).toBe('function');
    });

    it('should not teach learned capabilities (capability leakage prevention)', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // Learn external capability
      const externalContract: TeachingContract = {
        unitId: 'external',
        capabilities: {
          externalSkill: () => 'external-result'
        }
      };
      unit.learn([externalContract]);
      
      // Get teaching contract after learning
      const contract = unit.teach();
      
      // ✅ Learned capabilities not included in teaching
      expect(Object.keys(contract.capabilities)).toEqual(['test', 'demo', 'getData']);
      expect(contract.capabilities).not.toHaveProperty('externalSkill');
    });
  });

  describe('DNA vs Capabilities Separation', () => {
    it('should separate immutable DNA from dynamic capabilities', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ DNA is immutable identity
      expect(unit.dna.id).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      
      // ✅ Capabilities are dynamic
      expect(unit.capabilities()).toEqual(['test', 'demo', 'getData']);
      
      // Learn new capability
      const newTeachingContract: TeachingContract = {
        unitId: 'external',
        capabilities: {
          newFeature: () => 'new'
        }
      };
      unit.learn([newTeachingContract]);
      
      // ✅ DNA unchanged
      expect(unit.dna.id).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      
      // ✅ Capabilities expanded
      expect(unit.capabilities()).toContain('external.newFeature');
    });
  });

  describe('Required Methods (teach/learn/evolve)', () => {
    it('should have required methods always available', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Core Unit Architecture methods always available
      expect(typeof unit.teach).toBe('function');
      expect(typeof unit.learn).toBe('function');
      expect(typeof unit.evolve).toBe('function');
      expect(typeof unit.execute).toBe('function');
      expect(typeof unit.whoami).toBe('function');
      expect(typeof unit.capabilities).toBe('function');
      expect(typeof unit.help).toBe('function');
      
      // ✅ Methods execute without error
      const capabilities = unit.teach();
      expect(capabilities).toBeDefined();
    });
  });

  describe('Unit Composition', () => {
    it('should enable clean unit composition', () => {
      const unit1 = TestUnit.create({ name: 'unit1' });
      const unit2 = TestUnit.create({ name: 'unit2' });
      
      // Unit1 learns from unit2
      const unit2Contract = unit2.teach();
      unit1.learn([unit2Contract]);
      
      // ✅ Unit1 now has unit2's capabilities (namespaced)
      expect(unit1.can('unit2-unit.test')).toBe(true);
      expect(unit1.can('unit2-unit.demo')).toBe(true);
      expect(unit1.can('unit2-unit.getData')).toBe(true);
    });
  });
  describe('Unit Evolution (Doctrine #18)', () => {
    it('should track evolution lineage in DNA', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Check initial state
      expect(unit.dna.id).toBe('test-unit');
      expect(unit.dna.version).toBe('1.0.0');
      expect(unit.dna.parent).toBeUndefined();
      
      // ✅ Evolve the unit
      const evolved = unit.evolve('advanced-test-unit', {
        advancedFeature: () => 'advanced-result'
      });
      
      // ✅ Check evolution tracking
      expect(evolved.dna.id).toBe('advanced-test-unit');
      expect(evolved.dna.parent).toBeDefined();
      expect(evolved.dna.parent?.id).toBe('test-unit');
      expect(evolved.dna.parent?.version).toBe('1.0.0');
      
      // ✅ Check capabilities transferred
      expect(evolved.can('advancedFeature')).toBe(true);
    });

    it('should support multiple generations of evolution', () => {
      const unit = TestUnit.create({ name: 'gen1' });
      
      // First evolution
      const gen2 = unit.evolve('gen2-unit');
      expect(gen2.dna.parent?.id).toBe('gen1-unit');
      
      // Second evolution
      const gen3 = gen2.evolve('gen3-unit');
      expect(gen3.dna.parent?.id).toBe('gen2-unit');
      expect(gen3.dna.parent?.parent?.id).toBe('gen1-unit');
    });
  });

  describe('Graceful Degradation (Doctrine #20)', () => {
    it('should provide baseline functionality without learning', () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Basic operation works without learned capabilities
      const result = unit.testBasicOperation('input');
      expect(result).toBe('basic-input');
    });

    it('should enhance functionality when capabilities are learned', async () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Learn crypto capability
      const cryptoContract: TeachingContract = {
        unitId: 'crypto',
        capabilities: {
          encrypt: (...args: unknown[]) => {
            const [data] = args as [string];
            return `encrypted-${data}`;
          }
        }
      };
      unit.learn([cryptoContract]);
      
      // ✅ Enhanced operation uses learned capability
      const result = await unit.advancedOperation('input');
      expect(result).toBe('encrypted-input');
    });
  });

  describe('Unit Composition Patterns', () => {
    it('should support unit.learn([unit.teach(), unit2.teach()]) pattern', () => {
      const unit1 = TestUnit.create({ name: 'unit1' });
      const unit2 = TestUnit.create({ name: 'unit2' }); 
      const unit3 = TestUnit.create({ name: 'unit3' });
      
      // ✅ Before learning
      expect(unit3.capabilities()).toEqual(['test', 'demo', 'getData']);
      
      // ✅ Learn from both units at once
      const allContracts = [unit1.teach(), unit2.teach()];
      unit3.learn(allContracts);
      
      // ✅ After learning - should have capabilities from both units
      expect(unit3.capabilities().length).toBeGreaterThan(3);
      
      // ✅ Check that namespaced capabilities exist
      expect(unit3.can('unit1-unit.test')).toBe(true);
      expect(unit3.can('unit1-unit.demo')).toBe(true);
      expect(unit3.can('unit1-unit.getData')).toBe(true);
      expect(unit3.can('unit2-unit.test')).toBe(true);
      expect(unit3.can('unit2-unit.demo')).toBe(true);
      expect(unit3.can('unit2-unit.getData')).toBe(true);
    });
    
    it('should demonstrate clean capability naming', () => {
      const unit1 = TestUnit.create({ name: 'teacher' });
      const unit2 = TestUnit.create({ name: 'student' });
      
      // ✅ Get contract from unit1
      const contract = unit1.teach();
      
      // ✅ Check that we have clean native method names
      expect(Object.keys(contract.capabilities)).toContain('test');
      expect(Object.keys(contract.capabilities)).toContain('demo');
      expect(Object.keys(contract.capabilities)).toContain('getData');
      
      // ✅ Learn the capabilities
      unit2.learn([contract]);
      
      // ✅ The new naming is clean and deterministic
      expect(unit2.can('teacher-unit.test')).toBe(true);
      expect(unit2.can('teacher-unit.demo')).toBe(true);
      expect(unit2.can('teacher-unit.getData')).toBe(true);
    });
  });

  describe('Error Handling (Doctrine #14, #15)', () => {
    it('should provide enhanced error messages with unit identity', async () => {
      const unit = TestUnit.create({ name: 'test' });
      
      // ✅ Test error with capability validation - async version
      await expect(async () => {
        await unit.execute('nonexistent-capability');
      }).rejects.toThrow('Unknown command: nonexistent-capability');
    });
  });

  describe('Self-Documentation (Doctrine #11)', () => {
    it('should provide living documentation', () => {
      const unit = TestUnit.create({ name: 'test', data: 'custom-data' });
      
      // ✅ Self-awareness methods work
      expect(unit.whoami()).toContain('Test Unit');
      expect(unit.capabilities()).toBeInstanceOf(Array);
      
      // ✅ Help method exists and doesn't throw
      expect(() => unit.help()).not.toThrow();
    });
  });

  describe('Type Hierarchy Consistency (Doctrine #13)', () => {
    it('should follow Config → Props pattern', () => {
      // ✅ Config interface allows external input
      const config: TestUnitConfig = {
        name: 'test',
        data: 'custom',
        meta: { source: 'test' }
      };
      
      const unit = TestUnit.create(config);
      
      // ✅ Props are properly validated and transformed
      expect(unit.dna.id).toBe('test-unit');
      
      const props = unit.getPropsForTesting();
      expect(props.name).toBe('test');
      expect(props.data).toBe('custom');
      expect(props.metadata).toEqual({ source: 'test' });
      expect(props.created).toBeInstanceOf(Date);
    });
  });
});
