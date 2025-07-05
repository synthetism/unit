/**
 * Key Unit - Born with Unit Architecture
 * 
 * A key unit that demonstrates the Unit pattern with cryptographic capabilities.
 * Uses command-based execution and capability discovery.
 */

import { 
  BaseUnit, 
  type UnitSchema, 
  type UnitCapabilities, 
  createUnitSchema, 
  createUnitCapabilities 
} from '../unit';

/**
 * Key properties interface
 */
interface KeyProps {
  id: string;
  publicKeyHex: string;
  privateKeyHex: string | null;
  type: string;
  meta: Record<string, unknown>;
}

/**
 * Key Unit implementation
 */
export class Key extends BaseUnit<KeyProps> {
  readonly dna: UnitSchema = createUnitSchema({
    name: 'Key',
    version: '1.0.0',
    description: 'Cryptographic key unit for signing and verification',
    capabilities: ['sign', 'verify', 'getPublicKey', 'canSign', 'toJSON'],
    type: 'cryptographic',
    author: 'Synet Team',
    dependencies: ['@synet/core'],
  });

  readonly capabilities: UnitCapabilities = createUnitCapabilities({
    sign: {
      description: 'Sign data with this key',
      input: { data: 'string' },
      output: { signature: 'string' },
      async: true,
    },
    verify: {
      description: 'Verify a signature against this key',
      input: { data: 'string', signature: 'string' },
      output: { valid: 'boolean' },
      async: true,
    },
    getPublicKey: {
      description: 'Get the public key in PEM format',
      output: { publicKey: 'string' },
      async: false,
    },
    canSign: {
      description: 'Check if this key can sign (has private key)',
      output: { canSign: 'boolean' },
      async: false,
    },
    toJSON: {
      description: 'Export key as JSON (excludes private key)',
      output: { json: 'object' },
      async: false,
    },
  });

  /**
   * Create a new Key unit
   */
  static create(props: KeyProps): Key {
    return new Key(props);
  }

  /**
   * Generate a new key pair
   */
  static async generate(type = 'ed25519'): Promise<Key> {
    // This would use @synet/core generateKeyPair
    // For now, we'll simulate it
    const id = `key-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    return Key.create({
      id,
      publicKeyHex: 'mock-public-key-hex',
      privateKeyHex: 'mock-private-key-hex',
      type,
      meta: { generated: true, timestamp: Date.now() },
    });
  }

  /**
   * Execute commands on this key unit
   */
  protected async executeCommand<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    switch (commandName) {
      case 'sign':
        return this.handleSign(args[0] as string) as R;
      
      case 'verify':
        return this.handleVerify(args[0] as string, args[1] as string) as R;
      
      case 'getPublicKey':
        return this.handleGetPublicKey() as R;
      
      case 'canSign':
        return this.handleCanSign() as R;
      
      case 'toJSON':
        return this.handleToJSON() as R;
      
      default:
        throw new Error(`Unknown command: ${commandName}`);
    }
  }

  /**
   * Handle sign command
   */
  private async handleSign(data: string): Promise<string> {
    if (!this.props.privateKeyHex) {
      throw new Error('Cannot sign: no private key available');
    }

    // This would use @synet/core signMessage
    // For now, we'll simulate it
    return `signature-of-${data}-with-${this.props.id}`;
  }

  /**
   * Handle verify command
   */
  private async handleVerify(data: string, signature: string): Promise<boolean> {
    // This would use @synet/core verifySignature
    // For now, we'll simulate it
    return signature === `signature-of-${data}-with-${this.props.id}`;
  }

  /**
   * Handle getPublicKey command
   */
  private handleGetPublicKey(): string {
    // This would convert hex to PEM format
    return `-----BEGIN PUBLIC KEY-----\n${this.props.publicKeyHex}\n-----END PUBLIC KEY-----`;
  }

  /**
   * Handle canSign command
   */
  private handleCanSign(): boolean {
    return this.props.privateKeyHex !== null;
  }

  /**
   * Handle toJSON command
   */
  private handleToJSON(): object {
    return {
      id: this.props.id,
      publicKeyHex: this.props.publicKeyHex,
      type: this.props.type,
      meta: this.props.meta,
      canSign: this.props.privateKeyHex !== null,
    };
  }

  /**
   * Get custom examples for this unit
   */
  protected getExamples(): string[] {
    return [
      'const key = await Key.generate();',
      'const canSign = await key.command("canSign");',
      'const signature = await key.command("sign", "hello world");',
      'const isValid = await key.command("verify", "hello world", signature);',
      'const publicKey = await key.command("getPublicKey");',
      'const json = await key.command("toJSON");',
      'console.log("Key capabilities:", key.dna.capabilities);',
      'key.help(); // Get detailed help',
    ];
  }
}
