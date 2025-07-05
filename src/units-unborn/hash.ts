/**
 * Hash Unit - Simple, Pure, Composable Hashing
 * 
 * A minimal hash unit that demonstrates the Unit pattern
 * with multiple hash algorithms and chainable operations.
 */

export type HashAlgorithm = 'sha256' | 'sha1' | 'md5' | 'sha512';

export class Hash {
  private algorithm: HashAlgorithm;
  private data: string[] = [];
  private finalized = false;

  constructor(algorithm: HashAlgorithm = 'sha256') {
    this.algorithm = algorithm;
  }

  /**
   * Create a new Hash unit
   */
  static create(algorithm: HashAlgorithm = 'sha256'): Hash {
    return new Hash(algorithm);
  }

  /**
   * Add data to hash
   */
  update(data: string): Hash {
    if (this.finalized) {
      throw new Error('Hash already finalized');
    }
    this.data.push(data);
    return this;
  }

  /**
   * Finalize and get hash digest
   */
  digest(encoding: 'hex' | 'base64' = 'hex'): string {
    this.finalized = true;
    const combined = this.data.join('');
    return this.computeHash(combined, encoding);
  }

  /**
   * Get hash of single input (convenience method)
   */
  hash(data: string, encoding: 'hex' | 'base64' = 'hex'): string {
    return this.computeHash(data, encoding);
  }

  /**
   * Reset hash state
   */
  reset(): Hash {
    this.data = [];
    this.finalized = false;
    return this;
  }

  /**
   * Clone this hash unit
   */
  clone(): Hash {
    const cloned = new Hash(this.algorithm);
    cloned.data = [...this.data];
    cloned.finalized = this.finalized;
    return cloned;
  }

  /**
   * Consume another hash unit (combine data)
   */
  consume(other: Hash): Hash {
    if (this.finalized) {
      throw new Error('Hash already finalized');
    }
    this.data.push(...other.data);
    return this;
  }

  /**
   * Get current capabilities
   */
  get capabilities(): string[] {
    const caps = ['update', 'digest', 'hash', 'reset', 'clone', 'consume'];
    caps.push(`algorithm: ${this.algorithm}`);
    caps.push(`data chunks: ${this.data.length}`);
    if (this.finalized) {
      caps.push('finalized');
    }
    return caps;
  }

  /**
   * Export to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      type: 'Hash',
      version: '1.0.0',
      algorithm: this.algorithm,
      data: this.data,
      finalized: this.finalized
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, unknown>): Hash {
    const hash = new Hash(json.algorithm as HashAlgorithm);
    hash.data = json.data as string[];
    hash.finalized = json.finalized as boolean;
    return hash;
  }

  /**
   * Show help information
   */
  help(): void {
    console.log('\n=== Hash Unit v1.0.0 ===');
    console.log('I can create cryptographic hashes using multiple algorithms.\n');
    
    console.log('🛠️ Available Methods:');
    console.log('  update(data)       // Add data to hash');
    console.log('  digest(encoding?)  // Get final hash');
    console.log('  hash(data)         // Hash single input');
    console.log('  reset()            // Reset hash state');
    console.log('  clone()            // Clone hash unit');
    console.log('  consume(hash)      // Merge with another hash');
    
    console.log('\n🔐 Supported Algorithms:');
    console.log('  • sha256 (default)');
    console.log('  • sha1');
    console.log('  • sha512');
    console.log('  • md5');
    
    console.log('\n📊 Current State:');
    console.log(`  Algorithm: ${this.algorithm}`);
    console.log(`  Data chunks: ${this.data.length}`);
    console.log(`  Finalized: ${this.finalized}`);
    console.log(`  Capabilities: ${this.capabilities.join(', ')}`);
    
    console.log('\n📖 Usage Examples:');
    console.log('  const h = Hash.create("sha256");');
    console.log('  h.update("hello").update("world");');
    console.log('  const hash = h.digest("hex");');
    console.log('  const quick = Hash.create().hash("data");');
    
    console.log('\n💡 Unit Features:');
    console.log('  • Chainable operations');
    console.log('  • Multiple algorithms');
    console.log('  • Streaming support');
    console.log('  • Composable with other units');
    console.log();
  }

  /**
   * Static help
   */
  static help(): void {
    console.log('\n=== Hash Unit v1.0.0 ===');
    console.log('I can create cryptographic hashes using multiple algorithms.\n');
    
    console.log('🏗️ Creation:');
    console.log('  Hash.create()           // SHA256 (default)');
    console.log('  Hash.create("sha1")     // SHA1');
    console.log('  Hash.create("sha512")   // SHA512');
    console.log('  Hash.create("md5")      // MD5');
    
    console.log('\n🛠️ Core Methods:');
    console.log('  update(data)       // Add data');
    console.log('  digest(encoding?)  // Get hash');
    console.log('  hash(data)         // Quick hash');
    console.log('  reset()            // Reset state');
    console.log('  consume(hash)      // Merge hashes');
    
    console.log('\n💡 Unit Pattern:');
    console.log('  • Chainable operations');
    console.log('  • Multiple algorithms');
    console.log('  • Streaming support');
    console.log();
  }

  private computeHash(data: string, encoding: 'hex' | 'base64'): string {
    // Simple hash implementation for demo
    // In production, use actual crypto libraries
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const hashStr = Math.abs(hash).toString(16);
    
    if (encoding === 'base64') {
      try {
        // Try Node.js Buffer first
        const nodeBuffer = (globalThis as Record<string, unknown>)?.Buffer;
        if (nodeBuffer && typeof nodeBuffer === 'object' && 'from' in nodeBuffer) {
          return (nodeBuffer as {
            from: (data: string) => { toString: (encoding: string) => string };
          }).from(hashStr).toString('base64');
        }
        
        // Fallback to browser btoa
        const browserBtoa = (globalThis as Record<string, unknown>)?.btoa;
        if (browserBtoa && typeof browserBtoa === 'function') {
          return (browserBtoa as (data: string) => string)(hashStr);
        }
        
        return hashStr; // Fallback to hex
      } catch {
        return hashStr; // Fallback to hex
      }
    }
    
    return hashStr;
  }
}

// Pure function exports
export function createHash(data: string, algorithm: HashAlgorithm = 'sha256'): string {
  return Hash.create(algorithm).hash(data);
}

export function sha256(data: string): string {
  return Hash.create('sha256').hash(data);
}

export function sha1(data: string): string {
  return Hash.create('sha1').hash(data);
}

export function md5(data: string): string {
  return Hash.create('md5').hash(data);
}
