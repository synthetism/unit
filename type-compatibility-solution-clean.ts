/**
 * SYNET UNIT ARCHITECTURE - TYPE COMPATIBILITY SOLUTION
 * 
 * This demo showcases how the learning pattern solves the type compatibility problem
 * when passing Units between packages with different @synet/unit versions.
 * 
 * THE PROBLEM:
 * - @synet/credential depends on @synet/unit@1.0.2
 * - @synet/identity depends on @synet/unit@1.0.1
 * - Passing Units between them breaks due to type incompatibility
 * 
 * THE SOLUTION:
 * - Use learning pattern instead of parameter passing
 * - Units learn capabilities at runtime
 * - No more version-dependent type parameters
 * 
 * @author Synet Team
 */

import { Unit, UnitSchema, createUnitSchema } from './src/unit';

// ==========================================
// NEW WAY: Learning Pattern (WORKS)
// ==========================================

class CredentialUnit implements Unit {
  private _dna: UnitSchema;
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  constructor() {
    this._dna = createUnitSchema({
      name: 'credential-unit',
      version: '1.0.0',
      commands: ['issue', 'verify'],
      description: 'Issues and verifies W3C credentials'
    });
    
    // Native capabilities
    this._capabilities.set('issue', this.issueVC.bind(this));
    this._capabilities.set('verify', this.verifyVC.bind(this));
  }

  get dna(): UnitSchema {
    return this._dna;
  }

  whoami(): string {
    return 'CredentialUnit - Issues and verifies W3C credentials';
  }

  capableOf(command: string): boolean {
    return this._capabilities.has(command);
  }

  help(): void {
    console.log('I can issue and verify W3C credentials. I can learn signing capabilities.');
  }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    const impl = this._capabilities.get(commandName);
    if (!impl) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    return impl(...args) as R;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    const teachable: Record<string, (...args: unknown[]) => unknown> = {};
    for (const [cap, impl] of this._capabilities) {
      teachable[cap] = impl;
    }
    return teachable;
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    for (const capSet of capabilities) {
      for (const [cap, impl] of Object.entries(capSet)) {
        this._capabilities.set(cap, impl);
      }
    }
  }

  // Helper method to get all capabilities as string array
  getAllCapabilities(): string[] {
    return Array.from(this._capabilities.keys());
  }

  // Native capabilities
  private async issueVC(...args: unknown[]): Promise<string> {
    const [subject, type, issuerDid] = args;
    
    // Check if we have signing capability
    if (!this._capabilities.has('sign')) {
      throw new Error('Cannot issue VC: no signing capability. Please learn from a signing unit.');
    }

    // Use learned signing capability
    const signature = await this._capabilities.get('sign')!(subject, type, issuerDid);
    return `VC issued for ${(subject as any).id} with signature: ${signature}`;
  }

  private async verifyVC(...args: unknown[]): Promise<boolean> {
    const [vc] = args;
    
    // Check if we have cryptographic verification capability
    if (!this._capabilities.has('cryptoVerify')) {
      throw new Error('Cannot verify VC: no cryptographic verification capability. Please learn from a crypto unit.');
    }

    // Use learned verification capability
    return this._capabilities.get('cryptoVerify')!(vc) as Promise<boolean>;
  }
}

class SigningUnit implements Unit {
  private _dna: UnitSchema;
  private _privateKey = 'mock-private-key';

  constructor() {
    this._dna = createUnitSchema({
      name: 'signing-unit',
      version: '1.0.0',
      commands: ['sign', 'cryptoVerify'],
      description: 'Digital signature provider'
    });
  }

  get dna(): UnitSchema {
    return this._dna;
  }

  whoami(): string {
    return 'SigningUnit - Digital signature provider';
  }

  capableOf(command: string): boolean {
    return this._dna.commands.includes(command);
  }

  help(): void {
    console.log('I can sign and verify digital signatures using cryptographic keys.');
  }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    switch (commandName) {
      case 'sign':
        return this.sign(...args) as R;
      case 'cryptoVerify':
        return this.cryptoVerify(...args) as R;
      default:
        throw new Error(`Unknown command: ${commandName}`);
    }
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      sign: this.sign.bind(this),
      cryptoVerify: this.cryptoVerify.bind(this)
    };
  }

  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    // This unit doesn't learn - it only teaches
    console.log('SigningUnit is a foundational unit - it teaches but doesn\'t learn');
  }

  private async sign(...args: unknown[]): Promise<string> {
    const [subject, type, issuerDid] = args;
    // Mock signing implementation
    const data = JSON.stringify({ subject, type, issuerDid });
    return `signature-${data.length}-${this._privateKey.slice(0, 8)}`;
  }

  private async cryptoVerify(...args: unknown[]): Promise<boolean> {
    const [vc] = args;
    // Mock verification implementation
    return typeof vc === 'string' && vc.includes('signature-');
  }
}

// ==========================================
// DEMONSTRATION: Version-Agnostic Operation
// ==========================================

async function demonstrateTypeSafety() {
  console.log('=== SYNET UNIT TYPE COMPATIBILITY SOLUTION ===\n');

  // Create units (they could be from different package versions)
  const credentialUnit = new CredentialUnit();
  const signingUnit = new SigningUnit();

  console.log('1. Units created independently:');
  console.log(`   ${credentialUnit.whoami()}`);
  console.log(`   ${signingUnit.whoami()}`);

  console.log('\n2. Credential unit capabilities (before learning):');
  console.log(`   ${credentialUnit.getAllCapabilities().join(', ')}`);

  console.log('\n3. Signing unit capabilities:');
  console.log(`   ${signingUnit.dna.commands.join(', ')}`);

  // THE MAGIC: Learning instead of parameter passing
  console.log('\n4. Credential unit learns signing capabilities:');
  const signingCapabilities = signingUnit.teach();
  credentialUnit.learn([signingCapabilities]);
  console.log(`   Learned: ${credentialUnit.getAllCapabilities().join(', ')}`);

  // Now credential unit can operate without type compatibility issues
  console.log('\n5. Issue credential using learned capabilities:');
  try {
    const vc = await credentialUnit.execute('issue', 
      { id: 'user-123', name: 'Alice' }, 
      'VerifiableCredential', 
      'did:synet:issuer-456'
    );
    console.log(`   ✅ ${vc}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
  }

  console.log('\n6. Verify credential using learned capabilities:');
  try {
    const isValid = await credentialUnit.execute('verify', 'VC with signature-123');
    console.log(`   ✅ Valid: ${isValid}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
  }

  console.log('\n=== KEY INSIGHTS ===');
  console.log('✅ No type compatibility issues between package versions');
  console.log('✅ Units learn capabilities at runtime');
  console.log('✅ Zero-dependency design - no @synet/unit version conflicts');
  console.log('✅ Composable and evolvable architecture');
  console.log('✅ Self-contained units with progressive capabilities');
}

// ==========================================
// API DESIGN PATTERN COMPARISON
// ==========================================

async function demonstrateAPIDesignPatterns() {
  console.log('\n\n=== API DESIGN PATTERN COMPARISON ===\n');

  console.log('OLD WAY - Parameter Passing (causes version conflicts):');
  console.log('```typescript');
  console.log('// In @synet/credential');
  console.log('export async function issueVC(key: Unit, subject: any) {');
  console.log('  // TypeScript error if key is from different @synet/unit version!');
  console.log('  return key.execute("sign", subject);');
  console.log('}');
  console.log('```');

  console.log('\nNEW WAY - Learning Pattern (version-agnostic):');
  console.log('```typescript');
  console.log('// In @synet/credential');
  console.log('export class CredentialUnit implements Unit {');
  console.log('  async execute(command: string, ...args: unknown[]) {');
  console.log('    if (command === "issue") {');
  console.log('      // Use learned signing capability');
  console.log('      return this.capabilities.get("sign")!(...args);');
  console.log('    }');
  console.log('  }');
  console.log('}');
  console.log('```');

  console.log('\n=== USAGE COMPARISON ===');
  
  console.log('\nOLD WAY - Breaks with version mismatches:');
  console.log('```typescript');
  console.log('import { Credential } from "@synet/credential"; // v1.0.2');
  console.log('import { Key } from "@synet/keys";             // v1.0.1');
  console.log('');
  console.log('const key = Key.create();');
  console.log('const vc = await Credential.issueVC(key, subject); // ❌ Type error!');
  console.log('```');

  console.log('\nNEW WAY - Always works:');
  console.log('```typescript');
  console.log('import { CredentialUnit } from "@synet/credential"; // v1.0.2');
  console.log('import { SigningUnit } from "@synet/crypto";        // v1.0.1');
  console.log('');
  console.log('const credential = new CredentialUnit();');
  console.log('const signer = new SigningUnit();');
  console.log('');
  console.log('credential.learn([signer.teach()]);                // ✅ Always works!');
  console.log('const vc = await credential.execute("issue", subject);');
  console.log('```');
}

// ==========================================
// RUN DEMONSTRATIONS
// ==========================================

// Run the demonstrations
demonstrateTypeSafety()
  .then(() => demonstrateAPIDesignPatterns())
  .catch(console.error);

export {
  CredentialUnit,
  SigningUnit,
  demonstrateTypeSafety,
  demonstrateAPIDesignPatterns
};
