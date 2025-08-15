/**
 * Unit Architecture Interface for @synet/unit v1.0.7
 *
 * 
 * @author 0en
 * @version 1.0.8
 * @license [MIT](https://github.com/synthetism/synet/blob/main/LICENSE)
 */

import { Capabilities } from './capabilities.js';
import { Schema, type ToolSchema } from './schema.js';
import { Validator } from './validator.js';

// Re-export consciousness classes for convenience
export { Capabilities, Schema, Validator, type ToolSchema };

/**
 * Unit metadata interface - extensible metadata for capability contracts
 * Units can extend this for their specific metadata needs
 */
export interface UnitMetadata {
  [x: string]: unknown;
}

/**
 * Unit schema interface - the DNA of a unit
 * DNA represents the unit's immutable identity and evolution lineage
 */
export interface UnitSchema {
  /** Unit ID - deterministic unit identification for capability resolution */
  readonly id: string;
  /** Unit version */
  readonly version: string;
  /** Optional human-readable description of the unit */
  readonly description?: string;
  /** Parent DNA this unit evolved from (evolution lineage) */
  readonly parent?: UnitSchema;
}

export interface UnitProps {
  dna: UnitSchema;  
  created?: Date;
  metadata?: Record<string, unknown>;
  [x: string]: unknown;
}

/**
 * Consciousness management interfaces (v1.0.7)
 */
export interface UnitCore {
  capabilities: Capabilities;
  schema: Schema;
  validator: Validator;
}

/**
 * Teaching contract interface - enhanced contract between units
 * Enhanced in v1.0.7 for consciousness trinity architecture
 */
export interface TeachingContract {
  /** ID of the unit providing these capabilities */
  unitId: string;
  /** Capabilities consciousness unit */
  capabilities: Capabilities;
  /** Schema consciousness unit */
  schema: Schema;
  /** Validator consciousness unit */
  validator: Validator;
}

/**
 * Core Unit interface - all units must implement this
 * Updated for consciousness trinity architecture v1.0.7
 */
export interface IUnit {
  /** Get unit identity as string */
  whoami(): string;

  /** Check if unit can execute a command (checks dynamic capabilities) */
  can(command: string): boolean;

  /** Get all current capabilities (consciousness delegation) */
  getCapabilities(): string[];

  /** Get capabilities consciousness unit */
  capabilities(): Capabilities;

  /** Get schema consciousness unit */
  schema(): Schema;

  /** Get validator consciousness unit */
  validator(): Validator;

  /** Show help - flexible implementation */
  help(): void;
 
  /** Execute a command (uses consciousness capabilities) */
  execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R>;

  /** Share capabilities with other units using consciousness contracts */
  teach(): TeachingContract;

  /** Absorb capabilities from other units using consciousness contracts */
  learn(contracts: TeachingContract[]): void;

  /** Create evolved unit with new capabilities */
  evolve(
    name: string,
    additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>,
  ): IUnit;

  /** Check if unit has specific schema */
  hasSchema(tool: string): boolean;

  /** Get specific tool schema */
  getSchema(tool: string): ToolSchema | undefined;
}

/**
 * Base ValueObject implementation for units
 * This provides immutable props and equality checking without external dependencies
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Value equality check
   */
  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  /**
   * Get a copy of the props (for internal use)
   */
  protected getProps(): T {
    return { ...this.props };
  }
}

/**
 * Base implementation for units using dynamic capabilities pattern
 *
 * CRITICAL: Units must use a private constructor + static create() pattern
 * This prevents direct instantiation and ensures proper validation/lifecycle
 *
 * ERROR HANDLING STRATEGY:
 * - Simple operations (CRUD, getters): Use exceptions (throw new Error)
 * - Complex operations (creation, auth): Use Result<T> pattern from @synet/patterns
 * - See error-strategy.md for detailed guidelines
 *
 * Example:
 * ```typescript
 * class MyUnit extends Unit {
 *   private constructor(data: MyData) {
 *     super(createUnitSchema({ id: 'my-unit', version: '1.0.0' }));
 *     // Setup capabilities...
 *   }
 *
 *   static create(data: MyData): MyUnit {
 *     return new MyUnit(data);
 *   }
 * }
 * ```
 */
export abstract class Unit<T extends UnitProps> extends ValueObject<T> implements IUnit {
  protected readonly _unit: UnitCore;

  /**
   * Protected constructor - prevents direct instantiation
   * Consciousness trinity built during construction
   */
  protected constructor(props: T) {    
    super(props);
    this._unit = this.build();
    
    // Validate consciousness integrity immediately
    if (!this._unit.validator.isValid()) {
      throw new Error(`[${this.dna.id}] Invalid consciousness architecture`);
    }
  }

  /**
   * Abstract method to build consciousness trinity
   * Each unit must implement this to define its consciousness components
   */
  protected abstract build(): UnitCore;

  /** Abstract methods for consciousness trinity access */
  abstract capabilities(): Capabilities;
  abstract schema(): Schema;  
  abstract validator(): Validator;

  get dna(): UnitSchema {
    return this.props.dna;
  }

  abstract whoami(): string;
  abstract help(): void;
  abstract teach(): TeachingContract;

  // Consciousness delegation methods
  can(command: string): boolean {
    return this._unit.capabilities.has(command);
  }

  getCapabilities(): string[] {
    return this._unit.capabilities.list();
  }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    return this._unit.capabilities.execute<R>(commandName, ...args);
  }

  // Learning with consciousness evolution  
  learn(contracts: TeachingContract[]): void {
    for (const contract of contracts) {

      // Learn capabilities and schemas
      this._unit.capabilities.learn([contract]);
      this._unit.schema.learn([contract]);
      this._unit.validator.learn([contract]);
    }
  }

  hasSchema(tool: string): boolean {
    return this._unit.schema.has(tool);
  }

  /**
   * Get specific tool schema
   */
  getSchema(tool: string): ToolSchema | undefined {
    return this._unit.schema.get(tool);
  }

  // Evolution with consciousness trinity
  evolve(
    name: string,
    additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>,
  ): IUnit {
    // Create new DNA with evolution lineage
    const newDNA: UnitSchema = {
      id: name,
      version: this._getNextVersion(),
      parent: { ...this.props.dna },
    };

    // Create new props with evolved DNA
    const evolvedProps: T = {
      ...this.props,
      dna: newDNA
    } as T;

    // Create new instance of same type with evolved props
    const evolved = new (this.constructor as new (props: T) => Unit<T>)(evolvedProps);

    // Learn from self (copy existing capabilities and schemas)
    const currentContract = this.teach();
    evolved.learn([currentContract]);

    // Add additional capabilities if provided
    if (additionalCapabilities) {
      // Create temporary capabilities consciousness for new capabilities
      const additionalCaps = Capabilities.create(name, additionalCapabilities);
      
      // Create minimal schema for additional capabilities (they must have schemas)
      const additionalSchemas: Record<string, ToolSchema> = {};
      for (const capName of Object.keys(additionalCapabilities)) {
        additionalSchemas[capName] = {
          name: capName,
          description: `Capability ${capName} added during evolution`,
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        };
      }
      const additionalSchemaUnit = Schema.create(name, additionalSchemas);
      
      // Create validator for additional capabilities
      const additionalValidator = Validator.create({
        unitId: name,
        capabilities: additionalCaps,
        schema: additionalSchemaUnit
      });

      // Create teaching contract for additional capabilities
      const additionalContract: TeachingContract = {
        unitId: name,
        capabilities: additionalCaps,
        schema: additionalSchemaUnit,
        validator: additionalValidator
      };

      // Learn additional capabilities
      evolved.learn([additionalContract]);
    }

    return evolved;
  }
  

  /**
   * Protected method to generate next version for evolution
   */
  private _getNextVersion(): string {
    const current = this.props.dna.version;
    // Simple version increment - can be enhanced later
    const versionParts = current.split(".");
    if (versionParts.length >= 3) {
      const patch = Number.parseInt(versionParts[2]) + 1;
      versionParts[2] = patch.toString();
      return versionParts.join(".");
    }
    return `${current}.1`;
  }
}



/**
 * Utility function to validate unit ID
 */
function validateUnitId(id: string): void {
  if (!id || id.trim() === "") throw new Error("Unit ID cannot be empty");
  if (id !== id.toLowerCase()) throw new Error("Unit ID must be lowercase");
  if (!/^[a-z][a-z0-9\-]*$/.test(id))
    throw new Error(
      "Unit ID must be alphanumeric + hyphens, starting with letter",
    );
  if (id.includes("."))
    throw new Error(
      "Unit ID cannot contain dots (breaks capability resolution)",
    );
}

/**
 * Utility function to create a unit schema
 */
export function createUnitSchema(config: {
  id: string;
  version: string;
  parent?: UnitSchema;
  description?: string;
}): UnitSchema {
  // Fail fast on fundamental mistakes
  validateUnitId(config.id);

  return Object.freeze({
    id: config.id,
    version: config.version,
    parent: config.parent ? { ...config.parent } : undefined,
  });
}

/**
 * Utility function to validate unit schema
 */
export function validateUnitSchema(schema: UnitSchema): boolean {
  try {
    return !!(
      schema &&
      typeof schema === "object" &&
      schema.id &&
      typeof schema.id === "string" &&
      schema.id.trim() !== "" &&
      !schema.id.includes(" ") &&
      schema.version &&
      typeof schema.version === "string" &&
      schema.version.trim() !== "" &&
      (schema.parent === undefined || validateUnitSchema(schema.parent))
    );
  } catch {
    return false;
  }
}
