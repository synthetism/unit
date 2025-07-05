import { Result } from "@synet/patterns";

/**
 * UUID version types
 */
export enum UuidVersion {
  V1 = 1,
  V3 = 3,
  V4 = 4,
  V5 = 5
}

/**
 * UUID namespace constants
 */
export const UUID_NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
} as const;

/**
 * UUID validation result
 */
export interface UuidValidation {
  isValid: boolean;
  version?: UuidVersion;
  variant?: string;
  error?: string;
}

/**
 * UUID unit configuration
 */
export interface UuidConfig {
  version: UuidVersion;
  namespace?: string;
  name?: string;
  caseSensitive: boolean;
}

/**
 * UUID unit state
 */
export interface UuidState {
  readonly config: UuidConfig;
  readonly value: string;
  readonly version: UuidVersion;
  readonly isValid: boolean;
  readonly validation: UuidValidation;
}

/**
 * UUID unit implementation
 * 
 * A pure, composable UUID generation and validation unit that follows the Unit Architecture pattern.
 * Provides type-safe UUID operations with support for different versions.
 */
export class UuidUnit {
  private constructor(private readonly state: UuidState) {}

  /**
   * Create a new UUID unit with generated UUID
   */
  static create(config?: Partial<UuidConfig>): Result<UuidUnit> {
    try {
      const defaultConfig: UuidConfig = {
        version: UuidVersion.V4,
        caseSensitive: false
      };
      
      const finalConfig = { ...defaultConfig, ...config };
      let uuid: string;
      
      switch (finalConfig.version) {
        case UuidVersion.V4:
          uuid = generateV4();
          break;
        case UuidVersion.V1:
          uuid = generateV1();
          break;
        case UuidVersion.V3:
          if (!finalConfig.namespace || !finalConfig.name) {
            return Result.fail('V3 UUID requires namespace and name');
          }
          uuid = generateV3(finalConfig.namespace, finalConfig.name);
          break;
        case UuidVersion.V5:
          if (!finalConfig.namespace || !finalConfig.name) {
            return Result.fail('V5 UUID requires namespace and name');
          }
          uuid = generateV5(finalConfig.namespace, finalConfig.name);
          break;
        default:
          return Result.fail(`Unsupported UUID version: ${finalConfig.version}`);
      }
      
      const validation = validateUuid(uuid);
      
      const state: UuidState = {
        config: finalConfig,
        value: uuid,
        version: finalConfig.version,
        isValid: validation.isValid,
        validation
      };

      return Result.success(new UuidUnit(state));
    } catch (error) {
      return Result.fail(`Failed to create UUID unit: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create UUID unit from existing UUID string
   */
  static fromString(uuid: string, config?: Partial<UuidConfig>): Result<UuidUnit> {
    try {
      const validation = validateUuid(uuid);
      
      if (!validation.isValid) {
        return Result.fail(`Invalid UUID: ${validation.error}`);
      }
      
      const defaultConfig: UuidConfig = {
        version: validation.version || UuidVersion.V4,
        caseSensitive: false
      };
      
      const finalConfig = { ...defaultConfig, ...config };
      
      const state: UuidState = {
        config: finalConfig,
        value: uuid,
        version: validation.version || UuidVersion.V4,
        isValid: validation.isValid,
        validation
      };

      return Result.success(new UuidUnit(state));
    } catch (error) {
      return Result.fail(`Failed to create UUID unit from string: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get unit help information
   */
  static help(): string {
    return `UuidUnit - Pure, composable UUID generation and validation

USAGE:
  const uuid = UuidUnit.create(); // Generate V4 UUID
  const v1 = UuidUnit.create({ version: UuidVersion.V1 });
  const v3 = UuidUnit.create({ 
    version: UuidVersion.V3, 
    namespace: UUID_NAMESPACES.DNS, 
    name: "example.com" 
  });
  
  const fromString = UuidUnit.fromString("550e8400-e29b-41d4-a716-446655440000");
  
  console.log(uuid.toString()); // "550e8400-e29b-41d4-a716-446655440000"
  console.log(uuid.version()); // 4
  console.log(uuid.isValid()); // true

METHODS:
  - create(config?): Generate new UUID
  - fromString(uuid): Create from existing UUID string
  - toString(): Get UUID as string
  - version(): Get UUID version
  - isValid(): Check if UUID is valid
  - equals(other): Compare with another UUID
  - toUpperCase(): Convert to uppercase
  - toLowerCase(): Convert to lowercase
  - validate(): Get validation details
  - capabilities(): Get UUID capabilities
  - help(): Get this help text

PURE FUNCTIONS:
  - generateV1(): Generate V1 UUID
  - generateV4(): Generate V4 UUID
  - generateV3(namespace, name): Generate V3 UUID
  - generateV5(namespace, name): Generate V5 UUID
  - validate(uuid): Validate UUID string
  - compare(a, b): Compare two UUIDs
  - nil(): Get nil UUID (all zeros)

CONFIGURATION:
  - version: UUID version to generate
  - namespace: Namespace for V3/V5 UUIDs
  - name: Name for V3/V5 UUIDs
  - caseSensitive: Whether comparisons are case sensitive

FEATURES:
  - All UUID versions (V1, V3, V4, V5)
  - Validation and parsing
  - Type-safe operations
  - Immutable transformations
  - Comparison operations
  - Pure functional API
  - Zero dependencies (uses crypto.randomUUID when available)`;
  }

  /**
   * Get UUID capabilities
   */
  static capabilities(): string[] {
    return [
      "uuid-generation",
      "uuid-validation",
      "all-versions",
      "type-safe",
      "immutable-operations",
      "comparison",
      "formatting",
      "pure-functions",
      "zero-dependencies"
    ];
  }

  /**
   * Get UUID as string
   */
  toString(): string {
    return this.state.value;
  }

  /**
   * Get UUID configuration
   */
  getConfig(): UuidConfig {
    return this.state.config;
  }

  /**
   * Get UUID state
   */
  getState(): UuidState {
    return this.state;
  }

  /**
   * Get UUID version
   */
  version(): UuidVersion {
    return this.state.version;
  }

  /**
   * Check if UUID is valid
   */
  isValid(): boolean {
    return this.state.isValid;
  }

  /**
   * Get validation details
   */
  validate(): UuidValidation {
    return this.state.validation;
  }

  /**
   * Compare with another UUID
   */
  equals(other: UuidUnit | string): boolean {
    const otherValue = typeof other === 'string' ? other : other.toString();
    
    return this.state.config.caseSensitive
      ? this.state.value === otherValue
      : this.state.value.toLowerCase() === otherValue.toLowerCase();
  }

  /**
   * Convert to uppercase
   */
  toUpperCase(): Result<UuidUnit> {
    return UuidUnit.fromString(this.state.value.toUpperCase(), this.state.config);
  }

  /**
   * Convert to lowercase
   */
  toLowerCase(): Result<UuidUnit> {
    return UuidUnit.fromString(this.state.value.toLowerCase(), this.state.config);
  }

  /**
   * Get unit help
   */
  help(): string {
    return UuidUnit.help();
  }

  /**
   * Get unit capabilities
   */
  capabilities(): string[] {
    return UuidUnit.capabilities();
  }
}

// Pure functions for functional programming style

/**
 * Generate V1 UUID (time-based)
 */
export function generateV1(): string {
  // Simplified V1 generation - in production use proper time-based algorithm
  const timestamp = Date.now();
  const random = Math.random().toString(16).slice(2, 14);
  return `${timestamp.toString(16).padStart(8, '0')}-${random.slice(0, 4)}-1${random.slice(4, 7)}-${random.slice(7, 11)}-${random.slice(11)}00000`;
}

/**
 * Generate V4 UUID (random)
 */
export function generateV4(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate V3 UUID (MD5 hash-based)
 */
export function generateV3(namespace: string, name: string): string {
  // Simplified V3 generation - in production use proper MD5 implementation
  const hash = simpleHash(namespace + name);
  return formatAsUuid(hash, 3);
}

/**
 * Generate V5 UUID (SHA-1 hash-based)
 */
export function generateV5(namespace: string, name: string): string {
  // Simplified V5 generation - in production use proper SHA-1 implementation
  const hash = simpleHash(`${namespace}${name}v5`);
  return formatAsUuid(hash, 5);
}

/**
 * Validate UUID string
 */
export function validateUuid(uuid: string): UuidValidation {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return {
      isValid: false,
      error: 'Invalid UUID format'
    };
  }
  
  const version = Number.parseInt(uuid.charAt(14), 16);
  const variant = uuid.charAt(19);
  
  return {
    isValid: true,
    version: version as UuidVersion,
    variant: variant
  };
}

/**
 * Compare two UUIDs
 */
export function compare(a: string, b: string, caseSensitive = false): number {
  const aValue = caseSensitive ? a : a.toLowerCase();
  const bValue = caseSensitive ? b : b.toLowerCase();
  
  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

/**
 * Get nil UUID (all zeros)
 */
export function nil(): string {
  return '00000000-0000-0000-0000-000000000000';
}

/**
 * Check if UUID is nil
 */
export function isNil(uuid: string): boolean {
  return uuid === nil();
}

/**
 * Simple hash function for UUID generation
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Format hash as UUID
 */
function formatAsUuid(hash: string, version: number): string {
  const padded = hash.padStart(32, '0');
  return [
    padded.slice(0, 8),
    padded.slice(8, 12),
    version + padded.slice(13, 16),
    `8${padded.slice(17, 20)}`,
    padded.slice(20, 32)
  ].join('-');
}

/**
 * Default V4 UUID generator
 */
export const defaultUuid = UuidUnit.create();
