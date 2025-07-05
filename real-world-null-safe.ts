/**
 * Real-World Example: Null-Safe @synet/keys Pattern
 * 
 * This shows how the null-safe pattern works in practice
 * with cryptographic keys and credentials.
 */

import { Unit, createUnitSchema, ValueObject } from './src/unit.js';

/**
 * Key Unit - Null-safe cryptographic key
 */
interface KeyProps {
  algorithm: string;
  keySize: number;
  keyData: string;
  warnings?: string[];
}

class Key extends ValueObject<KeyProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'Key',
    version: '1.0.0',
    commands: ['sign', 'verify', 'encrypt', 'decrypt', 'export'],
    description: 'Null-safe cryptographic key',
  });

  constructor(props: KeyProps) {
    super(props);
  }

  static create(config: {
    algorithm?: string;
    keySize?: number;
    keyData?: string;
  } = {}): Key | null {
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

    // Return null if validation fails
    if (errors.length > 0) {
      console.error(`Key creation failed: ${errors.join(', ')}`);
      return null;
    }

    // Generate key data if not provided
    const keyData = config.keyData || `${algorithm}-key-${keySize}-${Date.now()}`;

    return new Key({
      algorithm,
      keySize,
      keyData,
      warnings: warnings.length > 0 ? warnings : undefined
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (${this.getProps().algorithm})`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🔑 ${this.whoami()} - ${this.dna.description}`);
    console.log(`✅ Ready - ${this.getProps().algorithm} ${this.getProps().keySize}-bit`);
    const warnings = this.getProps().warnings;
    if (warnings) {
      console.log(`⚠️  Warnings: ${warnings.join(', ')}`);
    }
  }

  explain(): string {
    const warnings = this.getProps().warnings;
    const warningText = warnings ? ` (warnings: ${warnings.join(', ')})` : '';
    return `Key created successfully with ${this.getProps().algorithm} algorithm${warningText}`;
  }

  // Cryptographic operations - always safe since unit exists
  sign(data: string): string {
    return `${this.getProps().algorithm}-signature-of-${data}`;
  }

  verify(data: string, signature: string): boolean {
    return signature === this.sign(data);
  }

  encrypt(data: string): string {
    return `${this.getProps().algorithm}-encrypted-${data}`;
  }

  decrypt(encryptedData: string): string {
    return encryptedData.replace(`${this.getProps().algorithm}-encrypted-`, '');
  }

  export(): string {
    return `-----BEGIN ${this.getProps().algorithm.toUpperCase()} KEY-----\n${this.getProps().keyData}\n-----END ${this.getProps().algorithm.toUpperCase()} KEY-----`;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
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
 * Credential Unit - Null-safe verifiable credential
 */
interface CredentialProps {
  issuer: string;
  subject: string;
  claims: Record<string, unknown>;
  key?: Key;
  warnings?: string[];
}

class Credential extends ValueObject<CredentialProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'Credential',
    version: '1.0.0',
    commands: ['issue', 'verify', 'revoke', 'export'],
    description: 'Null-safe verifiable credential',
  });

  constructor(props: CredentialProps) {
    super(props);
  }

  static create(config: {
    issuer?: string;
    subject?: string;
    claims?: Record<string, unknown>;
    key?: Key | null;
  } = {}): Credential | null {
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

    // Validate key (if provided)
    const key = config.key || undefined;
    if (config.key === null) {
      warnings.push('Key creation failed, credential will not be signed');
    }

    // Return null if validation fails
    if (errors.length > 0) {
      console.error(`Credential creation failed: ${errors.join(', ')}`);
      return null;
    }

    return new Credential({
      issuer,
      subject,
      claims,
      key,
      warnings: warnings.length > 0 ? warnings : undefined
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (${this.getProps().issuer})`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`📜 ${this.whoami()} - ${this.dna.description}`);
    console.log(`✅ Ready - ${this.getProps().issuer} → ${this.getProps().subject}`);
    console.log(`   Claims: ${Object.keys(this.getProps().claims).join(', ')}`);
    const key = this.getProps().key;
    if (key) {
      console.log(`   Key: ${key.whoami()}`);
    }
    const warnings = this.getProps().warnings;
    if (warnings) {
      console.log(`⚠️  Warnings: ${warnings.join(', ')}`);
    }
  }

  explain(): string {
    const warnings = this.getProps().warnings;
    const warningText = warnings ? ` (warnings: ${warnings.join(', ')})` : '';
    return `Credential created successfully for ${this.getProps().subject}${warningText}`;
  }

  // Credential operations - always safe since unit exists
  issue(): string {
    const credential = {
      issuer: this.getProps().issuer,
      subject: this.getProps().subject,
      claims: this.getProps().claims,
      issuedAt: new Date().toISOString(),
    };

    let credentialString = JSON.stringify(credential);
    
    // Sign if key is available
    const key = this.getProps().key;
    if (key) {
      const signature = key.sign(credentialString);
      credentialString = JSON.stringify({ ...credential, signature });
    }

    return credentialString;
  }

  verify(credentialString: string): boolean {
    try {
      const credential = JSON.parse(credentialString);
      
      // Basic validation
      if (credential.issuer !== this.getProps().issuer) {
        return false;
      }

      // Signature verification if key is available
      const key = this.getProps().key;
      if (key && credential.signature) {
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
 * Composite KeyPair - Null-safe key pair creation
 */
class KeyPair {
  private constructor(
    private signingKey: Key,
    private encryptionKey: Key
  ) {}

  static create(config: {
    signingAlgorithm?: string;
    encryptionAlgorithm?: string;
  } = {}): KeyPair | null {
    const signingKey = Key.create({
      algorithm: config.signingAlgorithm || 'ed25519'
    });

    const encryptionKey = Key.create({
      algorithm: config.encryptionAlgorithm || 'x25519'
    });

    // Return null if either key creation fails
    if (!signingKey) {
      console.error('KeyPair creation failed: Signing key creation failed');
      return null;
    }

    if (!encryptionKey) {
      console.error('KeyPair creation failed: Encryption key creation failed');
      return null;
    }

    return new KeyPair(signingKey, encryptionKey);
  }

  sign(data: string): string {
    return this.signingKey.sign(data);
  }

  encrypt(data: string): string {
    return this.encryptionKey.encrypt(data);
  }

  getSigningKey(): Key {
    return this.signingKey;
  }

  getEncryptionKey(): Key {
    return this.encryptionKey;
  }

  export(): { signing: string; encryption: string } {
    return {
      signing: this.signingKey.export(),
      encryption: this.encryptionKey.export()
    };
  }
}

/**
 * Demo function showing real-world usage
 */
async function demonstrateRealWorld() {
  console.log('🌍 Real-World Null-Safe Pattern Demo\n');

  // 1. Create a key successfully
  console.log('🔑 Creating cryptographic key...');
  const key = Key.create({ algorithm: 'ed25519' });
  if (key) {
    key.help();
    console.log(`Key explanation: ${key.explain()}`);
    console.log(`Exported key: ${key.export()}\n`);
  } else {
    console.log('Key creation failed\n');
  }

  // 2. Try to create an invalid key
  console.log('❌ Attempting to create invalid key...');
  const invalidKey = Key.create({ algorithm: 'invalid-algorithm' });
  if (invalidKey) {
    console.log('This should not print');
  } else {
    console.log('Invalid key creation failed as expected\n');
  }

  // 3. Create credential with valid key
  console.log('📜 Creating credential with valid key...');
  const credential = Credential.create({
    issuer: 'did:example:issuer',
    subject: 'did:example:subject',
    claims: { name: 'John Doe', role: 'developer' },
    key: key
  });

  if (credential) {
    credential.help();
    console.log(`Credential explanation: ${credential.explain()}`);
    
    const issuedCredential = credential.issue();
    console.log(`Issued credential: ${issuedCredential.substring(0, 100)}...`);
    
    const isValid = credential.verify(issuedCredential);
    console.log(`Credential verification: ${isValid}\n`);
  } else {
    console.log('Credential creation failed\n');
  }

  // 4. Try to create credential with invalid key
  console.log('❌ Creating credential with invalid key...');
  const credentialWithInvalidKey = Credential.create({
    issuer: 'did:example:issuer',
    subject: 'did:example:subject',
    claims: { name: 'Jane Doe' },
    key: invalidKey
  });

  if (credentialWithInvalidKey) {
    console.log('This should not print');
  } else {
    console.log('Credential with invalid key creation failed as expected\n');
  }

  // 5. Create key pair
  console.log('🔗 Creating key pair...');
  const keyPair = KeyPair.create({
    signingAlgorithm: 'ed25519',
    encryptionAlgorithm: 'x25519'
  });

  if (keyPair) {
    console.log('✅ Key pair created successfully');
    console.log(`Signing: ${keyPair.getSigningKey().whoami()}`);
    console.log(`Encryption: ${keyPair.getEncryptionKey().whoami()}`);
    
    const signature = keyPair.sign('test-data');
    const encrypted = keyPair.encrypt('secret-data');
    console.log(`Signature: ${signature}`);
    console.log(`Encrypted: ${encrypted}\n`);
  } else {
    console.log('Key pair creation failed\n');
  }

  // 6. Try to create key pair with invalid algorithms
  console.log('❌ Creating key pair with invalid algorithms...');
  const invalidKeyPair = KeyPair.create({
    signingAlgorithm: 'invalid',
    encryptionAlgorithm: 'x25519'
  });

  if (invalidKeyPair) {
    console.log('This should not print');
  } else {
    console.log('Invalid key pair creation failed as expected\n');
  }

  // 7. Safe composition patterns
  console.log('🔐 Safe composition patterns...');
  
  function createSecureDocument(
    signingKey: Key | null,
    encryptionKey: Key | null,
    content: string
  ): { encrypted: string; signature: string } | null {
    if (!signingKey || !encryptionKey) {
      console.log('Cannot create secure document: missing keys');
      return null;
    }

    const encrypted = encryptionKey.encrypt(content);
    const signature = signingKey.sign(encrypted);
    
    return { encrypted, signature };
  }

  const signingKey = Key.create({ algorithm: 'ed25519' });
  const encryptionKey = Key.create({ algorithm: 'x25519' });
  
  const secureDoc = createSecureDocument(signingKey, encryptionKey, 'confidential-data');
  if (secureDoc) {
    console.log('✅ Secure document created');
    console.log(`Encrypted: ${secureDoc.encrypted}`);
    console.log(`Signature: ${secureDoc.signature}`);
  } else {
    console.log('Secure document creation failed');
  }

  // 8. Array processing with null safety
  console.log('\n📊 Processing multiple units safely...');
  
  const potentialKeys = [
    Key.create({ algorithm: 'ed25519' }),
    Key.create({ algorithm: 'invalid' }),
    Key.create({ algorithm: 'rsa', keySize: 2048 }),
    Key.create({ algorithm: 'unknown' })
  ];

  const validKeys = potentialKeys.filter((key): key is Key => key !== null);
  
  console.log(`Created ${potentialKeys.length} potential keys`);
  console.log(`Got ${validKeys.length} valid keys`);
  
  validKeys.forEach(key => {
    console.log(`- ${key.whoami()}`);
  });

  console.log('\n✨ Null-Safe Pattern Benefits:');
  console.log('• Forces error handling at creation time');
  console.log('• Prevents runtime surprises with invalid units');
  console.log('• TypeScript enforces proper null checking');
  console.log('• Clean separation between valid units and errors');
  console.log('• All existing units are guaranteed to work');
  console.log('• No need for created/error checking on instances');
  console.log('• Composable and type-safe by design');
}

// Run the demo
demonstrateRealWorld().catch(console.error);
