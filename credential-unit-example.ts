/**
 * SYNET CREDENTIAL UNIT - Learning Pattern Implementation
 * 
 * This demonstrates how @synet/credential would implement the learning pattern
 * to eliminate type compatibility issues while maintaining full functionality.
 * 
 * Key features:
 * - Zero dependency on specific @synet/unit versions
 * - Progressive capability acquisition
 * - Clear error messages for missing capabilities
 * - Backward compatibility through dual API support
 * 
 * @author Synet Team
 */

import { Unit, UnitSchema, createUnitSchema } from './src/unit';

// ==========================================
// CORE TYPES (package-local, no external deps)
// ==========================================

interface CredentialSubject {
  id: string;
  [key: string]: any;
}

interface VerifiableCredential {
  '@context': string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    signature: string;
  };
}

// ==========================================
// CREDENTIAL UNIT IMPLEMENTATION
// ==========================================

export class CredentialUnit implements Unit {
  private _dna: UnitSchema;
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  constructor() {
    this._dna = createUnitSchema({
      name: 'credential-unit',
      version: '1.0.0',
      commands: ['issue', 'verify', 'revoke', 'status'],
      description: 'W3C Verifiable Credential operations with learning capabilities'
    });
    
    // Native capabilities - these work without any external dependencies
    this._capabilities.set('issue', this.issueVC.bind(this));
    this._capabilities.set('verify', this.verifyVC.bind(this));
    this._capabilities.set('revoke', this.revokeVC.bind(this));
    this._capabilities.set('status', this.checkStatus.bind(this));
  }

  get dna(): UnitSchema {
    return this._dna;
  }

  whoami(): string {
    return 'CredentialUnit - W3C Verifiable Credential operations';
  }

  capableOf(command: string): boolean {
    return this._capabilities.has(command);
  }

  help(): void {
    console.log(`
🎓 CredentialUnit Help

Native Capabilities:
- issue: Create W3C Verifiable Credentials
- verify: Verify credential signatures and structure
- revoke: Mark credentials as revoked
- status: Check credential status

Learning Capabilities:
- sign: Learn digital signing from crypto units
- hash: Learn hashing from crypto units
- store: Learn storage from filesystem units
- network: Learn network operations from network units

Usage:
1. Create unit: const credential = new CredentialUnit()
2. Learn capabilities: credential.learn([cryptoUnit.teach()])
3. Execute operations: await credential.execute('issue', subject, type, issuer)

Required Capabilities:
- 'sign' capability needed for credential issuance
- 'hash' capability needed for credential IDs
- 'store' capability needed for credential persistence
- 'network' capability needed for revocation list updates
    `);
  }

  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    const impl = this._capabilities.get(commandName);
    if (!impl) {
      throw new Error(`Unknown command: ${commandName}. Available: ${this.getAllCapabilities().join(', ')}`);
    }
    return impl(...args) as R;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    // Only teach our core credential capabilities
    return {
      issue: this.issueVC.bind(this),
      verify: this.verifyVC.bind(this),
      revoke: this.revokeVC.bind(this),
      status: this.checkStatus.bind(this)
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

  // ==========================================
  // NATIVE CAPABILITIES
  // ==========================================

  private async issueVC(...args: unknown[]): Promise<VerifiableCredential> {
    const [subject, type, issuer, options] = args as [
      CredentialSubject,
      string | string[],
      string,
      { expirationDate?: string } | undefined
    ];

    // Validate required capabilities
    if (!this._capabilities.has('sign')) {
      throw new Error(`
❌ Cannot issue credential: missing 'sign' capability

To fix this, learn from a crypto unit:
  const crypto = new CryptoUnit();
  credential.learn([crypto.teach()]);

Or use a signing unit:
  const signer = new SigningUnit();
  credential.learn([signer.teach()]);
      `);
    }

    // Generate credential ID (use hash capability if available)
    let credentialId: string;
    if (this._capabilities.has('hash')) {
      const hashData = JSON.stringify({ subject, type, issuer, timestamp: Date.now() });
      credentialId = await this._capabilities.get('hash')!(hashData) as string;
    } else {
      // Fallback to simple ID generation
      credentialId = `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Create credential
    const credential: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: Array.isArray(type) ? ['VerifiableCredential', ...type] : ['VerifiableCredential', type],
      issuer,
      issuanceDate: new Date().toISOString(),
      credentialSubject: { ...subject, id: subject.id || credentialId },
      proof: {
        type: 'JsonWebSignature2020',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: `${issuer}#keys-1`,
        signature: '' // Will be filled by signing
      }
    };

    // Add expiration date if provided
    if (options?.expirationDate) {
      (credential as any).expirationDate = options.expirationDate;
    }

    // Sign the credential
    const dataToSign = JSON.stringify({
      '@context': credential['@context'],
      type: credential.type,
      issuer: credential.issuer,
      issuanceDate: credential.issuanceDate,
      credentialSubject: credential.credentialSubject
    });

    const signature = await this._capabilities.get('sign')!(dataToSign, 'credential') as string;
    credential.proof.signature = signature;

    // Store credential if storage capability is available
    if (this._capabilities.has('store')) {
      try {
        await this._capabilities.get('store')!(`credentials/${credentialId}.json`, JSON.stringify(credential, null, 2));
        console.log(`💾 Credential stored: credentials/${credentialId}.json`);
      } catch (error) {
        console.warn(`⚠️ Failed to store credential: ${error}`);
      }
    }

    return credential;
  }

  private async verifyVC(...args: unknown[]): Promise<{ valid: boolean; reason?: string }> {
    const [credential] = args as [VerifiableCredential];

    // Basic structure validation
    if (!credential || typeof credential !== 'object') {
      return { valid: false, reason: 'Invalid credential structure' };
    }

    if (!credential.proof || !credential.proof.signature) {
      return { valid: false, reason: 'Missing proof or signature' };
    }

    // Check expiration
    if ((credential as any).expirationDate) {
      const expiry = new Date((credential as any).expirationDate);
      if (expiry < new Date()) {
        return { valid: false, reason: 'Credential expired' };
      }
    }

    // Verify signature if we have the capability
    if (this._capabilities.has('verify')) {
      const dataToVerify = JSON.stringify({
        '@context': credential['@context'],
        type: credential.type,
        issuer: credential.issuer,
        issuanceDate: credential.issuanceDate,
        credentialSubject: credential.credentialSubject
      });

      try {
        const isValidSignature = await this._capabilities.get('verify')!(dataToVerify, credential.proof.signature) as boolean;
        if (!isValidSignature) {
          return { valid: false, reason: 'Invalid signature' };
        }
      } catch (error) {
        return { valid: false, reason: `Signature verification failed: ${error}` };
      }
    } else {
      console.warn('⚠️ Cannot verify signature: missing verify capability');
    }

    return { valid: true };
  }

  private async revokeVC(...args: unknown[]): Promise<{ revoked: boolean; reason?: string }> {
    const [credentialId] = args as [string];

    // Check if we have network capability for revocation list updates
    if (this._capabilities.has('network')) {
      try {
        await this._capabilities.get('network')!('POST', '/revocations', { credentialId, revokedAt: new Date().toISOString() });
        console.log(`🚫 Credential revoked: ${credentialId}`);
        return { revoked: true };
      } catch (error) {
        return { revoked: false, reason: `Failed to update revocation list: ${error}` };
      }
    } else {
      // Local revocation (if storage is available)
      if (this._capabilities.has('store')) {
        try {
          const revocationRecord = {
            credentialId,
            revokedAt: new Date().toISOString(),
            reason: 'Revoked by issuer'
          };
          await this._capabilities.get('store')!(`revocations/${credentialId}.json`, JSON.stringify(revocationRecord, null, 2));
          console.log(`🚫 Credential revoked locally: ${credentialId}`);
          return { revoked: true };
        } catch (error) {
          return { revoked: false, reason: `Failed to store revocation: ${error}` };
        }
      } else {
        return { revoked: false, reason: 'No network or storage capability for revocation' };
      }
    }
  }

  private async checkStatus(...args: unknown[]): Promise<{ active: boolean; revoked?: boolean; reason?: string }> {
    const [credentialId] = args as [string];

    // Check revocation status
    if (this._capabilities.has('network')) {
      try {
        const response = await this._capabilities.get('network')!('GET', `/status/${credentialId}`) as { active: boolean; revoked?: boolean };
        return response;
      } catch (error) {
        console.warn(`⚠️ Failed to check online status: ${error}`);
      }
    }

    // Check local revocation
    if (this._capabilities.has('store')) {
      try {
        const revocationData = await this._capabilities.get('store')!(`revocations/${credentialId}.json`) as string;
        if (revocationData) {
          return { active: false, revoked: true, reason: 'Found in local revocation list' };
        }
      } catch (error) {
        // Not found in revocation list - assume active
      }
    }

    return { active: true };
  }
}

// ==========================================
// CONVENIENCE FUNCTIONS (Legacy Support)
// ==========================================

/**
 * Legacy function for backward compatibility
 * @deprecated Use CredentialUnit with learning pattern instead
 */
export async function issueVC(
  subject: CredentialSubject,
  type: string | string[],
  issuer: string,
  options?: { expirationDate?: string }
): Promise<VerifiableCredential> {
  console.warn('⚠️ issueVC function is deprecated. Use CredentialUnit with learning pattern instead.');
  
  const unit = new CredentialUnit();
  
  // This will fail unless user has set up capabilities
  return unit.execute('issue', subject, type, issuer, options);
}

// ==========================================
// DEMO USAGE
// ==========================================

async function demonstrateCredentialUnit() {
  console.log('=== CREDENTIAL UNIT DEMONSTRATION ===\n');

  // Create credential unit
  const credential = new CredentialUnit();
  console.log(`Created: ${credential.whoami()}`);
  console.log(`Initial capabilities: ${credential.getAllCapabilities().join(', ')}`);

  // Try to issue without learning (should fail)
  console.log('\n1. Attempt to issue credential without learning:');
  try {
    await credential.execute('issue', 
      { id: 'did:synet:user-123', name: 'Alice Smith' }, 
      'UniversityDegree',
      'did:synet:university-456'
    );
  } catch (error) {
    console.log(`❌ ${error}`);
  }

  // Create a mock crypto unit for demonstration
  const mockCrypto = {
    teach: () => ({
      sign: async (data: string, purpose: string) => {
        return `mock-signature-${data.length}-${purpose}`;
      },
      verify: async (data: string, signature: string) => {
        return signature.startsWith('mock-signature-');
      },
      hash: async (data: string) => {
        return `hash-${data.length}-${Date.now()}`;
      }
    })
  };

  // Learn capabilities
  console.log('\n2. Learning crypto capabilities:');
  credential.learn([mockCrypto.teach()]);
  console.log(`Updated capabilities: ${credential.getAllCapabilities().join(', ')}`);

  // Now issue successfully
  console.log('\n3. Issue credential with learned capabilities:');
  try {
    const vc = await credential.execute<VerifiableCredential>('issue', 
      { id: 'did:synet:user-123', name: 'Alice Smith', degree: 'Computer Science' }, 
      'UniversityDegree',
      'did:synet:university-456'
    );
    console.log('✅ Credential issued successfully!');
    console.log(`📄 Credential ID: ${vc.credentialSubject.id}`);
    console.log(`🔏 Signature: ${vc.proof.signature}`);
  } catch (error) {
    console.log(`❌ ${error}`);
  }

  // Verify the credential
  console.log('\n4. Verify credential:');
  try {
    const mockVC = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'UniversityDegree'],
      issuer: 'did:synet:university-456',
      issuanceDate: new Date().toISOString(),
      credentialSubject: { id: 'did:synet:user-123', name: 'Alice Smith' },
      proof: {
        type: 'JsonWebSignature2020',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:synet:university-456#keys-1',
        signature: 'mock-signature-123-credential'
      }
    };

    const result = await credential.execute('verify', mockVC);
    console.log(`✅ Verification result: ${JSON.stringify(result, null, 2)}`);
  } catch (error) {
    console.log(`❌ ${error}`);
  }

  console.log('\n=== DEMONSTRATION COMPLETE ===');
}

// Run demonstration
demonstrateCredentialUnit().catch(console.error);


