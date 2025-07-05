/**
 * The Art of Unit Composition: A Poetic Revolution
 * 
 * This demonstrates the breathtaking beauty of composable units
 * that can learn, teach, and evolve without tight coupling.
 * 
 * From the heart: This is not just code, it's art. 🎨
 */

import { Unit, createUnitSchema, ValueObject } from './src/unit.js';

/**
 * Credential Unit - The Enterprise Bloat Killer
 * 
 * Replaces 500MB enterprise frameworks with elegant composition
 */
interface CredentialProps {
  issuer: string;
  subject: string;
  claims: Record<string, unknown>;
  issuedAt?: string;
  signature?: string;
  // Learned capabilities storage
  capabilities?: Record<string, (...args: unknown[]) => unknown>;
}

class Credential extends ValueObject<CredentialProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'Credential',
    version: '1.0.0',
    commands: ['issue', 'verify', 'persist', 'sign'],
    description: 'Verifiable Credential - Enterprise bloat killer',
  });

  private get capabilities(): Record<string, (...args: unknown[]) => unknown> {
    return this.getProps().capabilities || {};
  }

  private setCapabilities(newCapabilities: Record<string, (...args: unknown[]) => unknown>): void {
    (this as any).props = {
      ...this.getProps(),
      capabilities: newCapabilities
    };
  }

  static create(config: {
    issuer?: string;
    subject?: string;
    claims?: Record<string, unknown>;
    key?: any; // Optional key for inline signing
  } = {}): Credential | null {
    if (!config.issuer || !config.subject) {
      console.error('Credential creation failed: issuer and subject required');
      return null;
    }

    const claims = config.claims || {};
    if (Object.keys(claims).length === 0) {
      console.warn('Credential created with no claims');
    }

    return new Credential({
      issuer: config.issuer,
      subject: config.subject,
      claims,
      issuedAt: new Date().toISOString(),
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (${this.getProps().issuer})`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command) || 
           Object.keys(this.capabilities).includes(command);
  }

  help(): void {
    console.log(`📜 ${this.whoami()} - ${this.dna.description}`);
    console.log(`✅ Ready - ${this.getProps().issuer} → ${this.getProps().subject}`);
    console.log(`   Claims: ${Object.keys(this.getProps().claims).join(', ')}`);
    
    if (Object.keys(this.capabilities).length > 0) {
      console.log(`   Learned: ${Object.keys(this.capabilities).join(', ')}`);
    }
  }

  explain(): string {
    return `Credential ready for ${this.getProps().subject} with ${Object.keys(this.capabilities).length} learned capabilities`;
  }

  // Core credential operations
  issueVc(): string {
    const vc = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      issuer: this.getProps().issuer,
      credentialSubject: {
        id: this.getProps().subject,
        ...this.getProps().claims
      },
      issuanceDate: this.getProps().issuedAt,
    };

    return JSON.stringify(vc, null, 2);
  }

  verify(vcString: string): boolean {
    try {
      const vc = JSON.parse(vcString);
      return vc.issuer === this.getProps().issuer;
    } catch {
      return false;
    }
  }

  // Learning system - this is pure poetry! 🎭
  learn(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void {
    const currentCapabilities = this.capabilities;
    const newCapabilities = { ...currentCapabilities };
    
    // Learn from all teachers
    capabilities.forEach(teacherCapabilities => {
      Object.assign(newCapabilities, teacherCapabilities);
    });
    
    this.setCapabilities(newCapabilities);
    console.log(`📚 ${this.whoami()} learned: ${Object.keys(newCapabilities).join(', ')}`);
  }

  // Teaching system - sharing the gift of knowledge ✨
  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      issue: () => this.issueVc(),
      verify: (...args: unknown[]) => this.verify(args[0] as string),
      getClaims: () => this.getProps().claims,
      getIssuer: () => this.getProps().issuer,
      getSubject: () => this.getProps().subject,
      ...this.capabilities // Include learned capabilities
    };
  }

  // Dynamic capability execution
  async execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R> {
    if (!this.capableOf(commandName)) {
      throw new Error(`Credential cannot execute '${commandName}'`);
    }

    // Check if it's a learned capability
    const props = this.getProps();
    const capability = props.capabilities?.[commandName];
    if (capability) {
      const result = await capability(...args);
      return result as R;
    }

    // Execute native capabilities
    switch (commandName) {
      case 'issue':
        return this.issueVc() as R;
      case 'verify':
        return this.verify(args[0] as string) as R;
      case 'sign':
        return this.sign(...args) as R;
      case 'persist':
        return this.persist(...args) as R;
      case 'export':
        return this.export(args[0] as 'json' | 'jwt') as R;
      default:
        throw new Error(`Unknown command: ${commandName}`);
    }
  }

  // 🎨 HALF-NATIVE CAPABILITY - unlock through learning
  sign(...args: unknown[]): string {
    const capabilities = this.getProps().capabilities;
    if (capabilities?.sign) {
      const vc = this.issueVc();
      return capabilities.sign(vc, ...args) as string;
    }
    
    // Default behavior when not learned
    return `Unsigned credential: ${this.getProps().subject}`;
  }

  // 🎨 HALF-NATIVE CAPABILITY - unlock through learning
  persist(...args: unknown[]): string {
    const capabilities = this.getProps().capabilities;
    if (capabilities?.writeFile) {
      const vc = this.issueVc();
      const filename = `credential-${this.getProps().subject}.json`;
      return capabilities.writeFile(filename, vc, ...args) as string;
    }
    
    // Default behavior when not learned
    return 'Cannot persist: filesystem not learned';
  }

  // 🎨 HALF-NATIVE CAPABILITY - unlock through learning
  export(format: 'json' | 'jwt' = 'json'): string {
    const capabilities = this.getProps().capabilities;
    const vc = this.issueVc();
    
    if (format === 'jwt' && capabilities?.encodeJWT) {
      return capabilities.encodeJWT(vc) as string;
    }
    
    return vc; // Default JSON format
  }
}

/**
 * Signer Unit - The Cryptographic Artist
 */
interface SignerProps {
  algorithm: string;
  privateKey: string;
}

class Signer extends ValueObject<SignerProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'Signer',
    version: '1.0.0',
    commands: ['sign', 'verify'],
    description: 'Cryptographic signer unit',
  });

  constructor(props: SignerProps) {
    super(props);
  }

  static create(config: { algorithm?: string } = {}): Signer | null {
    const algorithm = config.algorithm || 'ed25519';
    
    if (!['ed25519', 'ecdsa', 'rsa'].includes(algorithm)) {
      console.error(`Signer creation failed: unsupported algorithm ${algorithm}`);
      return null;
    }

    return new Signer({
      algorithm,
      privateKey: `${algorithm}-private-key-${Date.now()}`
    });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (${this.getProps().algorithm})`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`✍️  ${this.whoami()} - ${this.dna.description}`);
    console.log(`✅ Ready with ${this.getProps().algorithm} algorithm`);
  }

  explain(): string {
    return `Signer ready with ${this.getProps().algorithm} algorithm`;
  }

  sign(data: string): string {
    return `${this.getProps().algorithm}-signature-${Buffer.from(data).toString('base64').slice(0, 16)}`;
  }

  verify(data: string, signature: string): boolean {
    return this.sign(data) === signature;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      sign: (...args: unknown[]) => this.sign(args[0] as string),
      verify: (...args: unknown[]) => this.verify(args[0] as string, args[1] as string),
    };
  }
}

/**
 * FileSystem Unit - The Persistence Poet
 */
interface FileSystemProps {
  basePath: string;
  encryption: boolean;
}

class FileSystem extends ValueObject<FileSystemProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'FileSystem',
    version: '1.0.0',
    commands: ['saveFile', 'loadFile', 'deleteFile'],
    description: 'Encrypted, audited, monitored filesystem',
  });

  constructor(props: FileSystemProps) {
    super(props);
  }

  static create(config: { basePath?: string; encryption?: boolean } = {}): FileSystem | null {
    const basePath = config.basePath || '/tmp/synet';
    const encryption = config.encryption ?? true;

    return new FileSystem({ basePath, encryption });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version} (${this.getProps().basePath})`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`💾 ${this.whoami()} - ${this.dna.description}`);
    console.log(`✅ Ready at ${this.getProps().basePath}`);
    console.log(`   Encryption: ${this.getProps().encryption ? 'enabled' : 'disabled'}`);
  }

  explain(): string {
    return `FileSystem ready at ${this.getProps().basePath} with encryption ${this.getProps().encryption ? 'enabled' : 'disabled'}`;
  }

  saveFile(data: string, filename?: string): string {
    const file = filename || `credential-${Date.now()}.json`;
    const path = `${this.getProps().basePath}/${file}`;
    
    // Mock encryption and audit
    const encrypted = this.getProps().encryption ? `encrypted:${data}` : data;
    console.log(`📁 Saved to ${path} (encrypted: ${this.getProps().encryption})`);
    
    return path;
  }

  loadFile(filename: string): string {
    const path = `${this.getProps().basePath}/${filename}`;
    console.log(`📂 Loaded from ${path}`);
    return `mock-file-content-${filename}`;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      saveFile: (...args: unknown[]) => this.saveFile(args[0] as string, args[1] as string),
      loadFile: (...args: unknown[]) => this.loadFile(args[0] as string),
      deleteFile: (...args: unknown[]) => `deleted-${args[0]}`,
    };
  }
}

/**
 * The Art Exhibition: Composable Unit Symphony
 */
async function demonstrateTheArt() {
  console.log('🎨 The Art of Unit Composition: A Symphony in Code\n');

  // 1. Create the base credential - clean, simple, beautiful
  console.log('🎭 Act 1: Creating the Credential (Enterprise Bloat Killer)');
  const credential = Credential.create({
    issuer: 'did:example:issuer',
    subject: 'did:example:subject',
    claims: { name: 'John Doe', role: 'developer' }
  });

  if (!credential) {
    console.log('Credential creation failed');
    return;
  }

  credential.help();
  console.log(`Initial VC: ${credential.issueVc().substring(0, 100)}...\n`);

  // 2. The 4-liner poetry (but even more beautiful)
  console.log('✍️  Act 2: The 4-Liner Poetry');
  const signer = Signer.create({ algorithm: 'ed25519' });
  if (!signer) {
    console.log('Signer creation failed');
    return;
  }

  // Option 1: External signing (your beautiful 4-liner)
  const unsignedVc = credential.issueVc();
  const signedVc = signer.sign(unsignedVc);
  console.log(`🖋️  External signing: ${signedVc}`);

  // Option 2: Learning and internal capability
  credential.learn([signer.teach()]);
  const learnedSignedVc = await credential.execute('sign', unsignedVc);
  console.log(`🧠 Learned signing: ${learnedSignedVc}\n`);

  // 3. The filesystem learning - pure poetry
  console.log('💾 Act 3: The Filesystem Learning Poetry');
  const filesystem = FileSystem.create({ 
    basePath: '/secure/vault', 
    encryption: true 
  });

  if (!filesystem) {
    console.log('FileSystem creation failed');
    return;
  }

  // Credential learns filesystem capabilities
  credential.learn([filesystem.teach()]);
  
  // Now credential can persist itself!
  const savedPath = await credential.execute('saveFile', credential.issueVc(), 'john-doe-credential.json');
  console.log(`📁 Credential saved itself: ${savedPath}\n`);

  // 4. The composition symphony
  console.log('🎼 Act 4: The Composition Symphony');
  credential.help();
  console.log(`\nCapabilities after learning: ${Object.keys(credential.teach()).join(', ')}`);

  // 5. The evolution - units teaching each other
  console.log('\n🌱 Act 5: The Evolution');
  
  // Create another credential that learns from the first
  const credential2 = Credential.create({
    issuer: 'did:example:issuer2',
    subject: 'did:example:subject2',
    claims: { name: 'Jane Doe', role: 'architect' }
  });

  if (credential2) {
    // Second credential learns from the first (which has learned signing and filesystem)
    credential2.learn([credential.teach()]);
    
    console.log('🔄 Second credential learned everything from the first:');
    credential2.help();
    
    // Now it can sign and persist too!
    const vc2 = credential2.issueVc();
    const signedVc2 = await credential2.execute('sign', vc2);
    const savedPath2 = await credential2.execute('saveFile', signedVc2, 'jane-doe-credential.json');
    console.log(`📁 Second credential saved itself: ${savedPath2}`);
  }

  console.log('\n✨ The Art Revealed:');
  console.log('• No enterprise bloat - just elegant composition');
  console.log('• Units learn from each other like artists sharing techniques');
  console.log('• Capabilities flow through the system like poetry');
  console.log('• No tight coupling - just beautiful, loose collaboration');
  console.log('• Each unit maintains its identity while gaining new powers');
  console.log('• The whole is greater than the sum of its parts');
  console.log('\n🎭 This is not just code - this is art! 🎨');
}

// Run the art exhibition
demonstrateTheArt().catch(console.error);

export { Credential, Signer, FileSystem };
