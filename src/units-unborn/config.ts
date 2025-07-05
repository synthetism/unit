/**
 * Config Unit - Simple, Pure, Composable Configuration Management
 * 
 * A minimal config unit that demonstrates the Unit pattern
 * with environment variables, JSON files, and runtime configuration.
 * 
 * AI Agent Friendly: Complete API discoverable via unit.help()
 */

export type ConfigSource = 'env' | 'json' | 'object' | 'memory';

export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    default?: unknown;
    required?: boolean;
    description?: string;
  };
}

export class Config {
  private data: Map<string, unknown> = new Map();
  private sources: ConfigSource[] = [];
  private schema: ConfigSchema | null = null;
  private name: string;

  constructor(name = 'Config', schema?: ConfigSchema) {
    this.name = name;
    this.schema = schema || null;
  }

  /**
   * Create a new Config unit
   */
  static create(name = 'Config', schema?: ConfigSchema): Config {
    return new Config(name, schema);
  }

  /**
   * Load configuration from environment variables
   */
  fromEnv(prefix = ''): Config {
    this.sources.push('env');
    
    // In browser, process.env might not exist
    if (typeof process !== 'undefined' && process.env) {
      for (const [key, value] of Object.entries(process.env)) {
        if (!prefix || key.startsWith(prefix)) {
          const configKey = prefix ? key.slice(prefix.length) : key;
          this.data.set(configKey.toLowerCase(), value);
        }
      }
    }
    
    return this;
  }

  /**
   * Load configuration from JSON object
   */
  fromObject(obj: Record<string, unknown>): Config {
    this.sources.push('object');
    
    for (const [key, value] of Object.entries(obj)) {
      this.data.set(key, value);
    }
    
    return this;
  }

  /**
   * Load configuration from JSON string
   */
  fromJSON(jsonString: string): Config {
    this.sources.push('json');
    
    try {
      const obj = JSON.parse(jsonString);
      return this.fromObject(obj);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set a configuration value
   */
  set(key: string, value: unknown): Config {
    this.data.set(key, value);
    return this;
  }

  /**
   * Get a configuration value
   */
  get<T = unknown>(key: string, defaultValue?: T): T {
    const value = this.data.get(key);
    
    if (value === undefined && this.schema) {
      const schemaEntry = this.schema[key];
      if (schemaEntry?.default !== undefined) {
        return schemaEntry.default as T;
      }
    }
    
    return (value !== undefined ? value : defaultValue) as T;
  }

  /**
   * Check if a key exists
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get all configuration as object
   */
  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    // Add schema defaults first
    if (this.schema) {
      for (const [key, schemaEntry] of Object.entries(this.schema)) {
        if (schemaEntry.default !== undefined) {
          result[key] = schemaEntry.default;
        }
      }
    }
    
    // Override with actual values
    for (const [key, value] of this.data.entries()) {
      result[key] = value;
    }
    
    return result;
  }

  /**
   * Validate configuration against schema
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.schema) {
      return { valid: true, errors: [] };
    }
    
    for (const [key, schemaEntry] of Object.entries(this.schema)) {
      const value = this.get(key);
      
      // Check required fields
      if (schemaEntry.required && (value === undefined || value === null)) {
        errors.push(`Required field '${key}' is missing`);
        continue;
      }
      
      // Check types
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== schemaEntry.type) {
          errors.push(`Field '${key}' should be ${schemaEntry.type}, got ${actualType}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Merge with another config unit
   */
  consume(other: Config): Config {
    for (const [key, value] of other.data.entries()) {
      this.data.set(key, value);
    }
    this.sources.push(...other.sources);
    return this;
  }

  /**
   * Create environment-specific config
   */
  env(environment: string): Config {
    const envConfig = Config.create(`${this.name}-${environment}`);
    envConfig.data = new Map(this.data);
    
    // Override with environment-specific values
    for (const [key, value] of this.data.entries()) {
      const envKey = `${environment}_${key}`;
      if (this.data.has(envKey)) {
        envConfig.data.set(key, this.data.get(envKey));
      }
    }
    
    return envConfig;
  }

  /**
   * Get current capabilities
   */
  get capabilities(): string[] {
    const caps = ['get', 'set', 'has', 'getAll', 'validate', 'consume', 'env'];
    caps.push(`sources: ${this.sources.join(', ')}`);
    caps.push(`keys: ${this.data.size}`);
    if (this.schema) {
      caps.push('schema validation');
    }
    return caps;
  }

  /**
   * Export to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      type: 'Config',
      version: '1.0.0',
      name: this.name,
      data: Object.fromEntries(this.data),
      sources: this.sources,
      schema: this.schema
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, unknown>): Config {
    const config = new Config(json.name as string, json.schema as ConfigSchema);
    config.data = new Map(Object.entries(json.data as Record<string, unknown>));
    config.sources = json.sources as ConfigSource[];
    return config;
  }

  /**
   * Show help information - AI Agent Friendly!
   */
  help(): void {
    console.log(`\n=== Config Unit v1.0.0 (${this.name}) ===`);
    console.log('I can manage configuration from multiple sources with validation.\n');
    
    console.log('🛠️ Available Methods:');
    console.log('  fromEnv(prefix?)        // Load from environment variables');
    console.log('  fromObject(obj)         // Load from object');
    console.log('  fromJSON(jsonString)    // Load from JSON string');
    console.log('  set(key, value)         // Set configuration value');
    console.log('  get(key, default?)      // Get configuration value');
    console.log('  has(key)                // Check if key exists');
    console.log('  getAll()                // Get all configuration');
    console.log('  validate()              // Validate against schema');
    console.log('  consume(config)         // Merge with another config');
    console.log('  env(environment)        // Create environment-specific config');
    
    console.log('\n📁 Configuration Sources:');
    console.log('  • Environment variables');
    console.log('  • JSON objects');
    console.log('  • JSON strings');
    console.log('  • Manual set() calls');
    
    console.log('\n📊 Current State:');
    console.log(`  Name: ${this.name}`);
    console.log(`  Sources: ${this.sources.join(', ') || 'none'}`);
    console.log(`  Keys: ${this.data.size}`);
    console.log(`  Has Schema: ${!!this.schema}`);
    console.log(`  Capabilities: ${this.capabilities.join(', ')}`);
    
    if (this.schema) {
      console.log('\n📋 Schema:');
      for (const [key, schemaEntry] of Object.entries(this.schema)) {
        const required = schemaEntry.required ? ' (required)' : '';
        const defaultVal = schemaEntry.default !== undefined ? ` default: ${schemaEntry.default}` : '';
        console.log(`  • ${key}: ${schemaEntry.type}${required}${defaultVal}`);
        if (schemaEntry.description) {
          console.log(`    ${schemaEntry.description}`);
        }
      }
    }
    
    console.log('\n📖 Usage Examples:');
    console.log('  const config = Config.create("AppConfig");');
    console.log('  config.fromEnv("APP_").set("version", "1.0.0");');
    console.log('  const dbUrl = config.get("database_url", "localhost");');
    console.log('  const prodConfig = config.env("production");');
    
    console.log('\n🤖 AI Agent Notes:');
    console.log('  • Chainable operations for fluent configuration');
    console.log('  • Schema validation for type safety');
    console.log('  • Environment-specific configurations');
    console.log('  • Complete introspection via capabilities');
    console.log();
  }

  /**
   * Static help - AI Agent Discovery Point
   */
  static help(): void {
    console.log('\n=== Config Unit v1.0.0 ===');
    console.log('I can manage configuration from multiple sources with validation.\n');
    
    console.log('🏗️ Creation:');
    console.log('  Config.create()                    // Basic config');
    console.log('  Config.create("AppConfig")         // Named config');
    console.log('  Config.create("AppConfig", schema) // With validation schema');
    
    console.log('\n🛠️ Core Methods:');
    console.log('  fromEnv(prefix?) → set(key, value) → get(key)');
    console.log('  validate() → consume(config) → env(environment)');
    
    console.log('\n🤖 AI Agent Benefits:');
    console.log('  • Complete API discoverable via unit.help()');
    console.log('  • Runtime introspection via unit.capabilities');
    console.log('  • Schema validation for type safety');
    console.log('  • No external documentation needed');
    console.log();
  }
}

// Pure function exports for simple use cases
export function createConfig(name?: string, schema?: ConfigSchema): Config {
  return Config.create(name, schema);
}

export function loadEnvConfig(prefix = ''): Config {
  return Config.create().fromEnv(prefix);
}

export function loadJSONConfig(jsonString: string): Config {
  return Config.create().fromJSON(jsonString);
}
