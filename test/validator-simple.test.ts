import { describe, it, expect, beforeEach } from 'vitest';
import { Validator } from '../src/validator.js';
import { Capabilities } from '../src/capabilities.js';
import { Schema } from '../src/schema.js';

describe('Validator v1.0.7 - Simple Tests', () => {
  let validator: Validator;
  let capabilities: Capabilities;
  let schema: Schema;
  const unitId = 'test-unit';

  beforeEach(() => {
    capabilities = Capabilities.create(unitId, {
      add: (...args: unknown[]) => {
        const input = args[0] as { a: number; b: number };
        return input.a + input.b;
      },
      greet: (...args: unknown[]) => {
        const input = args[0] as { name: string };
        return `Hello, ${input.name}!`;
      }
      // Note: removed 'process' to match schemas exactly
    });

    schema = Schema.create(unitId, {
      add: {
        name: 'add',
        description: 'Add two numbers',
        parameters: {
          type: 'object',
          properties: {
            a: { type: 'number', description: 'First number' },
            b: { type: 'number', description: 'Second number' }
          },
          required: ['a', 'b']
        }
      },
      greet: {
        name: 'greet',
        description: 'Greet someone',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name to greet' }
          },
          required: ['name']
        }
      }
      // Exact match: every capability has a schema, every schema has a capability
    });

    validator = Validator.create({
      unitId,
      capabilities,
      schema,
      strictMode: false
    });
  });

  describe('Basic Functionality', () => {
    it('should create validator successfully', () => {
      expect(validator).toBeInstanceOf(Validator);
      expect(validator.isValid()).toBe(true);
    });

    it('should validate input correctly', () => {
      const addSchema = schema.get('add')!;
      
      // Valid input
      expect(validator.validateInput({ a: 5, b: 3 }, addSchema.parameters)).toBe(true);
      
      // Invalid input - missing required field
      expect(validator.validateInput({ a: 5 }, addSchema.parameters)).toBe(false);
      
      // Invalid input - wrong type
      expect(validator.validateInput({ a: 'five', b: 3 }, addSchema.parameters)).toBe(false);
    });

    it('should execute capabilities', async () => {
      const result = await validator.execute('add', { a: 5, b: 3 });
      expect(result).toBe(8);
    });

    it('should handle unknown capabilities', async () => {
      await expect(validator.execute('unknown', {})).rejects.toThrow(/Unknown command/);
    });

    it('should validate in strict mode', async () => {
      const strictValidator = Validator.create({
        unitId,
        capabilities,
        schema,
        strictMode: true
      });

      // Valid input should work
      const result = await strictValidator.execute('add', { a: 10, b: 5 });
      expect(result).toBe(15);

      // Invalid input should throw
      await expect(strictValidator.execute('add', { a: 'invalid', b: 5 }))
        .rejects.toThrow(/Invalid input/);
    });

    it('should provide help', () => {
      expect(() => validator.help()).not.toThrow();
    });

    it('should handle learning contracts', () => {
      const newCapabilities = Capabilities.create('new-unit', {
        test: (...args: unknown[]) => {
          const input = args[0] as { input: string };
          return `test: ${input.input}`;
        }
      });

      const newSchema = Schema.create('new-unit', {
        test: {
          name: 'test',
          description: 'Test method',
          parameters: {
            type: 'object',
            properties: {
              input: { type: 'string', description: 'Test input' }
            }
          }
        }
      });

      const contract = {
        unitId: 'new-unit',
        capabilities: newCapabilities,
        schema: newSchema,
        validator: validator
      };

      validator.learn([contract]);
      
      expect(capabilities.has('new-unit.test')).toBe(true);
      expect(schema.has('new-unit.test')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined input validation', () => {
      const addSchema = schema.get('add')!;
      
      expect(validator.validateInput(null, addSchema.parameters)).toBe(false);
      expect(validator.validateInput(undefined, addSchema.parameters)).toBe(false);
      expect(validator.validateInput('not-object', addSchema.parameters)).toBe(false);
    });

    it('should validate basic types correctly', () => {
      const stringSchema = {
        type: 'object' as const,
        properties: {
          text: { type: 'string' as const, description: 'Text field' }
        },
        required: ['text']
      };

      expect(validator.validateInput({ text: 'hello' }, stringSchema)).toBe(true);
      expect(validator.validateInput({ text: 123 }, stringSchema)).toBe(false);

      const numberSchema = {
        type: 'object' as const,
        properties: {
          value: { type: 'number' as const, description: 'Number field' }
        },
        required: ['value']
      };

      expect(validator.validateInput({ value: 42 }, numberSchema)).toBe(true);
      expect(validator.validateInput({ value: '42' }, numberSchema)).toBe(false);

      const booleanSchema = {
        type: 'object' as const,
        properties: {
          flag: { type: 'boolean' as const, description: 'Boolean field' }
        },
        required: ['flag']
      };

      expect(validator.validateInput({ flag: true }, booleanSchema)).toBe(true);
      expect(validator.validateInput({ flag: 'true' }, booleanSchema)).toBe(false);

      const arraySchema = {
        type: 'object' as const,
        properties: {
          items: { type: 'array' as const, description: 'Array field' }
        },
        required: ['items']
      };

      expect(validator.validateInput({ items: [] }, arraySchema)).toBe(true);
      expect(validator.validateInput({ items: 'not-array' }, arraySchema)).toBe(false);

      const objectSchema = {
        type: 'object' as const,
        properties: {
          data: { type: 'object' as const, description: 'Object field' }
        },
        required: ['data']
      };

      expect(validator.validateInput({ data: {} }, objectSchema)).toBe(true);
      expect(validator.validateInput({ data: null }, objectSchema)).toBe(false);
    });

    it('should handle output validation', () => {
      const responseSchema = {
        type: 'object' as const,
        properties: {
          result: { type: 'number', description: 'Result' },
          status: { type: 'string', description: 'Status' }
        },
        required: ['result']
      };

      expect(validator.validateOutput({ result: 42, status: 'ok' }, responseSchema)).toBe(true);
      expect(validator.validateOutput({ status: 'ok' }, responseSchema)).toBe(false); // missing result
      expect(validator.validateOutput({ result: 'not-number' }, responseSchema)).toBe(false); // wrong type
    });

    it('should handle empty schemas', () => {
      const emptySchema = {
        type: 'object' as const,
        properties: {},
        required: []
      };

      expect(validator.validateInput({}, emptySchema)).toBe(true);
      expect(validator.validateInput({ extra: 'field' }, emptySchema)).toBe(true);
    });

    it('should handle optional fields', () => {
      const optionalSchema = {
        type: 'object' as const,
        properties: {
          optional: { type: 'string' as const, description: 'Optional field' }
        }
        // No required fields
      };

      expect(validator.validateInput({}, optionalSchema)).toBe(true);
      expect(validator.validateInput({ optional: 'value' }, optionalSchema)).toBe(true);
      expect(validator.validateInput({ optional: 123 }, optionalSchema)).toBe(false); // wrong type
    });
  });

  describe('Performance', () => {
    it('should handle many validations efficiently', () => {
      const start = performance.now();
      
      // Perform many validations
      for (let i = 0; i < 1000; i++) {
        const addSchema = schema.get('add')!;
        validator.validateInput({ a: i, b: i + 1 }, addSchema.parameters);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should be fast
    });
  });
});
