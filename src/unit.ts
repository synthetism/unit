/**
 * Unit Architecture Interface for @synet/unit
 * 
 * This is the foundational interface that defines what a Unit is.
 * All units in the Synet ecosystem should implement this interface.
 * 
 * Key principles:
 * - Units are living beings in code
 * - They have DNA (schema) and can execute commands
 * - They're discoverable and self-documenting
 * - Minimal interface, maximum flexibility
 * - Immutable props through ValueObject pattern
 * - Controlled creation through static factory methods
 * 
 * @author 0en
 * @license [MIT](https://github.com/synthetism/synet/blob/main/LICENSE)
 */

/**
 * Unit schema interface - the DNA of a unit
 * DNA represents the unit's immutable identity and design purpose
 */
export interface UnitSchema {
  /** Unit name */
  readonly name: string;
  /** Unit version */
  readonly version: string;
  /** Base commands this unit was designed for (immutable identity) */
  readonly baseCommands: readonly string[];
  /** Optional description for context */
  readonly description?: string;
}

/**
 * Core Unit interface - all units must implement this
 * 
 * Units are self-validating and carry their creation status.
 * They use dynamic capabilities instead of fixed commands.
 * Invalid units can still exist but report their failure state.
 */
export interface Unit {
  /** Unit DNA/schema */
  readonly dna: UnitSchema;
  
  /** Whether this unit was created successfully */
  readonly created: boolean;
  
  /** Error message if creation failed */
  readonly error?: string;
  
  /** Stack trace or additional error details */
  readonly stack?: string[];
  
  /** Get unit identity as string */
  whoami(): string;
  
  /** Check if unit can execute a command (checks dynamic capabilities) */
  capableOf(command: string): boolean;
  
  /** Show help - flexible implementation */
  help(): void;
  
  /** Get detailed explanation of current state */
  explain?(): string;
  
  /** Execute a command (uses dynamic capabilities) */
  execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R>;
  
  /** Share capabilities with other units */
  teach(): Record<string, (...args: unknown[]) => unknown>;
  
  /** Absorb capabilities from other units (dynamic learning) */
  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void;
  
  /** Create evolved unit with new capabilities */
  evolve(name: string, additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>): Unit;
}

/**
 * Unit creation result - handles success/failure of unit creation
 */
export type UnitResult<T extends Unit> = T | null;

/**
 * Unit factory interface - all unit classes should implement this
 */
export interface UnitFactory<T extends Unit> {
  /** 
   * Create a new unit instance with validation
   * Returns null if creation fails, forcing error handling upfront
   */
  create(...args: unknown[]): UnitResult<T>;
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
 * This is the recommended pattern based on our evolution in demos
 */
export abstract class BaseUnit implements Unit {
  protected _dna: UnitSchema;
  protected _capabilities = new Map<string, (...args: unknown[]) => unknown>();
  protected _created = true;
  protected _error?: string;
  protected _stack?: string[];

  constructor(schema: UnitSchema) {
    this._dna = { ...schema, baseCommands: [...schema.baseCommands] };
  }

  get dna(): UnitSchema {
    return this._dna;
  }

  get created(): boolean {
    return this._created;
  }

  get error(): string | undefined {
    return this._error;
  }

  get stack(): string[] | undefined {
    return this._stack;
  }

  abstract whoami(): string;

  capableOf(command: string): boolean {
    return this._capabilities.has(command);
  }

  abstract help(): void;

  /**
   * Get current runtime capabilities (what the unit can actually do now)
   */
  getCapabilities(): string[] {
    return Array.from(this._capabilities.keys());
  }

  explain?(): string;

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    const impl = this._capabilities.get(commandName);
    if (!impl) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    return impl(...args) as R;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    const capabilities: Record<string, (...args: unknown[]) => unknown> = {};
    for (const [name, impl] of this._capabilities.entries()) {
      capabilities[name] = impl;
    }
    return capabilities;
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    for (const capSet of capabilities) {
      for (const [cap, impl] of Object.entries(capSet)) {
        this._capabilities.set(cap, impl);
      }
    }
  }

  evolve(name: string, additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>): Unit {
    // Default implementation - can be overridden
    return this;
  }

  /**
   * Protected method to mark unit as failed during creation
   */
  protected _markFailed(error: string, stack?: string[]): void {
    this._created = false;
    this._error = error;
    this._stack = stack;
  }

  /**
   * Protected method to add capabilities
   */
  protected _addCapability(name: string, implementation: (...args: unknown[]) => unknown): void {
    this._capabilities.set(name, implementation);
  }

  /**
   * Protected method to get all current capabilities
   */
  protected _getAllCapabilities(): string[] {
    return Array.from(this._capabilities.keys());
  }
}

/**
 * Utility function to create a unit schema
 */
export function createUnitSchema(config: {
  name: string;
  version: string;
  baseCommands: string[];
  description?: string;
}): UnitSchema {
  return Object.freeze({
    name: config.name,
    version: config.version,
    baseCommands: Object.freeze([...config.baseCommands]),
    description: config.description,
  });
}

/**
 * Utility function to validate unit schema
 */
export function validateUnitSchema(schema: UnitSchema): boolean {
  try {
    return !!(
      schema &&
      typeof schema === 'object' &&
      schema.name && 
      typeof schema.name === 'string' &&
      schema.name.trim() !== '' &&
      schema.version && 
      typeof schema.version === 'string' &&
      schema.version.trim() !== '' &&
      Array.isArray(schema.baseCommands) &&
      schema.baseCommands.length > 0 &&
      schema.baseCommands.every((cmd: string) => typeof cmd === 'string')
    );
  } catch {
    return false;
  }
}
