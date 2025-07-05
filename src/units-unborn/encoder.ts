/**
 * Encoder Unit - Simple, Pure, Composable Encoding/Decoding
 * 
 * A minimal encoder unit that demonstrates the Unit pattern
 * with multiple encoding formats and chainable operations.
 */

export type EncodingFormat = 'base64' | 'base64url' | 'hex' | 'uri' | 'json';

export class Encoder {
  private format: EncodingFormat;
  private operations: Array<{ type: 'encode' | 'decode'; data: string }> = [];

  constructor(format: EncodingFormat = 'base64') {
    this.format = format;
  }

  /**
   * Create a new Encoder unit
   */
  static create(format: EncodingFormat = 'base64'): Encoder {
    return new Encoder(format);
  }

  /**
   * Encode data
   */
  encode(data: string): string {
    this.operations.push({ type: 'encode', data });
    return this.performEncode(data);
  }

  /**
   * Decode data
   */
  decode(data: string): string {
    this.operations.push({ type: 'decode', data });
    return this.performDecode(data);
  }

  /**
   * Chain multiple encodings
   */
  chain(data: string, formats: EncodingFormat[]): string {
    let result = data;
    for (const format of formats) {
      const encoder = Encoder.create(format);
      result = encoder.encode(result);
    }
    return result;
  }

  /**
   * Reverse chain (decode in reverse order)
   */
  reverseChain(data: string, formats: EncodingFormat[]): string {
    let result = data;
    for (const format of formats.reverse()) {
      const encoder = Encoder.create(format);
      result = encoder.decode(result);
    }
    return result;
  }

  /**
   * Change encoding format
   */
  setFormat(format: EncodingFormat): Encoder {
    this.format = format;
    return this;
  }

  /**
   * Get current format
   */
  getFormat(): EncodingFormat {
    return this.format;
  }

  /**
   * Consume another encoder (merge operations)
   */
  consume(other: Encoder): Encoder {
    this.operations.push(...other.operations);
    return this;
  }

  /**
   * Reset operations history
   */
  reset(): Encoder {
    this.operations = [];
    return this;
  }

  /**
   * Get current capabilities
   */
  get capabilities(): string[] {
    const caps = ['encode', 'decode', 'chain', 'reverseChain', 'setFormat', 'consume'];
    caps.push(`format: ${this.format}`);
    caps.push(`operations: ${this.operations.length}`);
    return caps;
  }

  /**
   * Export to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      type: 'Encoder',
      version: '1.0.0',
      format: this.format,
      operations: this.operations
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, unknown>): Encoder {
    const encoder = new Encoder(json.format as EncodingFormat);
    encoder.operations = json.operations as Array<{ type: 'encode' | 'decode'; data: string }>;
    return encoder;
  }

  /**
   * Show help information
   */
  help(): void {
    console.log('\n=== Encoder Unit v1.0.0 ===');
    console.log('I can encode and decode data using multiple formats.\n');
    
    console.log('🛠️ Available Methods:');
    console.log('  encode(data)                // Encode data');
    console.log('  decode(data)                // Decode data');
    console.log('  chain(data, formats)        // Chain multiple encodings');
    console.log('  reverseChain(data, formats) // Reverse chain decode');
    console.log('  setFormat(format)           // Change encoding format');
    console.log('  consume(encoder)            // Merge with another encoder');
    
    console.log('\n🔐 Supported Formats:');
    console.log('  • base64');
    console.log('  • base64url');
    console.log('  • hex');
    console.log('  • uri (URL encoding)');
    console.log('  • json');
    
    console.log('\n📊 Current State:');
    console.log(`  Format: ${this.format}`);
    console.log(`  Operations: ${this.operations.length}`);
    console.log(`  Capabilities: ${this.capabilities.join(', ')}`);
    
    console.log('\n📖 Usage Examples:');
    console.log('  const e = Encoder.create("base64");');
    console.log('  const encoded = e.encode("hello world");');
    console.log('  const decoded = e.decode(encoded);');
    console.log('  const chained = e.chain("data", ["base64", "hex"]);');
    
    console.log('\n💡 Unit Features:');
    console.log('  • Multiple encoding formats');
    console.log('  • Chainable operations');
    console.log('  • Operation history');
    console.log('  • Composable with other units');
    console.log();
  }

  /**
   * Static help
   */
  static help(): void {
    console.log('\n=== Encoder Unit v1.0.0 ===');
    console.log('I can encode and decode data using multiple formats.\n');
    
    console.log('🏗️ Creation:');
    console.log('  Encoder.create()           // Base64 (default)');
    console.log('  Encoder.create("hex")      // Hex encoding');
    console.log('  Encoder.create("base64url") // Base64 URL-safe');
    console.log('  Encoder.create("uri")      // URI encoding');
    
    console.log('\n🛠️ Core Methods:');
    console.log('  encode(data)           // Encode data');
    console.log('  decode(data)           // Decode data');
    console.log('  chain(data, formats)   // Chain encodings');
    console.log('  setFormat(format)      // Change format');
    
    console.log('\n💡 Unit Pattern:');
    console.log('  • Multiple formats');
    console.log('  • Chainable operations');
    console.log('  • Operation history');
    console.log();
  }

  private performEncode(data: string): string {
    switch (this.format) {
      case 'base64':
        return this.toBase64(data);
      case 'base64url':
        return this.toBase64(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      case 'hex':
        return this.toHex(data);
      case 'uri':
        return encodeURIComponent(data);
      case 'json':
        return JSON.stringify(data);
      default:
        return data;
    }
  }

  private performDecode(data: string): string {
    switch (this.format) {
      case 'base64':
        return this.fromBase64(data);
      case 'base64url': {
        let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return this.fromBase64(base64);
      }
      case 'hex':
        return this.fromHex(data);
      case 'uri':
        return decodeURIComponent(data);
      case 'json':
        return JSON.parse(data);
      default:
        return data;
    }
  }

  private toBase64(data: string): string {
    try {
      // Try Node.js Buffer first
      const nodeBuffer = (globalThis as Record<string, unknown>)?.Buffer;
      if (nodeBuffer && typeof nodeBuffer === 'object' && 'from' in nodeBuffer) {
        return (nodeBuffer as {
          from: (data: string) => { toString: (encoding: string) => string };
        }).from(data).toString('base64');
      }
      
      // Fallback to browser btoa
      const browserBtoa = (globalThis as Record<string, unknown>)?.btoa;
      if (browserBtoa && typeof browserBtoa === 'function') {
        return (browserBtoa as (data: string) => string)(data);
      }
      
      throw new Error('No base64 encoding available');
    } catch (error) {
      throw new Error(`Base64 encoding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private fromBase64(data: string): string {
    try {
      // Try Node.js Buffer first
      const nodeBuffer = (globalThis as Record<string, unknown>)?.Buffer;
      if (nodeBuffer && typeof nodeBuffer === 'object' && 'from' in nodeBuffer) {
        return (nodeBuffer as {
          from: (data: string, encoding: string) => { toString: () => string };
        }).from(data, 'base64').toString();
      }
      
      // Fallback to browser atob
      const browserAtob = (globalThis as Record<string, unknown>)?.atob;
      if (browserAtob && typeof browserAtob === 'function') {
        return (browserAtob as (data: string) => string)(data);
      }
      
      throw new Error('No base64 decoding available');
    } catch (error) {
      throw new Error(`Base64 decoding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private toHex(data: string): string {
    return Array.from(data)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  private fromHex(data: string): string {
    const hex = data.replace(/[^0-9a-fA-F]/g, '');
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(Number.parseInt(hex.substr(i, 2), 16));
    }
    return result;
  }
}

// Pure function exports
export function encode(data: string, format: EncodingFormat = 'base64'): string {
  return Encoder.create(format).encode(data);
}

export function decode(data: string, format: EncodingFormat = 'base64'): string {
  return Encoder.create(format).decode(data);
}

export function base64Encode(data: string): string {
  return Encoder.create('base64').encode(data);
}

export function base64Decode(data: string): string {
  return Encoder.create('base64').decode(data);
}

export function hexEncode(data: string): string {
  return Encoder.create('hex').encode(data);
}

export function hexDecode(data: string): string {
  return Encoder.create('hex').decode(data);
}
