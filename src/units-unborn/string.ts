import { Result } from "@synet/patterns";

/**
 * String transformation options
 */
export interface StringTransformOptions {
  trim?: boolean;
  caseSensitive?: boolean;
  locale?: string;
}

/**
 * String validation rules
 */
export interface StringValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  required?: boolean;
  allowEmpty?: boolean;
}

/**
 * String unit configuration
 */
export interface StringConfig {
  caseSensitive: boolean;
  locale: string;
  defaultTrim: boolean;
}

/**
 * String unit state
 */
export interface StringState {
  readonly config: StringConfig;
  readonly value: string;
  readonly length: number;
  readonly isEmpty: boolean;
}

/**
 * String unit implementation
 * 
 * A pure, composable string manipulation unit that follows the Unit Architecture pattern.
 * Provides type-safe string operations with immutable transformations.
 */
export class StringUnit {
  private constructor(private readonly state: StringState) {}

  /**
   * Create a new string unit
   */
  static create(value: string, config?: Partial<StringConfig>): Result<StringUnit> {
    try {
      const defaultConfig: StringConfig = {
        caseSensitive: true,
        locale: 'en-US',
        defaultTrim: false
      };
      
      const finalConfig = { ...defaultConfig, ...config };
      const processedValue = finalConfig.defaultTrim ? value.trim() : value;
      
      const state: StringState = {
        config: finalConfig,
        value: processedValue,
        length: processedValue.length,
        isEmpty: processedValue.length === 0
      };

      return Result.success(new StringUnit(state));
    } catch (error) {
      return Result.fail(`Failed to create string unit: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get unit help information
   */
  static help(): string {
    return `StringUnit - Pure, composable string manipulation

USAGE:
  const str = StringUnit.create("Hello World");
  
  console.log(str.toUpperCase()); // "HELLO WORLD"
  console.log(str.reverse()); // "dlroW olleH"
  console.log(str.truncate(5)); // "Hello..."
  
  const words = str.split(" ");
  const joined = StringUnit.join(words, "-");

METHODS:
  - create(value, config?): Create string unit
  - toUpperCase(): Convert to uppercase
  - toLowerCase(): Convert to lowercase
  - trim(): Remove whitespace
  - reverse(): Reverse string
  - truncate(length, suffix?): Truncate with suffix
  - split(separator): Split into array
  - replace(search, replacement): Replace text
  - startsWith(prefix): Check if starts with prefix
  - endsWith(suffix): Check if ends with suffix
  - contains(substring): Check if contains substring
  - validate(rules): Validate against rules
  - capabilities(): Get string capabilities
  - help(): Get this help text

PURE FUNCTIONS:
  - join(strings, separator): Join string array
  - concat(...strings): Concatenate strings
  - repeat(string, count): Repeat string
  - padStart(string, length, char): Pad at start
  - padEnd(string, length, char): Pad at end
  - normalize(string): Normalize string
  - slugify(string): Create URL-friendly slug

CONFIGURATION:
  - caseSensitive: Whether comparisons are case sensitive
  - locale: Locale for string operations
  - defaultTrim: Whether to trim by default

FEATURES:
  - Immutable transformations
  - Type-safe operations
  - Locale-aware operations
  - Validation and formatting
  - URL slug generation
  - Pattern matching
  - Pure functional API`;
  }

  /**
   * Get string capabilities
   */
  static capabilities(): string[] {
    return [
      "string-manipulation",
      "immutable-operations",
      "type-safe",
      "locale-aware", 
      "validation",
      "formatting",
      "pattern-matching",
      "url-slugs",
      "pure-functions",
      "zero-dependencies"
    ];
  }

  /**
   * Get current string value
   */
  toString(): string {
    return this.state.value;
  }

  /**
   * Get string configuration
   */
  getConfig(): StringConfig {
    return this.state.config;
  }

  /**
   * Get string state
   */
  getState(): StringState {
    return this.state;
  }

  /**
   * Get string length
   */
  length(): number {
    return this.state.length;
  }

  /**
   * Check if string is empty
   */
  isEmpty(): boolean {
    return this.state.isEmpty;
  }

  /**
   * Convert to uppercase
   */
  toUpperCase(): Result<StringUnit> {
    return StringUnit.create(this.state.value.toUpperCase(), this.state.config);
  }

  /**
   * Convert to lowercase
   */
  toLowerCase(): Result<StringUnit> {
    return StringUnit.create(this.state.value.toLowerCase(), this.state.config);
  }

  /**
   * Trim whitespace
   */
  trim(): Result<StringUnit> {
    return StringUnit.create(this.state.value.trim(), this.state.config);
  }

  /**
   * Reverse string
   */
  reverse(): Result<StringUnit> {
    return StringUnit.create(this.state.value.split('').reverse().join(''), this.state.config);
  }

  /**
   * Truncate string with optional suffix
   */
  truncate(maxLength: number, suffix = '...'): Result<StringUnit> {
    if (this.state.length <= maxLength) {
      return Result.success(this);
    }
    
    const truncated = this.state.value.slice(0, maxLength - suffix.length) + suffix;
    return StringUnit.create(truncated, this.state.config);
  }

  /**
   * Split string into array
   */
  split(separator: string): string[] {
    return this.state.value.split(separator);
  }

  /**
   * Replace text
   */
  replace(search: string | RegExp, replacement: string): Result<StringUnit> {
    const replaced = this.state.value.replace(search, replacement);
    return StringUnit.create(replaced, this.state.config);
  }

  /**
   * Check if string starts with prefix
   */
  startsWith(prefix: string): boolean {
    return this.state.config.caseSensitive
      ? this.state.value.startsWith(prefix)
      : this.state.value.toLowerCase().startsWith(prefix.toLowerCase());
  }

  /**
   * Check if string ends with suffix
   */
  endsWith(suffix: string): boolean {
    return this.state.config.caseSensitive
      ? this.state.value.endsWith(suffix)
      : this.state.value.toLowerCase().endsWith(suffix.toLowerCase());
  }

  /**
   * Check if string contains substring
   */
  contains(substring: string): boolean {
    return this.state.config.caseSensitive
      ? this.state.value.includes(substring)
      : this.state.value.toLowerCase().includes(substring.toLowerCase());
  }

  /**
   * Validate string against rules
   */
  validate(rules: StringValidationRules): Result<boolean> {
    try {
      if (rules.required && this.state.isEmpty) {
        return Result.fail('String is required');
      }
      
      if (!rules.allowEmpty && this.state.isEmpty) {
        return Result.fail('String cannot be empty');
      }
      
      if (rules.minLength && this.state.length < rules.minLength) {
        return Result.fail(`String must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && this.state.length > rules.maxLength) {
        return Result.fail(`String must be no more than ${rules.maxLength} characters`);
      }
      
      if (rules.pattern && !rules.pattern.test(this.state.value)) {
        return Result.fail('String does not match required pattern');
      }
      
      return Result.success(true);
    } catch (error) {
      return Result.fail(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create URL-friendly slug
   */
  slugify(): Result<StringUnit> {
    const slug = this.state.value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return StringUnit.create(slug, this.state.config);
  }

  /**
   * Get unit help
   */
  help(): string {
    return StringUnit.help();
  }

  /**
   * Get unit capabilities
   */
  capabilities(): string[] {
    return StringUnit.capabilities();
  }
}

// Pure functions for functional programming style

/**
 * Join string array with separator
 */
export function join(strings: string[], separator: string): string {
  return strings.join(separator);
}

/**
 * Concatenate strings
 */
export function concat(...strings: string[]): string {
  return strings.join('');
}

/**
 * Repeat string n times
 */
export function repeat(str: string, count: number): string {
  return str.repeat(count);
}

/**
 * Pad string at start
 */
export function padStart(str: string, length: number, padChar = ' '): string {
  return str.padStart(length, padChar);
}

/**
 * Pad string at end
 */
export function padEnd(str: string, length: number, padChar = ' '): string {
  return str.padEnd(length, padChar);
}

/**
 * Normalize string (remove diacritics, etc.)
 */
export function normalize(str: string): string {
  // eslint-disable-next-line no-misleading-character-class
  return str.normalize('NFD').replace(/\p{Mn}/gu, '');
}

/**
 * Create URL-friendly slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if string is email-like
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Check if string is URL-like
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escape HTML characters
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Create a string with case-insensitive configuration
 */
export function createCaseInsensitiveString(value: string): Result<StringUnit> {
  return StringUnit.create(value, { caseSensitive: false });
}

/**
 * Create a string with auto-trim configuration
 */
export function createTrimmedString(value: string): Result<StringUnit> {
  return StringUnit.create(value, { defaultTrim: true });
}
