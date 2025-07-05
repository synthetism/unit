/**
 * Self-Validating Unit Demo
 * 
 * Shows how units can validate themselves during creation
 * without external Result dependency.
 */

import { 
  ValueObject, 
  type Unit, 
  type UnitSchema, 
  createUnitSchema 
} from '../unit';

/**
 * Hash Unit with self-validation
 */
interface HashProps {
  algorithm: string;
  created: boolean;
  error?: string;
  stack?: string[];
}

export class Hash extends ValueObject<HashProps> implements Unit {
  readonly dna: UnitSchema = createUnitSchema({
    name: 'Hash',
    version: '1.0.0',
    commands: ['hash', 'verify'],
    description: 'Cryptographic hash unit with self-validation',
  });

  get created(): boolean {
    return this.props.created;
  }

  get error(): string | undefined {
    return this.props.error;
  }

  get stack(): string[] | undefined {
    return this.props.stack;
  }

  /**
   * Self-validating creation
   */
  static create(algorithm = 'sha256'): Hash {
    const errors: string[] = [];
    
    // Validation logic
    if (!algorithm) {
      errors.push('Algorithm is required');
    }
    
    const validAlgorithms = ['sha256', 'sha512', 'md5', 'blake2'];
    if (!validAlgorithms.includes(algorithm)) {
      errors.push(`Unsupported algorithm: ${algorithm}`);
      errors.push(`Supported: ${validAlgorithms.join(', ')}`);
    }

    // Create unit with validation results
    if (errors.length > 0) {
      return new Hash({
        algorithm: algorithm || 'unknown',
        created: false,
        error: errors[0], // Main error
        stack: errors,    // All errors
      });
    }

    return new Hash({
      algorithm,
      created: true,
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.created && this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🔒 ${this.whoami()} - ${this.dna.description}`);
    if (!this.created) {
      console.log(`❌ Creation failed: ${this.error}`);
      if (this.stack) {
        console.log('Issues:', this.stack);
      }
    } else {
      console.log('✅ Ready for hashing');
    }
  }

  explain(): string {
    if (this.created) {
      return `Hash unit successfully created with ${this.props.algorithm} algorithm`;
    }
    
    return `Hash unit creation failed: ${this.stack?.join(', ') || this.error}`;
  }

  // Only work if created successfully
  hash(data: string): string {
    if (!this.created) {
      throw new Error(`Cannot hash: ${this.error}`);
    }
    return `${this.props.algorithm}-hash-of-${data}`;
  }

  verify(data: string, hash: string): boolean {
    if (!this.created) {
      throw new Error(`Cannot verify: ${this.error}`);
    }
    return hash === this.hash(data);
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    if (!this.created) {
      return {}; // Can't teach if not properly created
    }
    
    return {
      hash: (...args: unknown[]) => this.hash(args[0] as string),
      verify: (...args: unknown[]) => this.verify(args[0] as string, args[1] as string),
    };
  }
}

/**
 * HTTP Unit with complex validation
 */
interface HttpProps {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
  created: boolean;
  error?: string;
  stack?: string[];
}

export class HttpUnit extends ValueObject<HttpProps> implements Unit {
  readonly dna: UnitSchema = createUnitSchema({
    name: 'HttpUnit',
    version: '1.0.0',
    commands: ['get', 'post', 'configure'],
    description: 'HTTP client unit with validation',
  });

  get created(): boolean {
    return this.props.created;
  }

  get error(): string | undefined {
    return this.props.error;
  }

  get stack(): string[] | undefined {
    return this.props.stack;
  }

  static create(config: {
    baseUrl?: string;
    timeout?: number;
    headers?: Record<string, string>;
  } = {}): HttpUnit {
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

    const allIssues = [...errors, ...warnings];

    if (errors.length > 0) {
      return new HttpUnit({
        baseUrl,
        timeout,
        headers,
        created: false,
        error: errors[0],
        stack: allIssues,
      });
    }

    return new HttpUnit({
      baseUrl,
      timeout,
      headers,
      created: true,
      stack: warnings.length > 0 ? warnings : undefined,
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.created && this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🌐 ${this.whoami()} - ${this.dna.description}`);
    if (!this.created) {
      console.log(`❌ Creation failed: ${this.error}`);
    } else {
      console.log(`✅ Ready - ${this.props.baseUrl}`);
      if (this.stack) {
        console.log('Warnings:', this.stack);
      }
    }
  }

  explain(): string {
    if (this.created) {
      const warnings = this.stack ? ` (warnings: ${this.stack.join(', ')})` : '';
      return `HTTP unit created successfully${warnings}`;
    }
    
    return `HTTP unit creation failed: ${this.stack?.join(' | ') || this.error}`;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    if (!this.created) {
      return {};
    }
    
    return {
      get: (...args: unknown[]) => `GET ${args[0]} from ${this.props.baseUrl}`,
      post: (...args: unknown[]) => `POST ${args[0]} to ${this.props.baseUrl}`,
      configure: (...args: unknown[]) => `Configured with ${JSON.stringify(args[0])}`,
    };
  }
}
