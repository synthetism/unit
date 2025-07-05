/**
 * Null-Safe Unit Creation Pattern
 * 
 * This demonstrates the improved pattern where units return null
 * for failed creation instead of invalid units with created: false.
 * 
 * Benefits:
 * - Forces developers to handle errors upfront
 * - Prevents runtime surprises with invalid units
 * - Type system enforces null checking
 * - Clean separation between valid units and errors
 */

import { Unit, createUnitSchema, ValueObject } from './src/unit.js';

/**
 * Hash Unit with null-safe creation
 */
interface HashProps {
  algorithm: string;
  keyData: string;
}

class HashUnit extends ValueObject<HashProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'HashUnit',
    version: '1.0.0',
    commands: ['hash', 'verify'],
    description: 'Cryptographic hash operations'
  });

  // Valid units are always created successfully
  readonly created = true;
  readonly error = undefined;
  readonly stack = undefined;

  constructor(props: HashProps) {
    super(props);
  }

  /**
   * Static factory that returns Unit | null
   * This forces developers to handle the null case
   */
  static create(algorithm: string = 'sha256'): HashUnit | null {
    // Validation - collect all errors
    const errors: string[] = [];
    
    if (!algorithm) {
      errors.push('Algorithm is required');
    }
    
    const validAlgorithms = ['sha256', 'sha512', 'md5', 'blake2'];
    if (!validAlgorithms.includes(algorithm)) {
      errors.push(`Unsupported algorithm: ${algorithm}`);
      errors.push(`Supported: ${validAlgorithms.join(', ')}`);
    }

    // Return null if validation fails
    if (errors.length > 0) {
      // Could log errors, throw, or store them somewhere
      console.error(`HashUnit creation failed: ${errors.join(', ')}`);
      return null;
    }

    // Only create valid units
    return new HashUnit({
      algorithm,
      keyData: `${algorithm}-key-data-${Date.now()}`
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🔒 ${this.whoami()} - ${this.dna.description}`);
    console.log(`✅ Ready with ${this.getProps().algorithm} algorithm`);
  }

  explain(): string {
    return `Hash unit successfully created with ${this.getProps().algorithm} algorithm`;
  }

  // Methods that can safely assume the unit is valid
  hash(data: string): string {
    return `${this.getProps().algorithm}-hash-of-${data}`;
  }

  verify(data: string, hash: string): boolean {
    return hash === this.hash(data);
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      hash: (...args: unknown[]) => this.hash(args[0] as string),
      verify: (...args: unknown[]) => this.verify(args[0] as string, args[1] as string),
    };
  }
}

/**
 * HTTP Unit with null-safe creation
 */
interface HttpProps {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
  warnings?: string[];
}

class HttpUnit extends ValueObject<HttpProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'HttpUnit',
    version: '1.0.0',
    commands: ['get', 'post', 'configure'],
    description: 'HTTP client operations'
  });

  readonly created = true;
  readonly error = undefined;
  readonly stack?: string[];

  constructor(props: HttpProps) {
    super(props);
    this.stack = props.warnings;
  }

  static create(config: {
    baseUrl?: string;
    timeout?: number;
    headers?: Record<string, string>;
  } = {}): HttpUnit | null {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation
    const baseUrl = config.baseUrl || '';
    if (!baseUrl) {
      errors.push('Base URL is required');
    } else if (!baseUrl.startsWith('http')) {
      errors.push('Base URL must start with http:// or https://');
    }

    const timeout = config.timeout || 5000;
    if (timeout < 1000) {
      warnings.push('Timeout below 1000ms may cause issues');
    }

    const headers = config.headers || {};
    if (!headers['User-Agent']) {
      warnings.push('User-Agent header recommended');
    }

    // Return null if validation fails
    if (errors.length > 0) {
      console.error(`HttpUnit creation failed: ${errors.join(', ')}`);
      return null;
    }

    // Only create valid units (warnings are OK)
    return new HttpUnit({
      baseUrl,
      timeout,
      headers,
      warnings: warnings.length > 0 ? warnings : undefined
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🌐 ${this.whoami()} - ${this.dna.description}`);
    console.log(`✅ Ready - ${this.getProps().baseUrl}`);
    if (this.stack) {
      console.log(`⚠️  Warnings: ${this.stack.join(', ')}`);
    }
  }

  explain(): string {
    const warnings = this.stack ? ` (warnings: ${this.stack.join(', ')})` : '';
    return `HTTP unit created successfully${warnings}`;
  }

  async get(path: string): Promise<string> {
    return `GET ${this.getProps().baseUrl}${path} -> Mock response`;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      get: (...args: unknown[]) => this.get(args[0] as string),
      post: (...args: unknown[]) => `POST ${args[0]} to ${this.getProps().baseUrl}`,
      configure: (...args: unknown[]) => `Configured with ${JSON.stringify(args[0])}`,
    };
  }
}

/**
 * Composite Unit with null-safe creation
 */
class SecureHashUnit {
  private constructor(
    private hashUnit: HashUnit,
    private httpUnit: HttpUnit
  ) {}

  static create(config: {
    algorithm?: string;
    baseUrl?: string;
    timeout?: number;
  } = {}): SecureHashUnit | null {
    // Try to create components
    const hashUnit = HashUnit.create(config.algorithm);
    const httpUnit = HttpUnit.create({
      baseUrl: config.baseUrl,
      timeout: config.timeout
    });

    // If either component fails, return null
    if (!hashUnit) {
      console.error('SecureHashUnit creation failed: Hash component failed');
      return null;
    }

    if (!httpUnit) {
      console.error('SecureHashUnit creation failed: HTTP component failed');
      return null;
    }

    // Only create if both components are valid
    return new SecureHashUnit(hashUnit, httpUnit);
  }

  async secureHash(data: string): Promise<{ hash: string; uploaded: boolean }> {
    const hash = this.hashUnit.hash(data);
    const response = await this.httpUnit.get(`/hash/${hash}`);
    
    return {
      hash,
      uploaded: response.includes('Mock response')
    };
  }

  getCapabilities() {
    return {
      ...this.hashUnit.teach(),
      ...this.httpUnit.teach(),
      secureHash: (data: string) => this.secureHash(data)
    };
  }
}

/**
 * Demo function showing the null-safe pattern
 */
async function demonstrateNullSafePattern() {
  console.log('🛡️ Null-Safe Unit Creation Pattern\n');

  // 1. Successful creation
  console.log('✅ Successful Unit Creation:');
  const goodHash = HashUnit.create('sha256');
  if (goodHash) {
    // TypeScript knows this is a valid HashUnit
    goodHash.help();
    console.log(`Hash result: ${goodHash.hash('test-data')}`);
  } else {
    console.log('Hash creation failed');
  }
  console.log();

  // 2. Failed creation
  console.log('❌ Failed Unit Creation:');
  const badHash = HashUnit.create('invalid-algorithm');
  if (badHash) {
    // This block won't execute
    console.log('This should not print');
  } else {
    console.log('Hash creation failed as expected');
  }
  console.log();

  // 3. HTTP unit with warnings
  console.log('⚠️ Unit with Warnings:');
  const httpUnit = HttpUnit.create({
    baseUrl: 'https://api.example.com',
    timeout: 500 // Warning: too low
  });
  if (httpUnit) {
    httpUnit.help();
    console.log(`HTTP explanation: ${httpUnit.explain()}`);
  }
  console.log();

  // 4. Failed HTTP creation
  console.log('❌ Failed HTTP Creation:');
  const badHttp = HttpUnit.create({
    baseUrl: 'not-a-url' // Invalid URL
  });
  if (badHttp) {
    console.log('This should not print');
  } else {
    console.log('HTTP creation failed as expected');
  }
  console.log();

  // 5. Safe composition
  console.log('🔐 Safe Composition:');
  const secureUnit = SecureHashUnit.create({
    algorithm: 'sha256',
    baseUrl: 'https://api.example.com'
  });
  
  if (secureUnit) {
    console.log('✅ Secure unit created successfully');
    const result = await secureUnit.secureHash('sensitive-data');
    console.log(`Secure hash result: ${result.hash}, uploaded: ${result.uploaded}`);
  } else {
    console.log('Secure unit creation failed');
  }
  console.log();

  // 6. Failed composition
  console.log('❌ Failed Composition:');
  const failedSecure = SecureHashUnit.create({
    algorithm: 'invalid',
    baseUrl: 'https://api.example.com'
  });
  
  if (failedSecure) {
    console.log('This should not print');
  } else {
    console.log('Secure unit creation failed as expected');
  }
  console.log();

  // 7. Type-safe usage patterns
  console.log('🔒 Type-Safe Usage Patterns:');
  
  function processHashUnit(unit: HashUnit | null) {
    if (!unit) {
      console.log('Cannot process null unit');
      return;
    }
    
    // TypeScript knows unit is valid here
    console.log(`Processing: ${unit.whoami()}`);
    console.log(`Can hash: ${unit.capableOf('hash')}`);
    console.log(`Hash result: ${unit.hash('example')}`);
  }
  
  processHashUnit(goodHash);
  processHashUnit(badHash);
  
  console.log('\n✨ Benefits of Null-Safe Pattern:');
  console.log('• Forces error handling at creation time');
  console.log('• Prevents runtime surprises with invalid units');
  console.log('• TypeScript enforces null checking');
  console.log('• Clean separation between valid units and errors');
  console.log('• No need for created/error properties on units');
  console.log('• All existing units are guaranteed to be valid');
}

// Run the demo
demonstrateNullSafePattern().catch(console.error);
