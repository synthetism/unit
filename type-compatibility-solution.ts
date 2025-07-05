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

import { Unit, UnitSchema, ValueObject, createUnitSchema } from './src/unit';

// ==========================================
// SIMULATION: Different @synet/unit versions
// ==========================================

// This would represent the core issue: different versions of Unit interface
// In reality, these would be from different package versions

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
// CROSS-PACKAGE COMPATIBILITY DEMO
// ==========================================

async function demonstrateCrossPackageCompatibility() {
  console.log('\n\n=== CROSS-PACKAGE COMPATIBILITY DEMO ===\n');

  // Simulate scenario where units come from different packages
  // with different @synet/unit versions
  class IdentityUnit implements Unit {
    private _dna: UnitSchema;
    private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

    constructor() {
      this._dna = createUnitSchema({
        name: 'identity-unit',
        version: '1.0.0',
        commands: ['authenticate', 'authorize'],
        description: 'Authentication & Authorization'
      });
      
      this._capabilities.set('authenticate', this.authenticate.bind(this));
      this._capabilities.set('authorize', this.authorize.bind(this));
    }

    get dna(): UnitSchema { return this._dna; }
    whoami(): string { return 'IdentityUnit - Authentication & Authorization'; }
    capableOf(command: string): boolean { return this._capabilities.has(command); }
    help(): void { console.log('I handle identity operations and can learn credential capabilities.'); }

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

    getAllCapabilities(): string[] {
      return Array.from(this._capabilities.keys());
    }

    private async authenticate(...args: unknown[]): Promise<boolean> {
      const [credentials] = args;
      // Need to verify credentials - but we don't have this capability natively
      if (!this._capabilities.has('verify')) {
        throw new Error('Cannot authenticate: no credential verification capability');
      }
      
      return this._capabilities.get('verify')!(credentials) as Promise<boolean>;
    }

    private async authorize(...args: unknown[]): Promise<boolean> {
      const [user, resource] = args;
      // Mock authorization logic
      return (user as any).id === 'authorized-user';
    }
  }

  // Create units from "different packages"
  const identityUnit = new IdentityUnit();      // From @synet/identity
  const credentialUnit = new CredentialUnit();  // From @synet/credential
  const signingUnit = new SigningUnit();        // From @synet/crypto

  console.log('1. Units from different packages:');
  console.log(`   Identity: ${identityUnit.whoami()}`);
  console.log(`   Credential: ${credentialUnit.whoami()}`);
  console.log(`   Signing: ${signingUnit.whoami()}`);

  console.log('\n2. Cross-package learning:');
  
  // First, credential unit learns from signing unit
  credentialUnit.learn([signingUnit.teach()]);
  console.log(`   Credential learned: ${credentialUnit.getAllCapabilities().join(', ')}`);

  // Identity unit learns from credential unit
  identityUnit.learn([credentialUnit.teach()]);
  console.log(`   Identity learned: ${identityUnit.getAllCapabilities().join(', ')}`);

  console.log('\n3. Transitive learning (Identity → Credential → Signing):');
  // Identity can now authenticate because it learned verify from credential,
  // which learned cryptoVerify from signing
  try {
    const authenticated = await identityUnit.execute('authenticate', 'VC with signature-456');
    console.log(`   ✅ Authentication successful: ${authenticated}`);
  } catch (error) {
    console.log(`   ❌ Authentication failed: ${error}`);
  }

  console.log('\n=== CROSS-PACKAGE BENEFITS ===');
  console.log('✅ No version conflicts between @synet/identity and @synet/credential');
  console.log('✅ Units compose regardless of their package origin');
  console.log('✅ Learning creates capability chains across packages');
  console.log('✅ Zero tight coupling between packages');
  console.log('✅ Progressive capability acquisition');
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

if (require.main === module) {
  demonstrateTypeSafety()
    .then(() => demonstrateCrossPackageCompatibility())
    .then(() => demonstrateAPIDesignPatterns())
    .catch(console.error);
}

export {
  CredentialUnit,
  SigningUnit,
  demonstrateTypeSafety,
  demonstrateCrossPackageCompatibility,
  demonstrateAPIDesignPatterns
};

  // Native capabilities
  private async issueVC(subject: any, type: string, issuerDid: string): Promise<string> {
    // Check if we have signing capability
    if (!this._capabilities.has('sign')) {
      throw new Error('Cannot issue VC: no signing capability. Please learn from a signing unit.');
    }

    // Use learned signing capability
    const signature = await this._capabilities.get('sign')!(subject, type, issuerDid);
    return `VC issued for ${subject.id} with signature: ${signature}`;
  }

  private async verifyVC(vc: string): Promise<boolean> {
    // Check if we have verification capability
    if (!this._capabilities.has('verify')) {
      throw new Error('Cannot verify VC: no verification capability. Please learn from a verification unit.');
    }

    // Use learned verification capability
    return this._capabilities.get('verify')!(vc);
  }
}

class SigningUnit implements Unit {
  private _dna = 'signing-unit';
  private _privateKey = 'mock-private-key';

  get dna(): string {
    return this._dna;
  }

  whoami(): string {
    return 'SigningUnit - Digital signature provider';
  }

  capableOf(): string[] {
    return ['sign', 'verify'];
  }

  help(): string {
    return 'I can sign and verify digital signatures using cryptographic keys.';
  }

  async execute(capability: string, ...args: any[]): Promise<any> {
    switch (capability) {
      case 'sign':
        return this.sign(...args);
      case 'verify':
        return this.verify(...args);
      default:
        throw new Error(`Unknown capability: ${capability}`);
    }
  }

  private async sign(subject: any, type: string, issuerDid: string): Promise<string> {
    // Mock signing implementation
    const data = JSON.stringify({ subject, type, issuerDid });
    return `signature-${data.length}-${this._privateKey.slice(0, 8)}`;
  }

  private async verify(vc: string): Promise<boolean> {
    // Mock verification implementation
    return vc.includes('signature-');
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
  console.log(`   ${credentialUnit.capableOf().join(', ')}`);

  console.log('\n3. Signing unit capabilities:');
  console.log(`   ${signingUnit.capableOf().join(', ')}`);

  // THE MAGIC: Learning instead of parameter passing
  console.log('\n4. Credential unit learns signing capabilities:');
  await credentialUnit.learn(signingUnit, ['sign', 'verify']);
  console.log(`   Learned: ${credentialUnit.capableOf().join(', ')}`);

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
// CROSS-PACKAGE COMPATIBILITY DEMO
// ==========================================

async function demonstrateCrossPackageCompatibility() {
  console.log('\n\n=== CROSS-PACKAGE COMPATIBILITY DEMO ===\n');

  // Simulate scenario where units come from different packages
  // with different @synet/unit versions
  class IdentityUnit implements Unit {
    private _dna = 'identity-unit';
    private _capabilities = new Map<string, Function>();

    constructor() {
      this._capabilities.set('authenticate', this.authenticate.bind(this));
      this._capabilities.set('authorize', this.authorize.bind(this));
    }

    get dna(): string { return this._dna; }
    whoami(): string { return 'IdentityUnit - Authentication & Authorization'; }
    capableOf(): string[] { return Array.from(this._capabilities.keys()); }
    help(): string { return 'I handle identity operations and can learn credential capabilities.'; }

    async execute(capability: string, ...args: any[]): Promise<any> {
      const impl = this._capabilities.get(capability);
      if (!impl) {
        throw new Error(`Unknown capability: ${capability}`);
      }
      return impl(...args);
    }

    async learn(teachers: Unit | Unit[], capabilities?: string[]): Promise<void> {
      const teacherArray = Array.isArray(teachers) ? teachers : [teachers];
      
      for (const teacher of teacherArray) {
        const teacherCaps = teacher.capableOf();
        const capsToLearn = capabilities || teacherCaps;
        
        for (const cap of capsToLearn) {
          if (teacherCaps.includes(cap) && teacher.execute) {
            this._capabilities.set(cap, async (...args: any[]) => {
              return teacher.execute!(cap, ...args);
            });
          }
        }
      }
    }

    private async authenticate(credentials: any): Promise<boolean> {
      // Need to verify credentials - but we don't have this capability natively
      if (!this._capabilities.has('verify')) {
        throw new Error('Cannot authenticate: no credential verification capability');
      }
      
      return this._capabilities.get('verify')!(credentials);
    }

    private async authorize(user: any, resource: any): Promise<boolean> {
      // Mock authorization logic
      return user.id === 'authorized-user';
    }
  }

  // Create units from "different packages"
  const identityUnit = new IdentityUnit();      // From @synet/identity
  const credentialUnit = new CredentialUnit();  // From @synet/credential
  const signingUnit = new SigningUnit();        // From @synet/crypto

  console.log('1. Units from different packages:');
  console.log(`   Identity: ${identityUnit.whoami()}`);
  console.log(`   Credential: ${credentialUnit.whoami()}`);
  console.log(`   Signing: ${signingUnit.whoami()}`);

  console.log('\n2. Cross-package learning:');
  
  // Identity unit learns from credential unit
  await identityUnit.learn(credentialUnit, ['verify']);
  console.log(`   Identity learned: ${identityUnit.capableOf().join(', ')}`);

  // Credential unit learns from signing unit
  await credentialUnit.learn(signingUnit, ['sign', 'verify']);
  console.log(`   Credential learned: ${credentialUnit.capableOf().join(', ')}`);

  console.log('\n3. Transitive learning (Identity → Credential → Signing):');
  // Identity can now authenticate because it learned verify from credential,
  // which learned verify from signing
  try {
    const authenticated = await identityUnit.execute('authenticate', 'VC with signature-456');
    console.log(`   ✅ Authentication successful: ${authenticated}`);
  } catch (error) {
    console.log(`   ❌ Authentication failed: ${error}`);
  }

  console.log('\n=== CROSS-PACKAGE BENEFITS ===');
  console.log('✅ No version conflicts between @synet/identity and @synet/credential');
  console.log('✅ Units compose regardless of their package origin');
  console.log('✅ Learning creates capability chains across packages');
  console.log('✅ Zero tight coupling between packages');
  console.log('✅ Progressive capability acquisition');
}

// ==========================================
// RUN DEMONSTRATIONS
// ==========================================

if (require.main === module) {
  demonstrateTypeSafety()
    .then(() => demonstrateCrossPackageCompatibility())
    .catch(console.error);
}

export {
  CredentialUnit,
  SigningUnit,
  demonstrateTypeSafety,
  demonstrateCrossPackageCompatibility
};
