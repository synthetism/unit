/**
 * Unit Architecture Interface for @synet/unit v1.0.5
 *
 * 
 * @author 0en
 * @version 1.0.5
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

export interface UnitProps {
  dna: UnitSchema;  
  created?: Date;
  metadata?: Record<string, unknown>;
  [x: string]: unknown;
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

  /** Get unit identity as string */
  whoami(): string;

  /** Check if unit can execute a command (checks dynamic capabilities) */
  can(command: string): boolean;

  /** @deprecated Use `can()` instead */
  capableOf(command: string): boolean;

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

  protected _capabilities = new Map<string, (...args: unknown[]) => unknown>();

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
  protected constructor(props: T) {
    
    super(props);

    
  }

  get dna(): UnitSchema {
    return this.props.dna;  // ✅ Direct props access, no hidden state
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

  /* Learn base method. Override if needed. _capabilities are mutable.
  */
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
  /*  Evolve for stateless capabilities acquisition
  */
  evolve(
  name: string,
  additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>,
): Unit<T> {
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

    // Copy existing capabilities to new instance
    for (const [capName, capImpl] of this._capabilities.entries()) {
      evolved._addCapability(capName, capImpl);
    }

    // Add additional capabilities if provided
    if (additionalCapabilities) {
      for (const [capName, capImpl] of Object.entries(additionalCapabilities)) {
        evolved._addCapability(capName, capImpl);
      }
    }

    return evolved;
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
