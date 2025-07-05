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
 * 
 * @author 0en
 * @license [MIT](https://github.com/synthetism/synet/blob/main/LICENSE)
 */

/**
 * Unit schema interface - the DNA of a unit
 */
export interface UnitSchema {
  /** Unit name */
  name: string;
  /** Unit version */
  version: string;
  /** Commands this unit can execute */
  commands: string[];
  /** Optional description for context */
  description?: string;
}

/**
 * Core Unit interface - all units must implement this
 * 
 * Units that exist are always valid. Invalid units return null from create().
 * This forces developers to handle errors upfront and prevents runtime surprises.
 */
export interface Unit {
  /** Unit DNA/schema */
  readonly dna: UnitSchema;
  
  /** Get unit identity as string */
  whoami(): string;
  
  /** Check if unit can execute a command */
  capableOf(command: string): boolean;
  
  /** Show help - flexible implementation */
  help(): void;
  
  /** Get detailed explanation of current state */
  explain?(): string;
  
  /** Execute a command (optional - only if unit exposes external commands) */
  execute?<R = unknown>(commandName: string, ...args: unknown[]): Promise<R>;
  
  /** Share capabilities with other units */
  teach?(): Record<string, (...args: unknown[]) => unknown>;
  
  /** Absorb capabilities from other units */
  learn?(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void;
  
  /** Create evolved unit with new capabilities */
  evolve?(name: string, additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>): Unit;
}

/**
 * Base ValueObject implementation for units
 * This provides a simple ValueObject pattern without external dependencies
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
   * Get a copy of the props
   */
  protected getProps(): T {
    return { ...this.props };
  }
}

/**
 * Utility function to create a unit schema
 */
export function createUnitSchema(config: {
  name: string;
  version: string;
  commands: string[];
  description?: string;
}): UnitSchema {
  return {
    name: config.name,
    version: config.version,
    commands: config.commands,
    description: config.description,
  };
}
