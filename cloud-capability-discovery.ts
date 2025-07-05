/**
 * CLOUD CAPABILITY DISCOVERY
 * 
 * Automatically discover and learn capabilities from cloud registry
 * when local capabilities are missing.
 */

import { Unit, UnitSchema, createUnitSchema } from './src/unit';

// Simulated cloud registry
class CloudRegistry {
  private static units = new Map<string, () => Unit>();

  static register(name: string, version: string, factory: () => Unit) {
    const key = `${name}@${version}`;
    this.units.set(key, factory);
  }

  static async pull(name: string, version: string): Promise<Unit | null> {
    const key = `${name}@${version}`;
    const factory = this.units.get(key);
    return factory ? factory() : null;
  }

  static list(): string[] {
    return Array.from(this.units.keys());
  }
}

// Example signer unit to register in cloud
class CloudSignerUnit implements Unit {
  private _dna: UnitSchema;

  constructor() {
    this._dna = createUnitSchema({
      name: 'cloud-signer',
      version: '1.0.2',
      commands: ['sign', 'verify'],
      description: 'Cloud-based cryptographic signer'
    });
  }

  get dna(): UnitSchema { return this._dna; }
  whoami(): string { return 'CloudSigner - 100% compatible cloud signer'; }
  capableOf(command: string): boolean { return this._dna.commands.includes(command); }
  help(): void { console.log('I provide cloud-based signing capabilities'); }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    switch (commandName) {
      case 'sign':
        return this.sign(...args) as R;
      case 'verify':
        return this.verify(...args) as R;
      default:
        throw new Error(`Unknown command: ${commandName}`);
    }
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      sign: this.sign.bind(this),
      verify: this.verify.bind(this)
    };
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    // Cloud units might learn too
  }

  private async sign(...args: unknown[]): Promise<string> {
    const [data, purpose] = args as [string, string];
    return `cloud-signature-${data.length}-${purpose}-${Date.now()}`;
  }

  private async verify(...args: unknown[]): Promise<boolean> {
    const [data, signature] = args as [string, string];
    return signature.startsWith('cloud-signature-');
  }
}

// Register cloud capabilities
CloudRegistry.register('signer', '1.0.2', () => new CloudSignerUnit());

// Enhanced credential unit with cloud discovery
class SmartCredentialUnit implements Unit {
  private _dna: UnitSchema;
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  constructor() {
    this._dna = createUnitSchema({
      name: 'smart-credential-unit',
      version: '1.0.0',
      commands: ['issue', 'verify'],
      description: 'Smart credential unit with cloud discovery'
    });
    
    this._capabilities.set('issue', this.issueVC.bind(this));
    this._capabilities.set('verify', this.verifyVC.bind(this));
  }

  get dna(): UnitSchema { return this._dna; }
  whoami(): string { return 'SmartCredentialUnit - Auto-discovers capabilities'; }
  capableOf(command: string): boolean { return this._capabilities.has(command); }
  help(): void { console.log('I can auto-discover missing capabilities from the cloud'); }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    const impl = this._capabilities.get(commandName);
    if (!impl) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    return impl(...args) as R;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      issue: this.issueVC.bind(this),
      verify: this.verifyVC.bind(this)
    };
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    for (const capSet of capabilities) {
      for (const [cap, impl] of Object.entries(capSet)) {
        this._capabilities.set(cap, impl);
      }
    }
  }

  private async issueVC(...args: unknown[]): Promise<string> {
    const [subject, type, issuer] = args as [any, string, string];

    // Auto-discover missing capabilities from cloud
    if (!this._capabilities.has('sign')) {
      console.log('🔍 Missing sign capability, checking cloud...');
      
      const signer = await CloudRegistry.pull('signer', '1.0.2');
      if (signer?.teach) {
        console.log('☁️ Found compatible signer in cloud, learning...');
        this.learn([signer.teach()]);
        
        // Now we can proceed with signing
        const signature = await this._capabilities.get('sign')!(subject, type, issuer);
        return `VC issued with cloud signature: ${signature}`;
      } else {
        throw new Error(`
❌ Cannot issue credential: missing sign capability

Options:
1. Learn from a crypto unit: credential.learn([cryptoUnit.teach()])
2. Upload to Cloud version 1.0.2 for auto-discovery
3. Use existing cloud signer (not found in registry)
        `);
      }
    }

    // Use existing capability
    const signature = await this._capabilities.get('sign')!(subject, type, issuer);
    return `VC issued with signature: ${signature}`;
  }

  private async verifyVC(...args: unknown[]): Promise<boolean> {
    const [vc] = args as [string];
    
    if (!this._capabilities.has('verify')) {
      console.log('🔍 Missing verify capability, checking cloud...');
      
      const verifier = await CloudRegistry.pull('signer', '1.0.2');
      if (verifier && verifier.teach) {
        console.log('☁️ Found compatible verifier in cloud, learning...');
        this.learn([verifier.teach()]);
      } else {
        throw new Error('Cannot verify: missing verify capability and no cloud alternative');
      }
    }

    return this._capabilities.get('verify')!(vc, 'mock-signature') as Promise<boolean>;
  }
}

// Demo
async function demonstrateCloudDiscovery() {
  console.log('=== CLOUD CAPABILITY DISCOVERY DEMO ===\n');

  console.log('Available cloud units:', CloudRegistry.list());

  const credential = new SmartCredentialUnit();
  console.log(`\nCreated: ${credential.whoami()}`);

  // Try to issue without local signing capability - should auto-discover
  console.log('\n1. Attempting to issue credential (will auto-discover from cloud):');
  try {
    const vc = await credential.execute('issue', 
      { id: 'user-123', name: 'Alice' }, 
      'UniversityDegree', 
      'did:synet:university'
    );
    console.log(`✅ ${vc}`);
  } catch (error) {
    console.log(`❌ ${error}`);
  }

  // Verify also works through cloud discovery
  console.log('\n2. Verifying credential (using cloud-discovered capability):');
  try {
    const isValid = await credential.execute('verify', 'test-credential');
    console.log(`✅ Verification result: ${isValid}`);
  } catch (error) {
    console.log(`❌ ${error}`);
  }

  console.log('\n=== CLOUD DISCOVERY COMPLETE ===');
}

demonstrateCloudDiscovery().catch(console.error);

export { SmartCredentialUnit, CloudRegistry };
