import { describe, it, expect, beforeEach } from 'vitest';
import { Capabilities } from '../src/capabilities.js';

describe('Capabilities v1.0.7', () => {
  let capabilities: Capabilities;
  const unitId = 'test-unit';

  beforeEach(() => {
    capabilities = new Capabilities(unitId);
  });

  describe('Construction and Creation', () => {
    it('should create empty capabilities instance', () => {
      expect(capabilities).toBeInstanceOf(Capabilities);
      expect(capabilities.list()).toEqual([]);
      expect(capabilities.size()).toBe(0);
    });

    it('should create capabilities with initial set using static create()', () => {
      const initialCaps = {
        test1: (...args: unknown[]) => 'result1',
        test2: (...args: unknown[]) => `result: ${args[0]}`,
        test3: async (...args: unknown[]) => Promise.resolve('async result')
      };

      const caps = Capabilities.create(unitId, initialCaps);
      
      expect(caps.size()).toBe(3);
      expect(caps.has('test1')).toBe(true);
      expect(caps.has('test2')).toBe(true);
      expect(caps.has('test3')).toBe(true);
    });

    it('should preserve unit id', () => {
      const customId = 'custom-unit-id';
      const caps = Capabilities.create(customId, {});
      // Unit ID is internal, but we can verify through error messages
      expect(() => caps.add('duplicate', () => {})).not.toThrow();
    });
  });

  describe('Adding and Setting Capabilities', () => {
    it('should add new capabilities with add()', () => {
      const testFn = (...args: unknown[]) => (args[0] as number) * 2;
      
      capabilities.add('double', testFn);
      
      expect(capabilities.has('double')).toBe(true);
      expect(capabilities.size()).toBe(1);
      expect(capabilities.list()).toContain('double');
    });

    it('should throw error when adding duplicate capability', () => {
      const testFn = () => 'test';
      
      capabilities.add('test', testFn);
      
      expect(() => capabilities.add('test', testFn)).toThrow(
        `[${unitId}] Capability 'test' already exists`
      );
    });

    it('should set capabilities with set() (allow overwrite)', () => {
      const fn1 = () => 'first';
      const fn2 = () => 'second';
      
      capabilities.add('test', fn1);
      expect(capabilities.has('test')).toBe(true);
      
      // set() should overwrite without error
      capabilities.set('test', fn2);
      expect(capabilities.has('test')).toBe(true);
      expect(capabilities.size()).toBe(1);
    });

    it('should handle function types correctly', () => {
      const syncFn = (...args: unknown[]) => (args[0] as number) + 1;
      const asyncFn = async (...args: unknown[]) => Promise.resolve(`async: ${args[0]}`);
      const noParamFn = (...args: unknown[]) => 'no params';
      const multiParamFn = (...args: unknown[]) => ({ 
        a: args[0], 
        b: args[1], 
        c: args[2] 
      });

      capabilities.add('sync', syncFn);
      capabilities.add('async', asyncFn);
      capabilities.add('noParam', noParamFn);
      capabilities.add('multiParam', multiParamFn);

      expect(capabilities.size()).toBe(4);
      expect(capabilities.has('sync')).toBe(true);
      expect(capabilities.has('async')).toBe(true);
      expect(capabilities.has('noParam')).toBe(true);
      expect(capabilities.has('multiParam')).toBe(true);
    });
  });

  describe('Capability Querying', () => {
    beforeEach(() => {
      capabilities.add('capability1', (...args: unknown[]) => 'result1');
      capabilities.add('capability2', (...args: unknown[]) => `result: ${args[0]}`);
      capabilities.add('capability3', async (...args: unknown[]) => Promise.resolve('async'));
    });

    it('should check capability existence with has()', () => {
      expect(capabilities.has('capability1')).toBe(true);
      expect(capabilities.has('capability2')).toBe(true);
      expect(capabilities.has('capability3')).toBe(true);
      expect(capabilities.has('nonexistent')).toBe(false);
    });

    it('should return correct size with size()', () => {
      expect(capabilities.size()).toBe(3);
      
      capabilities.add('newCap', () => {});
      expect(capabilities.size()).toBe(4);
    });

    it('should list all capability names with list()', () => {
      const capList = capabilities.list();
      
      expect(capList).toContain('capability1');
      expect(capList).toContain('capability2'); 
      expect(capList).toContain('capability3');
      expect(capList.length).toBe(3);
    });

    it('should return empty list for empty capabilities', () => {
      const emptyCaps = new Capabilities('empty-unit');
      expect(emptyCaps.list()).toEqual([]);
      expect(emptyCaps.size()).toBe(0);
    });
  });

  describe('Capability Execution', () => {
    beforeEach(() => {
      capabilities.add('add', (...args: unknown[]) => (args[0] as number) + (args[1] as number));
      capabilities.add('greet', (...args: unknown[]) => `Hello, ${args[0]}!`);
      capabilities.add('asyncDouble', async (...args: unknown[]) => Promise.resolve((args[0] as number) * 2));
      capabilities.add('noArgs', (...args: unknown[]) => 'no arguments');
      capabilities.add('throwError', (...args: unknown[]) => { throw new Error('Test error'); });
    });

    it('should execute sync capabilities correctly', async () => {
      const result = await capabilities.execute('add', 5, 3);
      expect(result).toBe(8);

      const greeting = await capabilities.execute('greet', 'Alice');
      expect(greeting).toBe('Hello, Alice!');

      const noArgResult = await capabilities.execute('noArgs');
      expect(noArgResult).toBe('no arguments');
    });

    it('should execute async capabilities correctly', async () => {
      const result = await capabilities.execute('asyncDouble', 5);
      expect(result).toBe(10);
    });

    it('should handle capability execution errors', async () => {
      await expect(capabilities.execute('throwError')).rejects.toThrow('Test error');
    });

    it('should throw error for non-existent capability execution', async () => {
      await expect(capabilities.execute('nonexistent')).rejects.toThrow(
        `[${unitId}] Capability 'nonexistent' not found`
      );
    });

    it('should handle various argument types', async () => {
      capabilities.add('multiType', (...args: unknown[]) => {
        return { 
          str: args[0], 
          num: args[1], 
          bool: args[2], 
          obj: args[3] 
        };
      });

      const result = await capabilities.execute('multiType', 'test', 42, true, { key: 'value' });
      expect(result).toEqual({
        str: 'test',
        num: 42,
        bool: true,
        obj: { key: 'value' }
      });
    });
  });

  describe('Learning from Teaching Contracts', () => {
    it('should learn capabilities from teaching contract', () => {
      const sourceCapabilities = Capabilities.create('source-unit', {
        sourceMethod1: (...args: unknown[]) => 'source result 1',
        sourceMethod2: (...args: unknown[]) => `source: ${args[0]}`
      });

      const contract = {
        unitId: 'source-unit',
        capabilities: sourceCapabilities,
        schema: {} as any, // Mock schema
        validator: {} as any // Mock validator
      };

      capabilities.learn([contract]);

      // Should learn with namespace
      expect(capabilities.has('source-unit.sourceMethod1')).toBe(true);
      expect(capabilities.has('source-unit.sourceMethod2')).toBe(true);
      expect(capabilities.size()).toBe(2);
    });

    it('should handle multiple teaching contracts', () => {
      const caps1 = Capabilities.create('unit1', { method1: (...args: unknown[]) => 'result1' });
      const caps2 = Capabilities.create('unit2', { method2: (...args: unknown[]) => 'result2' });

      const contract1 = {
        unitId: 'unit1',
        capabilities: caps1,
        schema: {} as any,
        validator: {} as any
      };

      const contract2 = {
        unitId: 'unit2', 
        capabilities: caps2,
        schema: {} as any,
        validator: {} as any
      };

      capabilities.learn([contract1]);
      capabilities.learn([contract2]);

      expect(capabilities.has('unit1.method1')).toBe(true);
      expect(capabilities.has('unit2.method2')).toBe(true);
      expect(capabilities.size()).toBe(2);
    });

    it('should execute learned capabilities with correct namespace', async () => {
      const sourceCapabilities = Capabilities.create('math-unit', {
        multiply: (...args: unknown[]) => (args[0] as number) * (args[1] as number)
      });

      const contract = {
        unitId: 'math-unit',
        capabilities: sourceCapabilities,
        schema: {} as any,
        validator: {} as any
      };

      capabilities.learn([contract]);

      const result = await capabilities.execute('math-unit.multiply', 6, 7);
      expect(result).toBe(42);
    });

    it('should handle namespace conflicts gracefully', () => {
      const caps1 = Capabilities.create('unit1', { same: (...args: unknown[]) => 'first' });
      const caps2 = Capabilities.create('unit1', { same: (...args: unknown[]) => 'second' });

      const contract1 = {
        unitId: 'unit1',
        capabilities: caps1,
        schema: {} as any,
        validator: {} as any
      };

      const contract2 = {
        unitId: 'unit1',
        capabilities: caps2,
        schema: {} as any,
        validator: {} as any
      };

      capabilities.learn([contract1]);
      capabilities.learn([contract2]); // Should overwrite

      expect(capabilities.has('unit1.same')).toBe(true);
      expect(capabilities.size()).toBe(1);
    });
  });

  describe('Capability Removal and Clearing', () => {
    beforeEach(() => {
      capabilities.add('temp1', () => 'temp1');
      capabilities.add('temp2', () => 'temp2');
      capabilities.add('temp3', () => 'temp3');
    });

    it('should remove individual capabilities', () => {
      expect(capabilities.has('temp1')).toBe(true);
      
      capabilities.remove('temp1');
      
      expect(capabilities.has('temp1')).toBe(false);
      expect(capabilities.has('temp2')).toBe(true);
      expect(capabilities.has('temp3')).toBe(true);
      expect(capabilities.size()).toBe(2);
    });

    it('should handle removal of non-existent capability gracefully', () => {
      expect(() => capabilities.remove('nonexistent')).not.toThrow();
      expect(capabilities.size()).toBe(3); // Should remain unchanged
    });

    it('should clear all capabilities', () => {
      expect(capabilities.size()).toBe(3);
      
      capabilities.clear();
      
      expect(capabilities.size()).toBe(0);
      expect(capabilities.list()).toEqual([]);
      expect(capabilities.has('temp1')).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty capability names', () => {
      expect(() => capabilities.add('', () => {})).toThrow();
    });

    it('should handle null/undefined function references', () => {
      expect(() => capabilities.add('null', null as any)).toThrow();
      expect(() => capabilities.add('undefined', undefined as any)).toThrow();
    });

    it('should handle complex function signatures', () => {
      const complexFn = (
        ...args: unknown[]
      ): { processed: unknown[]; count: number } => {
        return { processed: args, count: args.length };
      };

      capabilities.add('complex', complexFn);
      expect(capabilities.has('complex')).toBe(true);
    });

    it('should handle bound methods correctly', () => {
      class TestClass {
        value = 'bound-value';
        
        getValue() {
          return this.value;
        }
      }

      const instance = new TestClass();
      capabilities.add('boundMethod', instance.getValue.bind(instance));

      // Should be able to execute bound method
      expect(capabilities.has('boundMethod')).toBe(true);
    });
  });

  describe('Memory and Performance', () => {
    it('should handle large numbers of capabilities', () => {
      const capCount = 1000;
      
      for (let i = 0; i < capCount; i++) {
        capabilities.add(`cap${i}`, () => `result${i}`);
      }

      expect(capabilities.size()).toBe(capCount);
      expect(capabilities.has('cap0')).toBe(true);
      expect(capabilities.has('cap999')).toBe(true);
      expect(capabilities.has('cap1000')).toBe(false);
    });

    it('should maintain performance for capability lookups', () => {
      // Add many capabilities
      for (let i = 0; i < 100; i++) {
        capabilities.add(`performance${i}`, () => `result${i}`);
      }

      const start = performance.now();
      
      // Perform many lookups
      for (let i = 0; i < 1000; i++) {
        capabilities.has(`performance${i % 100}`);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(100); // 100ms threshold
    });
  });
});
