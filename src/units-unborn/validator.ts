/**
 * Validator Unit - Simple, Pure, Composable Validation
 * 
 * A minimal validator unit that demonstrates the Unit pattern
 * without complex DNA - just pure functionality with help.
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  data?: unknown;
}

export interface ValidationRule {
  name: string;
  validate: (value: unknown) => boolean;
  message: string;
}

export class Validator {
  private rules: ValidationRule[] = [];
  private schema: unknown = null;

  constructor(schema?: unknown) {
    this.schema = schema;
    this.initializeDefaultRules();
  }

  /**
   * Create a new Validator unit
   */
  static create(schema?: unknown): Validator {
    return new Validator(schema);
  }

  /**
   * Add a validation rule
   */
  addRule(rule: ValidationRule): Validator {
    this.rules.push(rule);
    return this;
  }

  /**
   * Validate data against rules
   */
  validate(data: unknown): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of this.rules) {
      if (!rule.validate(data)) {
        errors.push(rule.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      data
    };
  }

  /**
   * Sanitize data (remove invalid fields)
   */
  sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Simple sanitization - remove null/undefined
      if (value !== null && value !== undefined) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Transform data using built-in transformations
   */
  transform(data: unknown): unknown {
    if (typeof data === 'string') {
      return data.trim();
    }
    return data;
  }

  /**
   * Consume another unit to extend validation capabilities
   */
  consume(other: Validator): Validator {
    this.rules.push(...other.rules);
    return this;
  }

  /**
   * Get current capabilities
   */
  get capabilities(): string[] {
    const caps = ['validate', 'sanitize', 'transform', 'addRule', 'consume'];
    if (this.rules.length > 0) {
      caps.push(`${this.rules.length} rules`);
    }
    return caps;
  }

  /**
   * Export to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      type: 'Validator',
      version: '1.0.0',
      rules: this.rules.map(r => ({ name: r.name, message: r.message })),
      schema: this.schema
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, unknown>): Validator {
    const validator = new Validator(json.schema);
    // Note: Functions can't be serialized, so we'd need to rebuild rules
    return validator;
  }

  /**
   * Show help information
   */
  help(): void {
    console.log('\n=== Validator Unit v1.0.0 ===');
    console.log('I can validate, sanitize, and transform data.\n');
    
    console.log('🛠️ Available Methods:');
    console.log('  validate(data)     // Validate data against rules');
    console.log('  sanitize(data)     // Remove invalid fields');
    console.log('  transform(data)    // Transform data');
    console.log('  addRule(rule)      // Add validation rule');
    console.log('  consume(validator) // Merge with another validator');
    
    console.log('\n📊 Current State:');
    console.log(`  Rules: ${this.rules.length}`);
    console.log(`  Capabilities: ${this.capabilities.join(', ')}`);
    
    console.log('\n📖 Usage Examples:');
    console.log('  const v = Validator.create();');
    console.log('  v.addRule({ name: "required", validate: x => !!x, message: "Required" });');
    console.log('  const result = v.validate(data);');
    console.log('  const clean = v.sanitize(data);');
    
    console.log('\n💡 Unit Features:');
    console.log('  • Pure and composable');
    console.log('  • Chainable operations');
    console.log('  • Extensible through consume()');
    console.log('  • JSON serializable');
    console.log();
  }

  /**
   * Static help
   */
  static help(): void {
    console.log('\n=== Validator Unit v1.0.0 ===');
    console.log('I can validate, sanitize, and transform data.\n');
    
    console.log('🏗️ Creation:');
    console.log('  Validator.create()        // Empty validator');
    console.log('  Validator.create(schema)  // With schema');
    
    console.log('\n🛠️ Core Methods:');
    console.log('  validate(data)     // Validate data');
    console.log('  sanitize(data)     // Clean data');
    console.log('  transform(data)    // Transform data');
    console.log('  addRule(rule)      // Add validation rule');
    console.log('  consume(validator) // Merge validators');
    
    console.log('\n💡 Unit Pattern:');
    console.log('  • Chainable operations');
    console.log('  • Composable with other units');
    console.log('  • Self-documenting');
    console.log();
  }

  private initializeDefaultRules(): void {
    // Add some default rules
    this.addRule({
      name: 'notEmpty',
      validate: (value: unknown) => value !== '' && value !== null && value !== undefined,
      message: 'Value cannot be empty'
    });
  }
}

// Pure function exports
export function validate(data: unknown, rules: ValidationRule[]): ValidationResult {
  const validator = Validator.create();
  for (const rule of rules) {
    validator.addRule(rule);
  }
  return validator.validate(data);
}

export function sanitize(data: unknown): unknown {
  return Validator.create().sanitize(data);
}

export function transform(data: unknown): unknown {
  return Validator.create().transform(data);
}
