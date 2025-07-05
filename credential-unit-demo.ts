/**
 * SYNET CREDENTIAL UNIT - Learning Pattern Implementation
 * 
 * This demonstrates how @synet/credential would implement the learning pattern
 * to eliminate type compatibility issues while maintaining full functionality.
 */

import { Unit, UnitSchema, createUnitSchema } from './src/unit';

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

export class CredentialUnitDemo implements Unit {
  private _dna: UnitSchema;
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  constructor() {
    this._dna = createUnitSchema({
      name: 'credential-unit-demo',
      version: '1.0.0',
      commands: ['issue', 'verify'],
      description: 'W3C Verifiable Credential operations demo'
    });
    
    this._capabilities.set('issue', this.issueVC.bind(this));
    this._capabilities.set('verify', this.verifyVC.bind(this));
  }

  get dna(): UnitSchema {
    return this._dna;
  }

  whoami(): string {
    return 'CredentialUnitDemo - W3C Verifiable Credential operations';
  }

  capableOf(command: string): boolean {
    return this._capabilities.has(command);
  }

  help(): void {
    console.log('I can issue and verify W3C credentials. I can learn crypto capabilities.');
  }

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

  private async issueVC(...args: unknown[]): Promise<VerifiableCredential> {
    const [subject, type, issuer] = args as [CredentialSubject, string, string];

    if (!this._capabilities.has('sign')) {
      throw new Error('Cannot issue credential: missing sign capability. Learn from a crypto unit.');
    }

    const credential: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', type],
      issuer,
      issuanceDate: new Date().toISOString(),
      credentialSubject: subject,
      proof: {
        type: 'JsonWebSignature2020',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: `${issuer}#keys-1`,
        signature: ''
      }
    };

    const dataToSign = JSON.stringify({
      '@context': credential['@context'],
      type: credential.type,
      issuer: credential.issuer,
      issuanceDate: credential.issuanceDate,
      credentialSubject: credential.credentialSubject
    });

    const signature = await this._capabilities.get('sign')!(dataToSign, 'credential') as string;
    credential.proof.signature = signature;

    return credential;
  }

  private async verifyVC(...args: unknown[]): Promise<{ valid: boolean; reason?: string }> {
    const [credential] = args as [VerifiableCredential];

    if (!credential || !credential.proof) {
      return { valid: false, reason: 'Invalid credential structure' };
    }

    if (this._capabilities.has('verify')) {
      const dataToVerify = JSON.stringify({
        '@context': credential['@context'],
        type: credential.type,
        issuer: credential.issuer,
        issuanceDate: credential.issuanceDate,
        credentialSubject: credential.credentialSubject
      });

      const isValid = await this._capabilities.get('verify')!(dataToVerify, credential.proof.signature) as boolean;
      return { valid: isValid };
    }

    return { valid: true, reason: 'No verification capability available' };
  }
}

// Demo
async function demonstrateCredentialUnit() {
  console.log('=== CREDENTIAL UNIT LEARNING DEMO ===\n');

  const credential = new CredentialUnitDemo();
  console.log(`Created: ${credential.whoami()}`);
  console.log(`Initial capabilities: ${credential.getAllCapabilities().join(', ')}`);

  // Mock crypto capabilities
  const mockCrypto = {
    sign: async (...args: unknown[]) => {
      const [data, purpose] = args as [string, string];
      return `mock-signature-${data.length}-${purpose}`;
    },
    verify: async (...args: unknown[]) => {
      const [data, signature] = args as [string, string];
      return signature.startsWith('mock-signature-');
    }
  };

  // Learn capabilities
  console.log('\n1. Learning crypto capabilities:');
  credential.learn([mockCrypto]);
  console.log(`Updated capabilities: ${credential.getAllCapabilities().join(', ')}`);

  // Issue credential
  console.log('\n2. Issue credential:');
  try {
    const vc = await credential.execute('issue', 
      { id: 'did:synet:user-123', name: 'Alice Smith' }, 
      'UniversityDegree',
      'did:synet:university-456'
    ) as VerifiableCredential;
    
    console.log('✅ Credential issued successfully!');
    console.log(`📄 Subject: ${vc.credentialSubject.name}`);
    console.log(`🔏 Signature: ${vc.proof.signature}`);
  } catch (error) {
    console.log(`❌ ${error}`);
  }

  console.log('\n=== DEMONSTRATION COMPLETE ===');
}

// Run the demo
demonstrateCredentialUnit().catch(console.error);
