/**
 * Unit Architecture Interface for @synet/unit v1.0.4
 *
 * Major improvements in v1.0.4:
 * - Teaching/Learning Contract System: Units exchange capabilities through structured contracts
 * - DNA ID System: Units now have deterministic IDs instead of names for capability resolution
 * - Namespaced Capabilities: Learned capabilities are namespaced as "unit-id.capability-name"
 * - Extensible Metadata: Generic metadata interface for capability contracts
 * - Rewrite-by-Default: Capability conflicts resolved by overwriting (intentional updates)
 * - Selective Teaching: Units can teach specific capabilities with teach(['capability1', 'capability2'])
 *
 * This is the foundational interface that defines what a Unit is.
 * All units in the Synet ecosystem should implement this interface.
 *
 * Key principles:
 * - Units are living beings in code that can teach and learn from each other
 * - They have DNA (schema) with deterministic IDs for capability resolution
 * - They exchange capabilities through structured contracts (DNA + implementation + metadata)
 * - Minimal interface, maximum flexibility through composition
 * - Simple structure of thinking, not replacement of thinking
 * - Built for rapid execution, not enterprise edge cases
 * Example usage:
 * ```typescript
 * // Create units with deterministic IDs
 * const signer = Signer.create();  // DNA: { id: 'signer', version: '1.0.0' }
 * const key = Key.create();        // DNA: { id: 'key', version: '1.0.0' }
 *
 * // Teaching and learning with contracts
 * const contracts = signer.teach(['sign', 'verify']);
 * key.learn(contracts);
 *
 * // Namespaced capability execution
 * key.execute('signer.sign', data);     // Explicit namespace
 * key.execute('publicKey');             // Native capability
 * ```
 *
 * @author 0en
 * @version 1.0.4
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

/**
 * Teaching contract interface - simplified contract between units
 * Contains unit ID and capabilities map
 */
export interface TeachingContract {
  /** ID of the unit providing these capabilities */
  unitId: string;
  /** Map of capability name to implementation */
  capabilities: Record<string, (...args: unknown[]) => unknown>;
}

/**
 * Core Unit interface - all units must implement this
 *
 * Units are self-validating and carry their creation status.
 * They use dynamic capabilities instead of fixed commands.
 * Invalid units can still exist but report their failure state.
 */
export interface IUnit {
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

  /** @deprecated Use `can` instead */

  capableOf(command: string): boolean;

  /** Check if unit can execute a command (checks dynamic capabilities) */
  can(command: string): boolean;

  /** Get all current capabilities (always available) */
  capabilities(): string[];

  /** Show help - flexible implementation */
  help(): void;

  /** Get detailed explanation of current state */
  explain?(): string;

  /** Execute a command (uses dynamic capabilities) */
  execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R>;

  /** Share capabilities with other units using teaching contracts */
  teach(): TeachingContract;

  /** Absorb capabilities from other units using teaching contracts */
  learn(contracts: TeachingContract[]): void;

  /** Create evolved unit with new capabilities */
  evolve(
    name: string,
    additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>,
  ): IUnit;
}

/**
 * Unit creation result - handles success/failure of unit creation
 */
export type UnitResult<T extends IUnit> = T | null;

/**
 * Unit factory interface - all unit classes should implement this
 */
export interface UnitFactory<T extends IUnit> {
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
 *
 * ⚠️ CRITICAL: Units must use a private constructor + static create() pattern
 * This prevents direct instantiation and ensures proper validation/lifecycle
 *
 * 📋 ERROR HANDLING STRATEGY:
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
export abstract class Unit implements IUnit {
  protected _dna: UnitSchema;
  protected _capabilities = new Map<string, (...args: unknown[]) => unknown>();
  protected _created = true;
  protected _error?: string;
  protected _stack?: string[];

  /**
   * Protected constructor - prevents direct instantiation
   *
   * Units MUST use a private constructor in their implementation
   * and provide a static create() method as the public interface.
   *
   * This ensures:
   * - Proper validation during creation
   * - Consistent lifecycle management
   * - Prevention of invalid unit states
   * - Clear architectural boundaries
   */
  protected constructor(schema: UnitSchema) {
    this._dna = { ...schema };
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

  can(command: string): boolean {
    return this._capabilities.has(command);
  }
  /** @deprecated, use can() instead */
  capableOf(command: string): boolean {
    return this._capabilities.has(command);
  }

  /**
   * Get current runtime capabilities (what the unit can actually do now)
   * Abstract method - must be implemented by each unit
   */
  abstract capabilities(): string[];

  abstract help(): void;

  explain?(): string;

  async execute<R = unknown>(
    commandName: string,
    ...args: unknown[]
  ): Promise<R> {
    const impl = this._capabilities.get(commandName);
    if (!impl) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    return impl(...args) as R;
  }

  abstract teach(): TeachingContract;

  learn(contracts: TeachingContract[]): void {
    for (const contract of contracts) {
      for (const [cap, impl] of Object.entries(contract.capabilities)) {
        // Create namespaced capability key: "unit-id.capability-name"
        const capabilityKey = `${contract.unitId}.${cap}`;

        // Store the implementation with namespace
        this._capabilities.set(capabilityKey, impl);
      }
    }
  }

  evolve(
    name: string,
    additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>,
  ): Unit {
    // Create new DNA with evolution lineage
    const newDNA: UnitSchema = {
      id: name,
      version: this._getNextVersion(),
      parent: { ...this._dna }, // Current DNA becomes parent
    };

    // Add additional capabilities if provided
    if (additionalCapabilities) {
      for (const [capName, capImpl] of Object.entries(additionalCapabilities)) {
        this._capabilities.set(capName, capImpl);
      }
    }

    // Update DNA to new evolved version
    this._dna = newDNA;

    return this;
  }

  /**
   * @deprecated Use Result<T> pattern for complex operations, throw Error for simple operations
   * 
   * This method remains for backwards compatibility with existing units.
   * 
   * For new units:
   * - Simple operations: throw new Error(message)
   * - Complex operations: return Result.fail(message) from @synet/patterns
   */
  protected _markFailed(error: string, stack?: string[]): void {
    this._created = false;
    this._error = error;
    this._stack = stack;
  }

  /**
   * @deprecated Use Result<T> pattern for complex operations, throw Error for simple operations
   * 
   * This method remains for backwards compatibility with existing units like Credential.
   * 
   * For new units:
   * - Simple operations: throw new Error(message)
   * - Complex operations: return Result.fail(message) from @synet/patterns
   */
  protected fail(error: string): null {
    this._error = error;
    this._stack = [...this._stack || [], error];
    return null;
  }

  /**
   * Protected method to add capabilities
   */
  protected _addCapability(
    name: string,
    implementation: (...args: unknown[]) => unknown,
  ): void {
    this._capabilities.set(name, implementation);
  }

  /**
   * Protected method to get all current capabilities
   */
  protected _getAllCapabilities(): string[] {
    return Array.from(this._capabilities.keys());
  }

  /**
   * Protected method to generate next version for evolution
   */
  private _getNextVersion(): string {
    const current = this._dna.version;
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
