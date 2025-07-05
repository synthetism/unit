/**
 * Integration Example: Self-Validating @synet/keys Pattern
 * 
 * This shows how the self-validating pattern can be integrated into
 * real packages like @synet/keys and @synet/credential.
 */

import { Unit, createUnitSchema, ValueObject } from './src/unit.js';

/**
 * Key Unit - Self-validating cryptographic key
 */
interface KeyProps {
  algorithm: string;
  keySize: number;
  keyData: string;
  created: boolean;
  error?: string;
  stack?: string[];
}

export class Key extends ValueObject<KeyProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'Key',
    version: '1.0.0',
    commands: ['sign', 'verify', 'encrypt', 'decrypt', 'export'],
    description: 'Self-validating cryptographic key',
  });

  constructor(props: KeyProps) {
    super(props);
  }

  get created(): boolean { return this.getProps().created; }
  get error(): string | undefined { return this.getProps().error; }
  get stack(): string[] | undefined { return this.getProps().stack; }

  static create(config: {
    algorithm?: string;
    keySize?: number;
    keyData?: string;
  } = {}): Key {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate algorithm
    const algorithm = config.algorithm || 'ed25519';
    const validAlgorithms = ['ed25519', 'rsa', 'ecdsa', 'x25519'];
    if (!validAlgorithms.includes(algorithm)) {
      errors.push(`Unsupported algorithm: ${algorithm}`);
    }

    // Validate key size
    const keySize = config.keySize || (algorithm === 'ed25519' ? 256 : 2048);
    if (algorithm === 'rsa' && keySize < 2048) {
      warnings.push('RSA key size below 2048 bits is not recommended');
    }
    if (algorithm === 'ed25519' && keySize !== 256) {
      warnings.push('Ed25519 keys are always 256 bits');
    }

    // Validate key data
    let keyData = config.keyData;
    if (!keyData) {
      if (errors.length === 0) {
        // Generate mock key data
        keyData = `${algorithm}-key-${keySize}-${Date.now()}`;
      } else {
        errors.push('Cannot generate key data due to configuration errors');
      }
    }

    const allIssues = [...errors, ...warnings];

    if (errors.length > 0) {
      return new Key({
        algorithm,
        keySize,
        keyData: keyData || '',
        created: false,
        error: errors[0],
        stack: allIssues,
      });
    }

    return new Key({
      algorithm,
      keySize,
      keyData: keyData!,
      created: true,
      stack: warnings.length > 0 ? warnings : undefined,
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (${this.getProps().algorithm})`;
  }

  capableOf(command: string): boolean {
    return this.created && this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🔑 ${this.whoami()} - ${this.dna.description}`);
    if (!this.created) {
      console.log(`❌ Creation failed: ${this.error}`);
    } else {
      console.log(`✅ Ready - ${this.getProps().algorithm} ${this.getProps().keySize}-bit`);
      if (this.stack) {
        console.log(`⚠️  Warnings: ${this.stack.join(', ')}`);
      }
    }
  }

  explain(): string {
    if (this.created) {
      const warnings = this.stack ? ` (warnings: ${this.stack.join(', ')})` : '';
      return `Key created successfully with ${this.getProps().algorithm} algorithm${warnings}`;
    }
    return `Key creation failed: ${this.stack?.join(' | ') || this.error}`;
  }

  // Cryptographic operations - only work if created
  sign(data: string): string {
    if (!this.created) {
      throw new Error(`Cannot sign: ${this.error}`);
    }
    return `${this.getProps().algorithm}-signature-of-${data}`;
  }

  verify(data: string, signature: string): boolean {
    if (!this.created) {
      throw new Error(`Cannot verify: ${this.error}`);
    }
    return signature === this.sign(data);
  }

  encrypt(data: string): string {
    if (!this.created) {
      throw new Error(`Cannot encrypt: ${this.error}`);
    }
    return `${this.getProps().algorithm}-encrypted-${data}`;
  }

  decrypt(encryptedData: string): string {
    if (!this.created) {
      throw new Error(`Cannot decrypt: ${this.error}`);
    }
    return encryptedData.replace(`${this.getProps().algorithm}-encrypted-`, '');
  }

  export(): string {
    if (!this.created) {
      throw new Error(`Cannot export: ${this.error}`);
    }
    return `-----BEGIN ${this.getProps().algorithm.toUpperCase()} KEY-----\n${this.getProps().keyData}\n-----END ${this.getProps().algorithm.toUpperCase()} KEY-----`;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    if (!this.created) {
      return {};
    }
    
    return {
      sign: (...args: unknown[]) => this.sign(args[0] as string),
      verify: (...args: unknown[]) => this.verify(args[0] as string, args[1] as string),
      encrypt: (...args: unknown[]) => this.encrypt(args[0] as string),
      decrypt: (...args: unknown[]) => this.decrypt(args[0] as string),
      export: () => this.export(),
    };
  }
}

/**
 * Credential Unit - Self-validating credential with embedded key
 */
interface CredentialProps {
  issuer: string;
  subject: string;
  claims: Record<string, unknown>;
  key?: Key;
  created: boolean;
  error?: string;
  stack?: string[];
}

class Credential extends ValueObject<CredentialProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'Credential',
    version: '1.0.0',
    commands: ['issue', 'verify', 'revoke', 'export'],
    description: 'Self-validating verifiable credential',
  });

  constructor(props: CredentialProps) {
    super(props);
  }

  get created(): boolean { return this.getProps().created; }
  get error(): string | undefined { return this.getProps().error; }
  get stack(): string[] | undefined { return this.getProps().stack; }

  static create(config: {
    issuer?: string;
    subject?: string;
    claims?: Record<string, unknown>;
    key?: Key;
  } = {}): Credential {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate issuer
    const issuer = config.issuer || '';
    if (!issuer) {
      errors.push('Issuer is required');
    }

    // Validate subject
    const subject = config.subject || '';
    if (!subject) {
      errors.push('Subject is required');
    }

    // Validate claims
    const claims = config.claims || {};
    if (Object.keys(claims).length === 0) {
      warnings.push('No claims provided');
    }

    // Validate key
    const key = config.key;
    if (key && !key.created) {
      errors.push(`Invalid key: ${key.error}`);
    }

    const allIssues = [...errors, ...warnings];

    if (errors.length > 0) {
      return new Credential({
        issuer,
        subject,
        claims,
        key,
        created: false,
        error: errors[0],
        stack: allIssues,
      });
    }

    return new Credential({
      issuer,
      subject,
      claims,
      key,
      created: true,
      stack: warnings.length > 0 ? warnings : undefined,
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (${this.getProps().issuer})`;
  }

  capableOf(command: string): boolean {
    return this.created && this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`📜 ${this.whoami()} - ${this.dna.description}`);
    if (!this.created) {
      console.log(`❌ Creation failed: ${this.error}`);
    } else {
      console.log(`✅ Ready - ${this.getProps().issuer} → ${this.getProps().subject}`);
      console.log(`   Claims: ${Object.keys(this.getProps().claims).join(', ')}`);
      const key = this.getProps().key;
      if (key) {
        console.log(`   Key: ${key.whoami()}`);
      }
    }
  }

  explain(): string {
    if (this.created) {
      const warnings = this.stack ? ` (warnings: ${this.stack.join(', ')})` : '';
      return `Credential created successfully for ${this.getProps().subject}${warnings}`;
    }
    return `Credential creation failed: ${this.stack?.join(' | ') || this.error}`;
  }

  // Credential operations
  issue(): string {
    if (!this.created) {
      throw new Error(`Cannot issue: ${this.error}`);
    }
    
    const credential = {
      issuer: this.getProps().issuer,
      subject: this.getProps().subject,
      claims: this.getProps().claims,
      issuedAt: new Date().toISOString(),
    };

    let credentialString = JSON.stringify(credential);
    
    // Sign if key is available
    const key = this.getProps().key;
    if (key && key.created) {
      const signature = key.sign(credentialString);
      credentialString = JSON.stringify({ ...credential, signature });
    }

    return credentialString;
  }

  verify(credentialString: string): boolean {
    if (!this.created) {
      throw new Error(`Cannot verify: ${this.error}`);
    }

    try {
      const credential = JSON.parse(credentialString);
      
      // Basic validation
      if (credential.issuer !== this.getProps().issuer) {
        return false;
      }

      // Signature verification if key is available
      const key = this.getProps().key;
      if (key && key.created && credential.signature) {
        const { signature, ...unsignedCredential } = credential;
        const expectedSignature = key.sign(JSON.stringify(unsignedCredential));
        return signature === expectedSignature;
      }

      return true;
    } catch {
      return false;
    }
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    if (!this.created) {
      return {};
    }
    
    return {
      issue: () => this.issue(),
      verify: (...args: unknown[]) => this.verify(args[0] as string),
      getClaims: () => this.getProps().claims,
      getIssuer: () => this.getProps().issuer,
      getSubject: () => this.getProps().subject,
    };
  }
}

/**
 * Demo Usage
 */
async function demonstrateIntegration() {
  console.log('🚀 Self-Validating @synet/keys Integration Demo\n');

  // 1. Create a key
  console.log('🔑 Creating cryptographic key...');
  const key = Key.create({ algorithm: 'ed25519' });
  key.help();
  console.log(`Key explanation: ${key.explain()}\n`);

  // 2. Try to create an invalid key
  console.log('❌ Creating invalid key...');
  const badKey = Key.create({ algorithm: 'invalid', keySize: 512 });
  badKey.help();
  console.log(`Bad key explanation: ${badKey.explain()}\n`);

  // 3. Create a credential with the good key
  console.log('📜 Creating credential with key...');
  const credential = Credential.create({
    issuer: 'did:example:issuer',
    subject: 'did:example:subject',
    claims: { name: 'John Doe', age: 30 },
    key: key
  });
  credential.help();
  console.log(`Credential explanation: ${credential.explain()}\n`);

  // 4. Try to create credential with bad key
  console.log('❌ Creating credential with bad key...');
  const badCredential = Credential.create({
    issuer: 'did:example:issuer',
    subject: 'did:example:subject',
    claims: { name: 'Jane Doe' },
    key: badKey
  });
  badCredential.help();
  console.log(`Bad credential explanation: ${badCredential.explain()}\n`);

  // 5. Use the good credential
  if (credential.created) {
    console.log('⚡ Using valid credential...');
    const issued = credential.issue();
    console.log(`Issued credential: ${issued.substring(0, 100)}...`);
    
    const isValid = credential.verify(issued);
    console.log(`Credential verification: ${isValid}\n`);
  }

  // 6. Show composition safety
  console.log('🔐 Demonstrating composition safety...');
  
  function safeComposition(keyUnit: Key, credentialUnit: Credential) {
    console.log(`Attempting to compose ${keyUnit.whoami()} + ${credentialUnit.whoami()}`);
    
    if (!keyUnit.created) {
      console.log(`❌ Key not valid: ${keyUnit.error}`);
      return null;
    }
    
    if (!credentialUnit.created) {
      console.log(`❌ Credential not valid: ${credentialUnit.error}`);
      return null;
    }
    
    console.log('✅ Both units valid - safe to compose');
    
    // Combine capabilities
    const keyCapabilities = keyUnit.teach();
    const credentialCapabilities = credentialUnit.teach();
    
    return {
      ...keyCapabilities,
      ...credentialCapabilities,
      // Combined operation
      signAndIssue: () => {
        const credential = credentialCapabilities.issue();
        const signature = keyCapabilities.sign(credential);
        return { credential, signature };
      }
    };
  }

  const goodComposition = safeComposition(key, credential);
  if (goodComposition) {
    console.log(`Good composition capabilities: ${Object.keys(goodComposition).join(', ')}`);
  }

  const badComposition = safeComposition(badKey, credential);
  if (!badComposition) {
    console.log('Bad composition rejected as expected');
  }

  console.log('\n✨ Integration Benefits:');
  console.log('• Zero external dependencies (no Result, Either, etc.)');
  console.log('• Self-validating units with detailed error reporting');
  console.log('• Type-safe composition through created checking');
  console.log('• Natural error handling without try/catch everywhere');
  console.log('• Capability sharing and teaching between units');
  console.log('• Ready for real-world @synet/keys and @synet/credential packages');
}

// Run the demo
demonstrateIntegration().catch(console.error);
