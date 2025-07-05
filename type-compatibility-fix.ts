/**
 * FIXING TYPE COMPATIBILITY IN MOCK FUNCTIONS
 * 
 * Shows how to properly type mock functions for learning
 */

import { Unit, UnitSchema, createUnitSchema } from './src/unit';

// ❌ WRONG: Specific parameter types cause compatibility issues
const wrongMockCrypto = {
  sign: async (data: string, purpose: string) => {
    return `mock-signature-${data.length}-${purpose}`;
  },
  verify: async (data: string, signature: string) => {
    return signature.startsWith('mock-signature-');
  }
};

// ✅ CORRECT: Use unknown[] for parameters to match Unit interface
const correctMockCrypto = {
  sign: async (...args: unknown[]) => {
    const [data, purpose] = args as [string, string];
    return `mock-signature-${data.length}-${purpose}`;
  },
  verify: async (...args: unknown[]) => {
    const [data, signature] = args as [string, string];
    return signature.startsWith('mock-signature-');
  },
  hash: async (...args: unknown[]) => {
    const [data] = args as [string];
    return `hash-${data.length}-${Date.now()}`;
  }
};

// Example unit using the correct mock
class FixedCredentialUnit implements Unit {
  private _dna: UnitSchema;
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  constructor() {
    this._dna = createUnitSchema({
      name: 'fixed-credential-unit',
      version: '1.0.0',
      commands: ['issue', 'verify'],
      description: 'Fixed credential unit with proper type compatibility'
    });
    
    this._capabilities.set('issue', this.issueVC.bind(this));
    this._capabilities.set('verify', this.verifyVC.bind(this));
  }

  get dna(): UnitSchema { return this._dna; }
  whoami(): string { return 'FixedCredentialUnit - Type-safe learning'; }
  capableOf(command: string): boolean { return this._capabilities.has(command); }
  help(): void { console.log('I demonstrate proper type-safe capability learning'); }

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
        console.log(`📚 Learned capability: ${cap}`);
      }
    }
  }

  getAllCapabilities(): string[] {
    return Array.from(this._capabilities.keys());
  }

  private async issueVC(...args: unknown[]): Promise<string> {
    const [subject, type, issuer] = args as [any, string, string];
    
    if (!this._capabilities.has('sign')) {
      throw new Error('Cannot issue credential: missing sign capability');
    }

    const signature = await this._capabilities.get('sign')!(subject, type, issuer);
    return `VC issued for ${subject.id} with signature: ${signature}`;
  }

  private async verifyVC(...args: unknown[]): Promise<boolean> {
    const [vc] = args as [string];
    
    if (!this._capabilities.has('verify')) {
      throw new Error('Cannot verify credential: missing verify capability');
    }

    return this._capabilities.get('verify')!(vc, 'mock-signature') as Promise<boolean>;
  }
}

// Demo showing the fix
async function demonstrateTypeCompatibility() {
  console.log('=== TYPE COMPATIBILITY FIX DEMO ===\n');

  const credential = new FixedCredentialUnit();
  console.log(`Created: ${credential.whoami()}`);
  console.log(`Initial capabilities: ${credential.getAllCapabilities().join(', ')}`);

  // ✅ This now works without type errors
  console.log('\n1. Learning from properly typed mock:');
  credential.learn([correctMockCrypto]);
  console.log(`Updated capabilities: ${credential.getAllCapabilities().join(', ')}`);

  // Test the learned capabilities
  console.log('\n2. Using learned capabilities:');
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

  console.log('\n=== TYPE COMPATIBILITY DEMO COMPLETE ===');
}

demonstrateTypeCompatibility().catch(console.error);

export { FixedCredentialUnit, correctMockCrypto };
