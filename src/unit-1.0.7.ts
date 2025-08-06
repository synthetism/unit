/**
 * Unit Architecture Interface for @synet/unit v1.0.6
 *
 * 
 * @author 0en
 * @version 1.0.6
 * @license [MIT](https://github.com/synthetism/synet/blob/main/LICENSE)
 */

/**
 * Unit metadata interface - extensible metadata for capability contracts
 * Units can extend this for their specific metadata needs
 */
export interface UnitMetadata {
  [x: string]: unknown;
}

/**
 * Tool Schema interface - defines parameter structure for tool calling
 * NEW in v1.0.6 for AI-first Unit Architecture
 * NEW Prototype in 1.0.7 - Response
 */
export interface Schema {
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
  },
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
 * Unit schema interface - the DNA of a unit
 * DNA represents the unit's immutable identity and evolution lineage
 */
export interface UnitSchema {
  /** Unit ID - deterministic unit identification for capability resolution */
  readonly id: string;
  /** Unit version */
  readonly version: string;
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
 * Consciousness management interfaces (NEW in v1.0.7)
 */
export interface Capabilities {
  has(name: string): boolean;
  list(): string[];
  execute<R = unknown>(name: string, ...args: unknown[]): Promise<R>;
  toRecord(): Record<string, (...args: unknown[]) => unknown>;
}

export interface Schema {
  has(name: string): boolean;
  list(): string[];
  get(name: string): Schema | undefined;
  toRecord(): Record<string, Schema>;
}

export interface Validator {
  isValid(): boolean;
  validateCompatibility(contract: TeachingContract): { isCompatible: boolean; reason?: string };
}

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


  /** Get schema Class */
  schema(): Schema;

  /** Get all capabilities class */
  capabilities(): Capabilities;

  /** Get unit validator */
  validator(capabilities: Capabilities, schema: Schema): Validator;

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

  // Build consciousness trinity during construction
  private build(): UnitCore {
    const capabilities = this.capabilities();
    const schema = this.schema();
    const validator = this.validator(capabilities, schema);
    return { capabilities, schema, validator };
  }

  // Abstract consciousness builders - MUST be implemented
  protected abstract capabilities(): Capabilities;
  protected abstract schema(): Schema;
  protected abstract validator(capabilities: Capabilities, schema: Schema): Validator;

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
      // Validate consciousness compatibility first
      const compatibility = this._unit.validator.validateCompatibility(contract);
      if (!compatibility.isCompatible) {
        throw new Error(`[${this.dna.id}] Consciousness incompatibility: ${compatibility.reason}`);
      }

      // TODO: Implement consciousness learning
      // this._unit.capabilities.learn(contract.capabilities);
      // this._unit.schema.learn(contract.schema);
    }
  }

  // TODO: Implement evolve for consciousness trinity
  evolve(
    name: string,
    additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>,
  ): Unit<T> {
    throw new Error(`[${this.dna.id}] evolve() not yet implemented for consciousness trinity`);
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
