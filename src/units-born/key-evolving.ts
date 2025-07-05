/**
 * Key Evolving Demo - Web of Capabilities
 * 
 * Demonstrates how units can teach, learn, and evolve capabilities
 * creating intelligent composite units without tight coupling.
 */

import { 
  ValueObject, 
  type Unit, 
  type UnitSchema, 
  createUnitSchema 
} from '../unit';

/**
 * Key Unit with teaching capabilities
 */
interface KeyProps {
  id: string;
  publicKeyHex: string;
  privateKeyHex: string | null;
  type: string;
}

export class Key extends ValueObject<KeyProps> implements Unit {
  readonly dna: UnitSchema = createUnitSchema({
    name: 'Key',
    version: '1.0.0',
    commands: ['sign', 'verify', 'getPublicKey', 'canSign'],
    description: 'Cryptographic key unit',
  });

  static create(props: KeyProps): Key {
    return new Key(props);
  }

  static generate(): Key {
    return Key.create({
      id: `key-${Date.now()}`,
      publicKeyHex: 'mock-public-key',
      privateKeyHex: 'mock-private-key',
      type: 'ed25519',
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🔑 ${this.whoami()} - ${this.dna.description}`);
  }

  // Native methods
  getPublicKey(): string {
    return `-----BEGIN PUBLIC KEY-----\\n${this.props.publicKeyHex}\\n-----END PUBLIC KEY-----`;
  }

  canSign(): boolean {
    return this.props.privateKeyHex !== null;
  }

  async sign(data: string): Promise<string> {
    if (!this.canSign()) throw new Error('Cannot sign');
    return `signature-of-${data}-with-${this.props.id}`;
  }

  async verify(data: string, signature: string): Promise<boolean> {
    return signature === `signature-of-${data}-with-${this.props.id}`;
  }

  // Teaching capabilities - expose bound methods
  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      getPublicKey: (...args: unknown[]) => this.getPublicKey(),
      canSign: (...args: unknown[]) => this.canSign(),
      sign: (...args: unknown[]) => this.sign(args[0] as string),
      verify: (...args: unknown[]) => this.verify(args[0] as string, args[1] as string),
    };
  }
}

/**
 * Vault Unit that can learn capabilities
 */
interface VaultProps {
  id: string;
  encrypted: boolean;
  learnedCapabilities: Record<string, (...args: unknown[]) => unknown>;
}

export class Vault extends ValueObject<VaultProps> implements Unit {
  readonly dna: UnitSchema = createUnitSchema({
    name: 'Vault',
    version: '1.0.0',
    commands: ['store', 'retrieve', 'secure'],
    description: 'Secure storage vault that can learn from other units',
  });

  static create(): Vault {
    return new Vault({
      id: `vault-${Date.now()}`,
      encrypted: true,
      learnedCapabilities: {},
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command) || command in this.props.learnedCapabilities;
  }

  help(): void {
    console.log(`🏛️ ${this.whoami()} - ${this.dna.description}`);
    console.log('Learned capabilities:', Object.keys(this.props.learnedCapabilities));
  }

  // Native vault methods
  store(data: string): string {
    return `vault-stored-${data}`;
  }

  retrieve(id: string): string {
    return `retrieved-${id}`;
  }

  // Learning from other units
  learn(capabilitiesList: Record<string, (...args: unknown[]) => unknown>[]): void {
    const allCapabilities = Object.assign({}, ...capabilitiesList);
    
    // Create new vault with learned capabilities
    Object.assign(this.props.learnedCapabilities, allCapabilities);
  }

  // Teaching own + learned capabilities
  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      store: (...args: unknown[]) => this.store(args[0] as string),
      retrieve: (...args: unknown[]) => this.retrieve(args[0] as string),
      secure: (...args: unknown[]) => 'vault-secured',
      ...this.props.learnedCapabilities, // Pass on learned capabilities
    };
  }

  // Evolution - create new unit with combined capabilities
  evolve(name: string, additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>): Unit {
    const evolvedCapabilities = {
      ...this.teach(),
      ...additionalCapabilities,
    };

    return EvolvedUnit.create(name, evolvedCapabilities);
  }
}

/**
 * Evolved Unit - created from teaching/learning process
 */
interface EvolvedUnitProps {
  name: string;
  capabilities: Record<string, (...args: unknown[]) => unknown>;
}

export class EvolvedUnit extends ValueObject<EvolvedUnitProps> implements Unit {
  readonly dna: UnitSchema;

  constructor(props: EvolvedUnitProps) {
    super(props);
    this.dna = createUnitSchema({
      name: props.name,
      version: '1.0.0',
      commands: Object.keys(props.capabilities),
      description: `Evolved unit with ${Object.keys(props.capabilities).length} capabilities`,
    });
  }

  static create(name: string, capabilities: Record<string, (...args: unknown[]) => unknown>): EvolvedUnit {
    return new EvolvedUnit({ name, capabilities });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (Evolved)`;
  }

  capableOf(command: string): boolean {
    return command in this.props.capabilities;
  }

  help(): void {
    console.log(`✨ ${this.whoami()} - ${this.dna.description}`);
    console.log('Evolved capabilities:', this.dna.commands);
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return { ...this.props.capabilities };
  }

  // Can execute any learned capability
  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    if (!this.capableOf(commandName)) {
      throw new Error(`Evolved unit cannot execute '${commandName}'`);
    }

    const capability = this.props.capabilities[commandName];
    const result = await capability(...args);
    return result as R;
  }
}
