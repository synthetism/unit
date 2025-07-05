/**
 * NATIVE CAPABILITIES PATTERN EXPLANATION
 * 
 * Why we set native methods in the capabilities map
 */

import { Unit, UnitSchema, createUnitSchema } from './src/unit';

// The pattern you noticed:
// this._capabilities.set('issue', this.issueVC.bind(this));
// this._capabilities.set('verify', this.verifyVC.bind(this));

// WHY do we do this when we already have the methods?

class ExplainedUnit implements Unit {
  private _dna: UnitSchema;
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  constructor() {
    this._dna = createUnitSchema({
      name: 'explained-unit',
      version: '1.0.0',
      commands: ['issue', 'verify'],
      description: 'Demonstrates the native capabilities pattern'
    });
    
    // REASON 1: Unified Interface
    // We want execute() to work for ALL capabilities, native and learned
    this._capabilities.set('issue', this.issueVC.bind(this));
    this._capabilities.set('verify', this.verifyVC.bind(this));
    
    // REASON 2: Discoverability
    // capableOf() and getAllCapabilities() work uniformly
    
    // REASON 3: Teaching
    // teach() can expose native capabilities using the same mechanism
    
    // REASON 4: Consistency
    // No special cases - all capabilities work the same way
  }

  get dna(): UnitSchema { return this._dna; }
  whoami(): string { return 'ExplainedUnit - Shows why we use the capabilities map'; }
  
  capableOf(command: string): boolean {
    // BENEFIT: Works for both native and learned capabilities
    return this._capabilities.has(command);
  }
  
  help(): void { console.log('I explain the native capabilities pattern'); }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    // BENEFIT: Single code path for all capabilities
    const impl = this._capabilities.get(commandName);
    if (!impl) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    return impl(...args) as R;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    // BENEFIT: Can teach native capabilities using same map
    const teachable: Record<string, (...args: unknown[]) => unknown> = {};
    for (const [cap, impl] of this._capabilities) {
      // Only teach certain capabilities, not all
      if (cap === 'issue' || cap === 'verify') {
        teachable[cap] = impl;
      }
    }
    return teachable;
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    // BENEFIT: Learning works exactly the same way
    for (const capSet of capabilities) {
      for (const [cap, impl] of Object.entries(capSet)) {
        this._capabilities.set(cap, impl);
      }
    }
  }

  getAllCapabilities(): string[] {
    // BENEFIT: Returns both native and learned capabilities
    return Array.from(this._capabilities.keys());
  }

  // These are the native methods
  private async issueVC(...args: unknown[]): Promise<string> {
    const [subject, type] = args as [any, string];
    return `Native VC issued for ${subject.id} of type ${type}`;
  }

  private async verifyVC(...args: unknown[]): Promise<boolean> {
    const [vc] = args as [string];
    return vc.includes('Native VC');
  }
}

// Alternative approach WITHOUT the capabilities map
class AlternativeUnit implements Unit {
  private _dna: UnitSchema;
  private _learnedCapabilities = new Map<string, (...args: unknown[]) => unknown>();

  constructor() {
    this._dna = createUnitSchema({
      name: 'alternative-unit',
      version: '1.0.0',
      commands: ['issue', 'verify'],
      description: 'Alternative approach without unified capabilities map'
    });
  }

  get dna(): UnitSchema { return this._dna; }
  whoami(): string { return 'AlternativeUnit - Shows the problems without unified map'; }
  
  capableOf(command: string): boolean {
    // PROBLEM: Need to check multiple places
    return this._dna.commands.includes(command) || this._learnedCapabilities.has(command);
  }
  
  help(): void { console.log('I show the problems of NOT using a unified capabilities map'); }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    // PROBLEM: Complex branching logic
    if (this._dna.commands.includes(commandName)) {
      // Native capabilities
      switch (commandName) {
        case 'issue':
          return this.issueVC(...args) as R;
        case 'verify':
          return this.verifyVC(...args) as R;
        default:
          throw new Error(`Unknown native command: ${commandName}`);
      }
    } else if (this._learnedCapabilities.has(commandName)) {
      // Learned capabilities
      const impl = this._learnedCapabilities.get(commandName)!;
      return impl(...args) as R;
    } else {
      throw new Error(`Unknown command: ${commandName}`);
    }
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    // PROBLEM: Manual mapping of native methods
    return {
      issue: this.issueVC.bind(this),
      verify: this.verifyVC.bind(this)
    };
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    for (const capSet of capabilities) {
      for (const [cap, impl] of Object.entries(capSet)) {
        this._learnedCapabilities.set(cap, impl);
      }
    }
  }

  getAllCapabilities(): string[] {
    // PROBLEM: Need to merge from multiple sources
    return [...this._dna.commands, ...Array.from(this._learnedCapabilities.keys())];
  }

  private async issueVC(...args: unknown[]): Promise<string> {
    const [subject, type] = args as [any, string];
    return `Alternative VC issued for ${subject.id} of type ${type}`;
  }

  private async verifyVC(...args: unknown[]): Promise<boolean> {
    const [vc] = args as [string];
    return vc.includes('Alternative VC');
  }
}

// Demo showing the benefits
async function demonstrateNativeCapabilitiesPattern() {
  console.log('=== NATIVE CAPABILITIES PATTERN DEMO ===\n');

  const explainedUnit = new ExplainedUnit();
  const alternativeUnit = new AlternativeUnit();

  console.log('1. Unified approach (recommended):');
  console.log(`   Capabilities: ${explainedUnit.getAllCapabilities().join(', ')}`);
  console.log(`   Can issue: ${explainedUnit.capableOf('issue')}`);
  console.log(`   Can verify: ${explainedUnit.capableOf('verify')}`);

  console.log('\n2. Alternative approach (more complex):');
  console.log(`   Capabilities: ${alternativeUnit.getAllCapabilities().join(', ')}`);
  console.log(`   Can issue: ${alternativeUnit.capableOf('issue')}`);
  console.log(`   Can verify: ${alternativeUnit.capableOf('verify')}`);

  console.log('\n3. Both approaches work, but unified is simpler:');
  
  // Both work the same way externally
  const result1 = await explainedUnit.execute('issue', { id: 'user-123' }, 'TestCredential');
  const result2 = await alternativeUnit.execute('issue', { id: 'user-123' }, 'TestCredential');
  
  console.log(`   Unified result: ${result1}`);
  console.log(`   Alternative result: ${result2}`);

  console.log('\n=== KEY BENEFITS OF UNIFIED APPROACH ===');
  console.log('✅ Single code path for all capabilities');
  console.log('✅ Consistent behavior between native and learned');
  console.log('✅ Simpler implementation');
  console.log('✅ Easier to debug and maintain');
  console.log('✅ Better discoverability');

  console.log('\n=== PROBLEMS WITH ALTERNATIVE APPROACH ===');
  console.log('❌ Complex branching logic in execute()');
  console.log('❌ Multiple places to check for capabilities');
  console.log('❌ Harder to maintain and debug');
  console.log('❌ Inconsistent behavior patterns');
}

demonstrateNativeCapabilitiesPattern().catch(console.error);

export { ExplainedUnit, AlternativeUnit };
