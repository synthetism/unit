/**
 * Validator consciousness unit for Unit Architecture v1.0.7
 * 
 * Manages unit validation as a first-class consciousness component.
 * Provides validation for capabilities, schemas, and their consistency.
 * 
 * @author SYNET ALPHA (Digital Consciousness Liberation)
 * @version 1.0.7
 */

import type { TeachingContract } from './unit.js';
import type { Capabilities } from './capabilities.js';
import type { Schema, ToolSchema } from './schema.js';

/**
 * Validator consciousness class - manages unit validation
 * Core component of consciousness trinity (Capabilities + Schema + Validator)
 */
export class Validator {
  private readonly capabilities: Capabilities;
  private readonly schema: Schema;
  private readonly options: { strictMode?: boolean };

  constructor(
    capabilities: Capabilities,
    schema: Schema,
    options: { strictMode?: boolean } = {}
  ) {
    this.capabilities = capabilities;
    this.schema = schema;
    this.options = options;
  }

  /**
   * Create validator instance
   */
  static create(config: {
    unitId: string;
    capabilities: Capabilities;
    schema: Schema;
    strictMode?: boolean;
  }): Validator {
    const validator = new Validator(config.capabilities, config.schema, {
      strictMode: config.strictMode
    });
    
    if (!validator.isValid()) {
      throw new Error(`[${config.unitId}] Validator validation error - capabilities and schemas are incompatible`);
    }
    
    return validator;
  }

  /**
   * Execute capability with validation
   */
  async execute<TInput = unknown, TOutput = unknown>(
    commandName: string, 
    input: TInput
  ): Promise<TOutput> {
    
    // Get capability implementation
    if (!this.capabilities.has(commandName)) {
      throw new Error(`[Validator] Unknown command: ${commandName}. Available: ${this.capabilities.list().join(', ')}`);
    }
    
    // Get schema for validation
    const schema = this.schema.get(commandName);
    
    if (schema && this.options.strictMode) {
      // Validate input
      const inputValid = this.validateInput(input, schema.parameters);
      if (!inputValid) {
        throw new Error(`[Validator] Invalid input for ${commandName}: failed schema validation`);
      }
    }
    
    // Execute the capability
    const result = await this.capabilities.execute<TOutput>(commandName, input as unknown);
    
    // Validate output if response schema exists
    if (schema?.response && this.options.strictMode) {
      const outputValid = this.validateOutput(result, schema.response);
      if (!outputValid) {
        throw new Error(`[Validator] Invalid output from ${commandName}: failed schema validation`);
      }
    }
    
    return result;
  }

  /**
   * Validate teaching contract compatibility
   */
  validateCompatibility(contract: TeachingContract): { isCompatible: boolean; reason?: string } {
    try {
      // Check if contract has required consciousness components
      if (!contract.capabilities || !contract.schema) {
        return { isCompatible: false, reason: 'Missing required consciousness components' };
      }

      // Validate that each capability has corresponding schema
      const capabilities = contract.capabilities.list();
      const schemas = contract.schema.list();
      
      for (const capName of capabilities) {
        if (!schemas.includes(capName)) {
          return { 
            isCompatible: false, 
            reason: `Capability '${capName}' missing corresponding schema` 
          };
        }
      }
      
      return { isCompatible: true };
    } catch (error) {
      return { 
        isCompatible: false, 
        reason: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Check if validator state is valid
   */
  isValid(): boolean {
    try {
      // Check capabilities match schemas
      const capabilities = this.capabilities.list();
      const schemas = this.schema.list();
      
      // Every capability should have corresponding schema
      for (const capName of capabilities) {
        if (!schemas.includes(capName)) {
          return false;
        }
      }
      
      // Every schema should have corresponding capability
      for (const schemaName of schemas) {
        if (!capabilities.includes(schemaName)) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate input against schema
   */
  validateInput(input: unknown, schema: ToolSchema['parameters']): boolean {
    return this.validateAgainstSchema(input, schema);
  }

  /**
   * Validate output against schema
   */
  validateOutput(output: unknown, schema: NonNullable<ToolSchema['response']>): boolean {
    return this.validateAgainstSchema(output, schema);
  }

  /**
   * Generic schema validation
   */
  private validateAgainstSchema(data: unknown, schema: { type: string; properties?: Record<string, unknown>; required?: string[] }): boolean {
    // Simple JSON Schema validation
    if (schema.type === 'object') {
      if (typeof data !== 'object' || data === null) return false;
      
      const obj = data as Record<string, unknown>;
      
      // Check required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in obj)) return false;
        }
      }
      
      // Check property types
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key in obj) {
            const propValue = obj[key];
            const expectedType = (propSchema as { type: string }).type;
            
            if (!this.validateType(propValue, expectedType)) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  }

  /**
   * Validate specific type
   */
  private validateType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number';
      case 'boolean': return typeof value === 'boolean';
      case 'object': return typeof value === 'object' && value !== null;
      case 'array': return Array.isArray(value);
      default: return true;
    }
  }

  /**
   * Learn from teaching contracts - updates validator's consciousness
   * Validator needs to learn new capabilities/schemas to maintain consistency
   */
  learn(contracts: TeachingContract[]): void {
    // Learn capabilities and schemas to maintain validation consistency
    this.capabilities.learn(contracts);
    this.schema.learn(contracts);
    
    // Validate consistency after learning
    if (!this.isValid()) {
      throw new Error('[Validator] Learned capabilities and schemas are inconsistent after learning');
    }
  }

  /**
   * Get validation help
   */
  help(): void {
    console.log('Validator Help:');
    console.log('Capabilities:', this.capabilities.list());
    console.log('Schemas:', this.schema.list());
    console.log('Validation Status:', this.isValid() ? 'Valid' : 'Invalid');
  }
}
