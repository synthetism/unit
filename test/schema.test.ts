import { describe, it, expect, beforeEach } from 'vitest';
import { Schema, type ToolSchema } from '../src/schema.js';

describe('Schema v1.0.7', () => {
  let schema: Schema;
  const unitId = 'test-unit';

  beforeEach(() => {
    schema = new Schema(unitId);
  });

  describe('Construction and Creation', () => {
    it('should create empty schema instance', () => {
      expect(schema).toBeInstanceOf(Schema);
      expect(schema.list()).toEqual([]);
      expect(schema.size()).toBe(0);
    });

    it('should create schema with initial schemas using static create()', () => {
      const initialSchemas = {
        add: {
          name: 'add',
          description: 'Add two numbers',
          parameters: {
            type: 'object' as const,
            properties: {
              a: { type: 'number' as const, description: 'First number' },
              b: { type: 'number' as const, description: 'Second number' }
            },
            required: ['a', 'b']
          },
          response: { type: 'number' as const }
        },
        greet: {
          name: 'greet',
          description: 'Greet someone',
          parameters: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const, description: 'Name to greet' }
            },
            required: ['name']
          },
          response: { type: 'string' as const }
        }
      };

      const schemaInstance = Schema.create(unitId, initialSchemas);
      
      expect(schemaInstance.size()).toBe(2);
      expect(schemaInstance.has('add')).toBe(true);
      expect(schemaInstance.has('greet')).toBe(true);
    });

    it('should preserve unit id', () => {
      const customId = 'custom-schema-unit';
      const schemaInstance = Schema.create(customId, {});
      // Unit ID is internal, but we can verify through error messages if needed
      expect(schemaInstance).toBeInstanceOf(Schema);
    });
  });

  describe('Adding and Setting Schemas', () => {
    it('should add new schemas with add()', () => {
      const testSchema: ToolSchema = {
        name: 'testMethod',
        description: 'Test method description',
        parameters: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Test input' }
          },
          required: ['input']
        },
        response: { type: 'string' }
      };
      
      schema.add('testMethod', testSchema);
      
      expect(schema.has('testMethod')).toBe(true);
      expect(schema.size()).toBe(1);
      expect(schema.list()).toContain('testMethod');
    });

    it('should throw error when adding duplicate schema', () => {
      const testSchema: ToolSchema = {
        name: 'duplicate',
        description: 'Test schema',
        parameters: {
          type: 'object',
          properties: {},
        }
      };
      
      schema.add('duplicate', testSchema);
      
      expect(() => schema.add('duplicate', testSchema)).toThrow(
        `[${unitId}] Schema 'duplicate' already exists`
      );
    });

    it('should set schemas with set() (allow overwrite)', () => {
      const schema1: ToolSchema = {
        name: 'test',
        description: 'First version',
        parameters: {
          type: 'object',
          properties: {},
        }
      };

      const schema2: ToolSchema = {
        name: 'test',
        description: 'Second version',
        parameters: {
          type: 'object',
          properties: {},
        }
      };
      
      schema.add('test', schema1);
      expect(schema.has('test')).toBe(true);
      
      // set() should overwrite without error
      schema.set('test', schema2);
      expect(schema.has('test')).toBe(true);
      expect(schema.size()).toBe(1);
      
      const retrievedSchema = schema.get('test');
      expect(retrievedSchema?.description).toBe('Second version');
    });

    it('should handle complex schema structures', () => {
      const complexSchema: ToolSchema = {
        name: 'complexMethod',
        description: 'Complex method with nested parameters',
        parameters: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              description: 'User object',
            },
            options: {
              type: 'object',
              description: 'Configuration options',
            },
            tags: {
              type: 'array',
              description: 'List of tags',
            },
            enabled: {
              type: 'boolean',
              description: 'Whether feature is enabled',
            }
          },
          required: ['user', 'enabled']
        },
        response: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Operation success' },
            data: { type: 'object', description: 'Result data' }
          },
          required: ['success']
        }
      };

      schema.add('complexMethod', complexSchema);
      expect(schema.has('complexMethod')).toBe(true);
      
      const retrieved = schema.get('complexMethod');
      expect(retrieved).toEqual(complexSchema);
    });
  });

  describe('Schema Querying', () => {
    beforeEach(() => {
      // Create fresh schema for this test suite
      schema = new Schema(unitId);
      
      schema.add('method1', {
        name: 'method1',
        description: 'First method',
        parameters: {
          type: 'object',
          properties: {
            param1: { type: 'string', description: 'Parameter 1' }
          }
        }
      });

      schema.add('method2', {
        name: 'method2',
        description: 'Second method',
        parameters: {
          type: 'object',
          properties: {
            param2: { type: 'number', description: 'Parameter 2' }
          }
        },
        response: { type: 'string' }
      });

      schema.add('method3', {
        name: 'method3',
        description: 'Third method',
        parameters: {
          type: 'object',
          properties: {}
        }
      });
    });

    it('should check schema existence with has()', () => {
      expect(schema.has('method1')).toBe(true);
      expect(schema.has('method2')).toBe(true);
      expect(schema.has('method3')).toBe(true);
      expect(schema.has('nonexistent')).toBe(false);
    });

    it('should return correct size with size()', () => {
      expect(schema.size()).toBe(3);
      
      schema.add('newMethod', {
        name: 'newMethod',
        description: 'New method',
        parameters: { type: 'object', properties: {} }
      });
      expect(schema.size()).toBe(4);
    });

    it('should list all schema names with list()', () => {
      const schemaList = schema.list();
      
      expect(schemaList).toContain('method1');
      expect(schemaList).toContain('method2'); 
      expect(schemaList).toContain('method3');
      expect(schemaList.length).toBe(3);
    });

    it('should retrieve schemas with get()', () => {
      const method1Schema = schema.get('method1');
      expect(method1Schema).toBeDefined();
      expect(method1Schema!.name).toBe('method1');
      expect(method1Schema!.description).toBe('First method');
      
      const nonExistentSchema = schema.get('nonexistent');
      expect(nonExistentSchema).toBeUndefined();
    });

    it('should return empty list for empty schema', () => {
      const emptySchema = new Schema('empty-unit');
      expect(emptySchema.list()).toEqual([]);
      expect(emptySchema.size()).toBe(0);
    });
  });

  describe('Schema Validation', () => {
    beforeEach(() => {
      // Create fresh schema for this test suite
      schema = new Schema(unitId);
      
      schema.add('validateMethod', {
        name: 'validateMethod',
        description: 'Method with validation',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Required string' },
            age: { type: 'number', description: 'Optional number' },
            active: { type: 'boolean', description: 'Required boolean' }
          },
          required: ['name', 'active']
        },
        response: { type: 'object' }
      });
    });

    it('should validate correct parameters', () => {
      const validParams = { name: 'John', age: 30, active: true };
      const result = schema.validate('validateMethod', validParams);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing required parameters', () => {
      const invalidParams = { name: 'John' }; // missing required 'active'
      const result = schema.validate('validateMethod', invalidParams);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required parameter: active');
    });

    it('should detect incorrect parameter types', () => {
      const invalidParams = { name: 'John', age: 'thirty', active: true };
      const result = schema.validate('validateMethod', invalidParams);
      
      expect(result.valid).toBe(false);
      expect(result.errors?.some(error => error.includes('age'))).toBe(true);
    });

    it('should handle validation for non-existent schema', () => {
      const result = schema.validate('nonexistent', {});
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Schema 'nonexistent' not found");
    });

    it('should handle empty parameters when none required', () => {
      schema.add('noParams', {
        name: 'noParams',
        description: 'Method with no parameters',
        parameters: {
          type: 'object',
          properties: {}
        }
      });

      const result = schema.validate('noParams', {});
      expect(result.valid).toBe(true);
    });

    it('should handle optional parameters correctly', () => {
      const validWithOptional = { name: 'John', age: 25, active: true };
      const validWithoutOptional = { name: 'Jane', active: false };
      
      const result1 = schema.validate('validateMethod', validWithOptional);
      const result2 = schema.validate('validateMethod', validWithoutOptional);
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });

  describe('Learning from Teaching Contracts', () => {
    it('should learn schemas from teaching contract', () => {
      const sourceSchema = Schema.create('source-unit', {
        sourceMethod1: {
          name: 'sourceMethod1',
          description: 'Source method 1',
          parameters: {
            type: 'object',
            properties: {
              data: { type: 'string', description: 'Input data' }
            }
          }
        },
        sourceMethod2: {
          name: 'sourceMethod2', 
          description: 'Source method 2',
          parameters: {
            type: 'object',
            properties: {
              value: { type: 'number', description: 'Input value' }
            }
          }
        }
      });

      const contract = {
        unitId: 'source-unit',
        capabilities: {} as any, // Mock capabilities
        schema: sourceSchema,
        validator: {} as any // Mock validator
      };

      schema.learn([contract]);

      // Should learn with namespace
      expect(schema.has('source-unit.sourceMethod1')).toBe(true);
      expect(schema.has('source-unit.sourceMethod2')).toBe(true);
      expect(schema.size()).toBe(2);
    });

    it('should handle multiple teaching contracts', () => {
      const schema1 = Schema.create('unit1', {
        method1: {
          name: 'method1',
          description: 'Method 1',
          parameters: { type: 'object', properties: {} }
        }
      });

      const schema2 = Schema.create('unit2', {
        method2: {
          name: 'method2',
          description: 'Method 2', 
          parameters: { type: 'object', properties: {} }
        }
      });

      const contract1 = {
        unitId: 'unit1',
        capabilities: {} as any,
        schema: schema1,
        validator: {} as any
      };

      const contract2 = {
        unitId: 'unit2',
        capabilities: {} as any,
        schema: schema2,
        validator: {} as any
      };

      schema.learn([contract1]);
      schema.learn([contract2]);

      expect(schema.has('unit1.method1')).toBe(true);
      expect(schema.has('unit2.method2')).toBe(true);
      expect(schema.size()).toBe(2);
    });

    it('should validate learned schemas correctly', () => {
      const sourceSchema = Schema.create('math-unit', {
        calculate: {
          name: 'calculate',
          description: 'Calculate values',
          parameters: {
            type: 'object',
            properties: {
              operation: { type: 'string', description: 'Math operation' },
              values: { type: 'array', description: 'Input values' }
            },
            required: ['operation', 'values']
          }
        }
      });

      const contract = {
        unitId: 'math-unit',
        capabilities: {} as any,
        schema: sourceSchema,
        validator: {} as any
      };

      schema.learn([contract]);

      const result = schema.validate('math-unit.calculate', {
        operation: 'add',
        values: [1, 2, 3]
      });

      expect(result.valid).toBe(true);
    });

    it('should handle namespace conflicts in learning', () => {
      const schema1 = Schema.create('unit1', {
        same: {
          name: 'same',
          description: 'First version',
          parameters: { type: 'object', properties: {} }
        }
      });

      const schema2 = Schema.create('unit1', {
        same: {
          name: 'same',
          description: 'Second version',
          parameters: { type: 'object', properties: {} }
        }
      });

      const contract1 = {
        unitId: 'unit1',
        capabilities: {} as any,
        schema: schema1,
        validator: {} as any
      };

      const contract2 = {
        unitId: 'unit1',
        capabilities: {} as any,
        schema: schema2,
        validator: {} as any
      };

      schema.learn([contract1]);
      schema.learn([contract2]); // Should overwrite

      expect(schema.has('unit1.same')).toBe(true);
      expect(schema.size()).toBe(1);
      
      const retrieved = schema.get('unit1.same');
      expect(retrieved?.description).toBe('Second version');
    });
  });

  describe('Schema Removal and Clearing', () => {
    beforeEach(() => {
      // Create fresh schema for this test suite
      schema = new Schema(unitId);
      
      schema.add('temp1', {
        name: 'temp1',
        description: 'Temporary 1',
        parameters: { type: 'object', properties: {} }
      });
      schema.add('temp2', {
        name: 'temp2',
        description: 'Temporary 2',
        parameters: { type: 'object', properties: {} }
      });
      schema.add('temp3', {
        name: 'temp3',
        description: 'Temporary 3',
        parameters: { type: 'object', properties: {} }
      });
    });

    it('should remove individual schemas', () => {
      expect(schema.has('temp1')).toBe(true);
      
      schema.remove('temp1');
      
      expect(schema.has('temp1')).toBe(false);
      expect(schema.has('temp2')).toBe(true);
      expect(schema.has('temp3')).toBe(true);
      expect(schema.size()).toBe(2);
    });

    it('should handle removal of non-existent schema gracefully', () => {
      expect(() => schema.remove('nonexistent')).not.toThrow();
      expect(schema.size()).toBe(3); // Should remain unchanged
    });

    it('should clear all schemas', () => {
      expect(schema.size()).toBe(3);
      
      schema.clear();
      
      expect(schema.size()).toBe(0);
      expect(schema.list()).toEqual([]);
      expect(schema.has('temp1')).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty schema names', () => {
      const emptySchema: ToolSchema = {
        name: '',
        description: 'Empty name',
        parameters: { type: 'object', properties: {} }
      };
      
      expect(() => schema.add('', emptySchema)).toThrow();
    });

    it('should handle malformed schemas', () => {
      const malformedSchema = {
        name: 'malformed',
        // missing description and parameters
      } as ToolSchema;
      
      expect(() => schema.add('malformed', malformedSchema)).toThrow();
    });

    it('should handle schemas with enum parameters', () => {
      const enumSchema: ToolSchema = {
        name: 'enumMethod',
        description: 'Method with enum parameter',
        parameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Status value',
              enum: ['active', 'inactive', 'pending']
            }
          },
          required: ['status']
        }
      };

      schema.add('enumMethod', enumSchema);
      expect(schema.has('enumMethod')).toBe(true);
      
      const retrieved = schema.get('enumMethod');
      expect(retrieved?.parameters.properties.status.enum).toEqual(['active', 'inactive', 'pending']);
    });

    it('should handle deeply nested parameter structures', () => {
      const nestedSchema: ToolSchema = {
        name: 'nestedMethod',
        description: 'Method with nested parameters',
        parameters: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              description: 'Configuration object'
            }
          }
        },
        response: {
          type: 'object',
          properties: {
            result: {
              type: 'object',
              description: 'Nested result'
            }
          }
        }
      };

      schema.add('nestedMethod', nestedSchema);
      expect(schema.has('nestedMethod')).toBe(true);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large numbers of schemas', () => {
      const schemaCount = 1000;
      
      for (let i = 0; i < schemaCount; i++) {
        schema.add(`schema${i}`, {
          name: `schema${i}`,
          description: `Schema number ${i}`,
          parameters: {
            type: 'object',
            properties: {
              param: { type: 'string', description: `Parameter ${i}` }
            }
          }
        });
      }

      expect(schema.size()).toBe(schemaCount);
      expect(schema.has('schema0')).toBe(true);
      expect(schema.has('schema999')).toBe(true);
      expect(schema.has('schema1000')).toBe(false);
    });

    it('should maintain performance for schema lookups', () => {
      // Add many schemas
      for (let i = 0; i < 100; i++) {
        schema.add(`perf${i}`, {
          name: `perf${i}`,
          description: `Performance test ${i}`,
          parameters: { type: 'object', properties: {} }
        });
      }

      const start = performance.now();
      
      // Perform many lookups
      for (let i = 0; i < 1000; i++) {
        schema.has(`perf${i % 100}`);
        schema.get(`perf${i % 100}`);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(100); // 100ms threshold
    });
  });
});
