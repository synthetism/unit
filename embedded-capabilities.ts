/**
 * LAZY UNIT CREATION FOR EMBEDDED DEVICES
 * 
 * Demonstrates how to avoid creating units just for teaching
 * in resource-constrained environments
 */

import { Unit, UnitSchema, createUnitSchema } from './src/unit';

// PROBLEM: Creating units just to teach is wasteful
// identity.learn([
//   new BasicKeyUnit().teach(),    // Creates unit just to teach
//   new SimpleCredentialUnit().teach() // Creates unit just to teach
// ]);

// SOLUTION 1: Static capability definitions
class BasicKeyCapabilities {
  static getCapabilities(): Record<string, (...args: unknown[]) => unknown> {
    return {
      generateKey: async (...args: unknown[]) => {
        const [keyType] = args as [string];
        return { id: `key-${Date.now()}`, type: keyType, publicKey: `pub-${keyType}` };
      },
      sign: async (...args: unknown[]) => {
        const [data] = args as [string];
        return `signature-${data.length}-${Date.now()}`;
      }
    };
  }
}

class SimpleCredentialCapabilities {
  static getCapabilities(): Record<string, (...args: unknown[]) => unknown> {
    return {
      issue: async (...args: unknown[]) => {
        const [subject, type] = args as [any, string];
        return { id: `cred-${Date.now()}`, subject, type };
      },
      verify: async (...args: unknown[]) => {
        const [credential] = args as [any];
        return credential.id && credential.subject;
      }
    };
  }
}

// SOLUTION 2: Capability registry with lazy loading
class CapabilityRegistry {
  private static registry = new Map<string, () => Record<string, (...args: unknown[]) => unknown>>();

  static register(name: string, factory: () => Record<string, (...args: unknown[]) => unknown>) {
    this.registry.set(name, factory);
  }

  static getCapabilities(name: string): Record<string, (...args: unknown[]) => unknown> {
    const factory = this.registry.get(name);
    if (!factory) {
      throw new Error(`Unknown capability set: ${name}`);
    }
    return factory();
  }

  static listAvailable(): string[] {
    return Array.from(this.registry.keys());
  }
}

// Register capabilities without creating units
CapabilityRegistry.register('basic-key', BasicKeyCapabilities.getCapabilities);
CapabilityRegistry.register('simple-credential', SimpleCredentialCapabilities.getCapabilities);

// SOLUTION 3: Smart identity manager with lazy loading
class EmbeddedIdentityManager implements Unit {
  private _dna: UnitSchema;
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();
  private _requiredCapabilities = ['generateKey', 'sign', 'issue', 'verify'];

  constructor() {
    this._dna = createUnitSchema({
      name: 'embedded-identity-manager',
      version: '1.0.0',
      commands: ['createIdentity', 'authenticate'],
      description: 'Embedded identity manager with lazy capability loading'
    });
    
    this._capabilities.set('createIdentity', this.createIdentity.bind(this));
    this._capabilities.set('authenticate', this.authenticate.bind(this));
  }

  get dna(): UnitSchema { return this._dna; }
  whoami(): string { return 'EmbeddedIdentityManager - Lazy capability loading'; }
  capableOf(command: string): boolean { return this._capabilities.has(command); }
  help(): void { console.log('I manage identities with efficient capability loading'); }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    const impl = this._capabilities.get(commandName);
    if (!impl) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    return impl(...args) as R;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      createIdentity: this.createIdentity.bind(this),
      authenticate: this.authenticate.bind(this)
    };
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    for (const capSet of capabilities) {
      for (const [cap, impl] of Object.entries(capSet)) {
        this._capabilities.set(cap, impl);
      }
    }
  }

  // LAZY LOADING: Only load capabilities when needed
  private async ensureCapabilities(needed: string[]): Promise<void> {
    const missing = needed.filter(cap => !this._capabilities.has(cap));
    
    if (missing.length === 0) {
      return; // All capabilities already available
    }

    console.log(`🔄 Loading missing capabilities: ${missing.join(', ')}`);

    // Load from registry instead of creating units
    const keyCapabilities = CapabilityRegistry.getCapabilities('basic-key');
    const credentialCapabilities = CapabilityRegistry.getCapabilities('simple-credential');

    // Learn only what we need
    this.learn([keyCapabilities, credentialCapabilities]);
    
    console.log(`✅ Loaded capabilities: ${missing.join(', ')}`);
  }

  private async createIdentity(...args: unknown[]): Promise<any> {
    const [userData] = args as [any];

    // Ensure we have required capabilities (lazy loading)
    await this.ensureCapabilities(['generateKey', 'sign', 'issue']);

    // Now use the capabilities
    const keyData = await this._capabilities.get('generateKey')!(userData.keyType || 'Ed25519');
    const credential = await this._capabilities.get('issue')!(userData, 'Identity');

    return {
      id: userData.id,
      keyData,
      credential
    };
  }

  private async authenticate(...args: unknown[]): Promise<boolean> {
    const [credential] = args as [any];

    // Ensure we have verification capability
    await this.ensureCapabilities(['verify']);

    return this._capabilities.get('verify')!(credential) as Promise<boolean>;
  }
}

// SOLUTION 4: Capability bundles for common scenarios
class EmbeddedCapabilityBundles {
  static minimal(): Record<string, (...args: unknown[]) => unknown> {
    return {
      ...BasicKeyCapabilities.getCapabilities(),
      ...SimpleCredentialCapabilities.getCapabilities()
    };
  }

  static full(): Record<string, (...args: unknown[]) => unknown> {
    return {
      ...this.minimal(),
      // Add more capabilities as needed
      store: async (...args: unknown[]) => {
        const [key, value] = args as [string, any];
        console.log(`Stored ${key}: ${JSON.stringify(value)}`);
        return { stored: true, key };
      }
    };
  }
}

// Demo
async function demonstrateEmbeddedApproach() {
  console.log('=== EMBEDDED DEVICE APPROACH DEMO ===\n');

  console.log('Available capability sets:', CapabilityRegistry.listAvailable());

  // Approach 1: Direct capability loading (most efficient)
  console.log('\n1. Direct capability loading:');
  const identity1 = new EmbeddedIdentityManager();
  
  const result1 = await identity1.execute('createIdentity', { 
    id: 'alice-123', 
    name: 'Alice', 
    keyType: 'Ed25519' 
  });
  console.log(`✅ Identity created: ${JSON.stringify(result1)}`);

  // Approach 2: Bundle loading
  console.log('\n2. Bundle loading:');
  const identity2 = new EmbeddedIdentityManager();
  identity2.learn([EmbeddedCapabilityBundles.minimal()]);
  
  const result2 = await identity2.execute('createIdentity', { 
    id: 'bob-456', 
    name: 'Bob', 
    keyType: 'secp256k1' 
  });
  console.log(`✅ Identity created: ${JSON.stringify(result2)}`);

  console.log('\n=== EMBEDDED APPROACH BENEFITS ===');
  console.log('✅ No unnecessary unit creation');
  console.log('✅ Lazy loading saves memory');
  console.log('✅ Capability bundles for common scenarios');
  console.log('✅ Registry pattern for discoverability');
  console.log('✅ Perfect for embedded/resource-constrained environments');
}

demonstrateEmbeddedApproach().catch(console.error);

export { EmbeddedIdentityManager, CapabilityRegistry, EmbeddedCapabilityBundles };
