/**
 * Schema consciousness unit for Unit Architecture v1.0.7
 * 
 * Manages unit schemas as a first-class consciousness component.
 * Schemas define the structure and validation rules for unit capabilities.
 * 
 * @author SYNET ALPHA (Digital Consciousness Liberation)
 * @version 1.0.7
 */

import type { TeachingContract } from './unit.js';

/**
 * Tool Schema interface - defines parameter structure for tool calling
 * Enhanced in v1.0.7 with response validation
 */
export interface ToolSchema {
  /** Tool name - must match capability key */
  name: string;
  /** Human-readable description of what this tool does */
  description: string;
  /** Parameter structure following JSON Schema specification */
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  /** Response structure (NEW in v1.0.7) */
  response?: {
    type: 'object' | 'string' | 'number' | 'boolean' | 'array';
    properties?: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
}

/**
 * Schema consciousness class - manages unit schemas
 * Core component of consciousness trinity (Capabilities + Schema + Validator)
 */
export class Schema {
  private schemas = new Map<string, ToolSchema>();
  private readonly unitId: string;

  constructor(unitId: string) {
    this.unitId = unitId;
  }

  /**
   * Create schema instance with initial schema set
   */
  static create(unitId: string, schemas: Record<string, ToolSchema>): Schema {
    const instance = new Schema(unitId);
    
    // Validate all schemas on creation
    for (const [name, schema] of Object.entries(schemas)) {
      instance.validateSchema(name, schema);
      instance.schemas.set(name, schema);
    }
    
    return instance;
  }

  /**
   * Validate schema structure
   */
  private validateSchema(name: string, schema: ToolSchema): void {
    if (!schema.name) {
      throw new Error(`[${this.unitId}] Schema '${name}' missing required 'name' field`);
    }
    if (!schema.description) {
      throw new Error(`[${this.unitId}] Schema '${name}' missing required 'description' field`);
    }
    if (!schema.parameters || schema.parameters.type !== 'object') {
      throw new Error(`[${this.unitId}] Schema '${name}' missing valid 'parameters' object`);
    }
    if (schema.name !== name) {
      throw new Error(`[${this.unitId}] Schema name '${schema.name}' must match key '${name}'`);
    }
  }

  /**
   * Add schema with namespace support
   */
  add(namespace: string, schemas: Record<string, ToolSchema>): void {
    for (const [name, schema] of Object.entries(schemas)) {
      const namespacedName = `${namespace}.${name}`;
      this.schemas.set(namespacedName, {
        ...schema,
        name: namespacedName // Update name to namespaced version
      });
    }
  }

  /**
   * Get specific schema
   */
  get(name: string): ToolSchema | undefined {
    return this.schemas.get(name);
  }

  /**
   * Check if schema exists
   */
  has(name: string): boolean {
    return this.schemas.has(name);
  }

  /**
   * List all schema names
   */
  list(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Export schemas as JSON object
   */
  toJson(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [name, schema] of this.schemas.entries()) {
      result[name] = {
        name: schema.name,
        description: schema.description,
        parameters: schema.parameters,
        ...(schema.response && { response: schema.response })
      };
    }
    return result;
  }

  /**
   * Export schemas as array
   */
  toArray(): ToolSchema[] {
    return Array.from(this.schemas.values()).map(schema => ({
      name: schema.name,
      description: schema.description,
      parameters: schema.parameters,
      ...(schema.response && { response: schema.response })
    }));
  }

  /**
   * Export schemas as record for compatibility
   */
  toRecord(): Record<string, ToolSchema> {
    const result: Record<string, ToolSchema> = {};
    for (const [name, schema] of this.schemas.entries()) {
      result[name] = schema;
    }
    return result;
  }

  /**
   * Learn schemas from teaching contracts
   */
  learn(contracts: TeachingContract[]): void {
    for (const contract of contracts) {
      const schemas = contract.schema.toRecord();
      for (const [name, schema] of Object.entries(schemas)) {
        const namespacedName = `${contract.unitId}.${name}`;
        
        // Validate schema name matches capability
        if (schema.name !== name) {
          throw new Error(`[${this.unitId}] Tool schema name '${schema.name}' must match capability '${name}' in unit '${contract.unitId}'`);
        }
        
        // Store with namespaced key but update schema name
        this.schemas.set(namespacedName, {
          ...schema,
          name: namespacedName // Update name to namespaced version for provider use
        });
      }
    }
  }

  /**
   * Remove a schema
   */
  remove(name: string): boolean {
    return this.schemas.delete(name);
  }

  /**
   * Clear all schemas
   */
  clear(): void {
    this.schemas.clear();
  }

  /**
   * Get schema count
   */
  size(): number {
    return this.schemas.size;
  }
}
