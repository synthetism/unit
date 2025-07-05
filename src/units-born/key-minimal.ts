/**
 * Key Unit - Minimal Unit Architecture Demo
 * 
 * Shows how sync and async commands work together in practice
 * using Promise.resolve() for sync operations.
 */

import { 
  ValueObject, 
  type Unit, 
  type UnitSchema, 
  createUnitSchema 
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
export class Key extends ValueObject<KeyProps> implements Unit {
  readonly dna: UnitSchema = createUnitSchema({
    name: 'Key',
    version: '1.0.0',
    commands: ['sign', 'verify', 'getPublicKey', 'canSign', 'toJSON'],
    description: 'Cryptographic key unit for signing and verification',
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
   * Get unit identity as string
   */
  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  /**
   * Check if unit can execute a command
   */
  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  /**
   * Show help - flexible implementation
   */
  help(): void {
    console.log(`\\n🔑 ${this.whoami()}`);
    console.log(`${this.dna.description}\\n`);
    
    console.log('Available Commands:');
    for (const cmd of this.dna.commands) {
      console.log(`  • ${cmd}`);
    }
    
    console.log('\\nExample Usage:');
    console.log('  const key = await Key.generate();');
    console.log('  const canSign = await key.execute("canSign");');
    console.log('  const signature = await key.execute("sign", "hello world");');
    console.log('  const isValid = await key.execute("verify", "hello world", signature);');
  }

  /**
   * Execute a command - always returns Promise
   */
  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    if (!this.capableOf(commandName)) {
      throw new Error(`Unit '${this.dna.name}' cannot execute '${commandName}'`);
    }

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
   * Handle sign command - async (real crypto operation)
   */
  private async handleSign(data: string): Promise<string> {
    if (!this.props.privateKeyHex) {
      throw new Error('Cannot sign: no private key available');
    }

    // Simulate async crypto operation
    await new Promise(resolve => setTimeout(resolve, 1));
    
    return `signature-of-${data}-with-${this.props.id}`;
  }

  /**
   * Handle verify command - async (real crypto operation)
   */
  private async handleVerify(data: string, signature: string): Promise<boolean> {
    // Simulate async crypto operation
    await new Promise(resolve => setTimeout(resolve, 1));
    
    return signature === `signature-of-${data}-with-${this.props.id}`;
  }

  /**
   * Handle getPublicKey command - sync but returns Promise
   */
  private handleGetPublicKey(): Promise<string> {
    const pem = `-----BEGIN PUBLIC KEY-----\\n${this.props.publicKeyHex}\\n-----END PUBLIC KEY-----`;
    return Promise.resolve(pem);
  }

  /**
   * Handle canSign command - sync but returns Promise
   */
  private handleCanSign(): Promise<boolean> {
    return Promise.resolve(this.props.privateKeyHex !== null);
  }

  /**
   * Handle toJSON command - sync but returns Promise
   */
  private handleToJSON(): Promise<object> {
    const json = {
      id: this.props.id,
      publicKeyHex: this.props.publicKeyHex,
      type: this.props.type,
      meta: this.props.meta,
      canSign: this.props.privateKeyHex !== null,
    };
    return Promise.resolve(json);
  }
}
