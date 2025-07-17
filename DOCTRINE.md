---
title: UNIT ARCHITECTURE DOCTRINE
description: Unit development practival philosophy.
createdAt: 15.07.25
updatedAt: 16.07.25
version: 1.0.5
---

# ** SYNET UNIT ARCHITECTURE DOCTRINE**

### 1. ZERO DEPENDENCY 
*"Dependencies are technical debt - eliminate them to achieve infinite freedom"*

**Rule:** No external dependencies or injections in core units. Every unit must be self-contained.

```typescript
// ✅ Correct - Pure, self-contained
export class CryptoUnit extends Unit<CryptoUnitProps> {
  // Uses only native crypto, no external libs
}

// ❌ Avoid - Inject external dependency
export class BadUnit extends Unit<CryptoUnitProps> {
  constructor(private lodash: typeof _) {} // Forbidden
}
```

### 2. TEACH/LEARN PARADIGM
*"Units must teach capabilities and learn from others - static knowledge is dead knowledge"*

**Rule:** Every unit MUST implement `teach()` and `learn()`. No unit exists in isolation.

```typescript
// ✅ Correct - Teachable and learnable
class Unit {
  teach(): TeachingContract { /* capabilities */ }
  learn(contracts: TeachingContract[]): void { /* evolve */ }
}

//  Static, are teachable and non-evolving
class StaticClass {
  static doSomething() {} // Can't teach/learn
}
```

### 3. PROPS CONTAIN EVERYTHING

*"Props contain all state - no duplication, no private field pollution - immutable, single source of truth"

**Rule:** Units are constructed via `super(props)`, not complex constructors with dependencies, no private underscore pollution.

```typescript

// ✅ Correct - Props-based construction

import { UnitProps } from "@synet/unit"

// ✅ Base props interface - all units extend this
export interface UnitProps {
  dna: UnitSchema;  
  created?: Date;
  metadata?: Record<string, unknown>;
  [x: string]: unknown;
}


// ✅ Unit-specific props interface
interface KeyUnitProps extends UnitProps {
  publicKey: string;
  privateKey: string;
  secure: boolean;
}

// ✅ External configuration interface
export interface KeyUnitConfig {

   	publicKey:string;	
	  privateKey:string;
    meta?: Record<string, unknown> = {}
    // ... other config options.
}


class KeyUnit extends Unit<KeyUnitProps> { // ✅ Generic typing
    
  // ✅ Protected constructor enables evolution
  protected constructor(props: KeyUnitProps) {
    super(props);
  }

  // Params validation and props construction with static `create()`
  static create(config: KeyUnitConfig): KeyUnit { 
    const props: KeyUnitProps = {
      dna: createUnitSchema({ id: 'key-unit', version: '1.0.0' }),
      publicKey: config.publicKey,
      privateKey: config.privateKey,
      secure: config.meta?.private || false,
      created: new Date(),
      metadata: config.meta || {}
    };
    
    return new KeyUnit(props);
  }

  // ✅ Access props via getter pattern
  get publicKeyPEM(): string {
    return this.props.publicKey;
  }

}

// ❌ Avoid  - Private field duplication
class BadUnit {
  private _publicKey: string; // Unnecessary duplication
  private _privateKey: string; // Props become stale
}

```

### 4. CREATE NOT CONSTRUCT
*"Protected constructors + static create() with proper typing"*

**Rule:** Primary construction through `static create()`. Constructor is private or protected.

```typescript

//  ✅ Correct - Full typing pattern
export class FileSystem extends Unit<FileSystemProps> {
  private constructor(props: FileSystemProps) { super(props); }
  static create(config: FileSystemConfig): FileSystem { 
	  
	  return new FileSystem(props);
  }
}

const unit = FileSystem.create(fileSystemConfig);

// ❌ Avoid  - Public constructor
export class BadUnit extends Unit<BadUnitProps> {
  public constructor(lots: any, of: any, params: any) {} // Forbidden
}

// Not Unit Architecture
const unit = new Unit(lots,of,params)

```

### 5. CAPABILITY-BASED COMPOSITION
*"Compose by capabilities, not by inheritance - capabilities flow between units"*

**Rule:** Units acquire capabilities through teaching/learning, not inheritance hierarchies.

```typescript
// ✅ Correct - Capability composition
const enhanced = unit.learn([crypto.teach(), fs.teach()]);
// Unit gains signing + file operations

// ❌ Avoid - Inheritance coupling
class EnhancedUnit extends CryptoUnit, FileSystemUnit {} // Forbidden
```

### 6. EXECUTE AS CAPABILITY MEMBRANE

"Execute serves as a protective membrane to execute acquired capabilities"

Rule: Execute handles learned capabilities and conditional access. Native methods are called directly.

```typescript
// ✅ Execute for acquired capabilities
unit.execute('crypto.sign', data);     // Learned from crypto unit
unit.execute('fs.writeFile', file);    // Learned from fs unit

// ✅ Direct calls for native capabilities  
unit.generateKey();    // Native method
unit.createDID();      // Native method

// ✅ Execute for conditional access
unit.execute('adminCommand');    // Custom execute method, may be transformed or filtered by security rules
```

### **7. EVERY UNIT MUST HAVE DNA **
*"Every unit must declare its identity through DNA schema"*

**Rule:** Units self-describe capabilities through `createUnitSchema()`.
```typescript

export interface UnitSchema {
  /** Unit ID - deterministic unit identification for capability resolution */
  readonly id: string;
  /** Unit version */
  readonly version: string;
  /** Parent DNA this unit evolved from (evolution lineage) */
  readonly parent?: UnitSchema;
}

// Unit Props  base interface 
export interface  UnitProps {
  dna: UnitSchema;  
  created?: Date;
  metadata?: Record<string, unknown>;
  [x: string]: unknown;
}

// Extending  base props 
export interface SimpleUnitProps extends UnitProps {
   customValue: string;
}

// Access dna, implemented in Base Unit class
get dna(): UnitSchema {
  return this.props.dna; 
}

static create(config: UnitConfig = {}): Credential {
    
    // Unit creation with DNA 
    const props: SimpleUnitProps = {
      dna: createUnitSchema({      
        id: "credential",  
        version: "1.0.0"
      }),
      created: new Date(),
      metadata: config.metadata || {},
      customValue: config.value
    };
    
    return new SimpleUnit(props);
   
  }

// a few moments later

ServiceUnit.learn([cryptoUnit.teach()])

// Namespaced calling of learnt capabilities
ServiceUnit.execute('crypto-unit.encrypt'); 

```

### **8. PURE FUNCTION HEARTS**
*"Core logic should be pure functions - side effects isolated"*

**Rule:** Separate pure logic from stateful operations.

```typescript
// Pure function, tested in isolation
function generateKeyPair(algorithm: string): KeyPair { /* pure */ }

// Stateful unit wraps pure functions or add value through composition
class KeyUnit extends Unit<KeyUnitProps> {
  generate(algorithm, options) { 

    // Function as starting point.
    const keyPair = generateKeyPair(algorithm);     
    
    // Conditions and processing based on input and options
    
    return addedValueKeyPair;
 }
}
```

### **9. ALWAYS TEACH**
"Teaching is explicit binding - Unit's value proposition. Teach what you choose to share, not what you can do"

**Rule:** Teaching must be capability-based isolation, not arbitrary method exposure.

```typescript

// ✅ Correct - Teaching based on native capabilities of the Unit. Choose what to teach. 
teach(): TeachingContract {

	return {
	
	unitId: this.dna.id,
	  capabilities: {
      // Static-like functions - direct binding
      getPublicKey: this.getPublicKeyPEM.bind(this),
      getKeyType: this.getKeyType.bind(this),
      help: this.help.bind(this),
      toJSON: this.toJSON.bind(this),
      
      // Data access - direct value return
      algorithm: () => this.props.keyType,
      version: () => this.dna.version,
      
      // Functional methods - bind to preserve context
      sign: this.sign.bind(this),
      verify: this.verify.bind(this),
    }
}

// Or choose not to teach explicitly.
teach(): TeachingContract {    

   	return {	
	    unitId: this.dna.id,
	    capabilities: {}
  }
}

// ❌ Avoid - Arbitrary method exposure
teach() {
  return {   
    secretMethod: this.secretMethod.bind(this) // Leaking internals
    acquiredSign: this._capabilities('signer.sign') // Avoid teaching acquired capabilities 
    data: this.props // Do not expose private props.    
  };
}

```

### 10. EXPECT LEARNING

*"Avoid duplicate capabilities, structure code to expect learning - units prepare for capability acquisition"*

**Rule:** Units must be designed to gracefully handle learned capabilities and provide fallback patterns. 

```typescript
// ✅ Correct - Expect learning pattern from Signer/Key
class KeyUnit extends Unit<KeyUnitProps> {
  constructor(props: KeyUnitProps) {
    super(props);

  }
  
  // Signing learning is expected. 
  async sign(data: string): Promise<string> {
    
    // Expect to learn signing capability
    if (this.can('sign')) {
      return this.execute('signer.sign', data);
    }
    
    // Clear error when learning is needed
    throw new Error('Cannot sign - learn signing capability from Signer unit');
  }

}

```

### 11.ALWAYS HELP

"help() provides current, accurate, self-updating documentation"

```typescript
  
help(): void {

console.log(`

Signer Unit - Self-Contained Cryptographic Engine

Identity: ${this.whoami()}
Algorithm: ${this.keyType}
  
Core Capabilities:

- sign(data): Sign data with private key
- getPublicKey(): Get public key for sharing
- verify(data, signature): Verify signatures
- getAlgorithm(): Get signing algorithm
- getKey(): Get data needed to create associated Key unit
- toJSON(): Export metadata (no private key)
  
I Teach:

- sign(data): Sign data with private key
- getPublicKey(): Get public key for sharing
- getAlgorithm(): Get signing algorithm  
  
`);

}

// ❌ Avoid - Static dead documentation
help(): void {
  console.log('This unit can sign and verify'); // Might not be true
}

```

### #12: NAMESPACE EVERYTHING ✅

*"All learned capabilities must be namespaced to prevent collisions"*

**Rule:** Teaching contracts provide unitId, execute uses "unitId.capability" format.

```typescript
// ✅ Teaching - Always explicit, always namespaced

teach(): TeachingContract {
  return {
    unitId: this.dna.id,  // Required for namespacing
    capabilities: { sign: this.sign.bind(this) }
  };
}

// ✅  Capabilities namespace by unitId

learn(contracts: TeachingContract[]): void {
  for (const contract of contracts) {
    for (const [cap, impl] of Object.entries(contract.capabilities)) {
      // Create namespaced capability key: "unit-id.capability-name"
      const capabilityKey = `${contract.unitId}.${cap}`;

      // Store the implementation with namespace
      this._capabilities.set(capabilityKey, impl);
    }
  }
}

await unit.execute('signer.sign', data);  // Clear capability source

// ❌ Avoid - Ambiguous capability names
await unit.execute('sign', data);  // Which unit taught this?
```
# 13: TYPE HIERARCHY CONSISTENCY ✅

*"Config → Props → State → Output - consistent type naming across all units"*

**Rule:** Follow naming convention for all unit interfaces.

```typescript
// ✅ Consistent pattern across all units
interface UnitConfig {      // External input to static create()
  publicKey: string;
  options?: UnitOptions;
}

interface UnitProps {       // Internal state after validation, private immutable props.
  publicKey: string;
  validated: boolean;
  metadata: UnitMetadata;
}



class ConsistentUnit extends Unit<UnitProps> {
  
  // Private constructor
  private constructor(props:UnitProps) {
    super(props); // 
  }
  
  // Static create() 
  static create(input:UnitConfig ): ConsistentUnit {

    const props: UnitProps {/* validating and mapping input to internal state*/ }

    return new CalculatorUnit(props);
  }
  
  // ✅  Expose props through output membranes
  toJSON() {
      return {
          value: this.props.publicValue,
      }
  }
  
  // ✅  Return domain-ready object  
  toDomain(): DomainType {
      return {
          value: this.props.publicValue,
      }
  }

  // ❌ Avoid - Exposing private props directly 
  getProps(): UnitProps {
    return this.props;
  }

}

```

# 14: ERROR BOUNDARY CLARITY 

*"Exceptions for impossible states, Results for expected failures"*

**Rule:** Use exceptions for architectural violations, Results for operational failures.

```typescript
// Exceptions for impossible states (should never happen)
if (!this.props.publicKey) {
  throw new Error(`[${this.dna.id}] Invalid state: missing public key`);
}

/* 
 Result for expected failures (network, crypto, external systems)
 use dependency `import { Result } from @synet/patterns` for consistent Result experience or adopt node_modules/@synet/patterns/patterns/result.ts to maintain persistent DX
*/
const signResult = await this.execute('signer.sign', data);
if (!signResult.isSuccess) {
  return Result.fail(`Signing failed: ${signResult.error}`, error instanceof Error);
}

return Result.success(data)

/**
Result response:
*/

signResult.isSuccess; // Operation succeeded with response
signResult.isFailure; // Operation failed with errorMessage and errorCause
signResult.erorrCause - // always instanceof Error
signResult.errorMessage - // error message from Result.fail()

const value = signResult.value; // Response data always in value
```

# 15: TELL DEVELOPER HOW TO FIX ERRORS
*"Error messages provide consciousness-guided resolution paths"*

**Rule:** Include unit identity, available capabilities, and resolution guidance.

```typescript
throw new Error(`
[${this.dna.id}] Cannot execute '${capability}' capability

Available capabilities: ${this.capabilities().join(', ')}
Required capability: '${requiredCapability}'

Resolution:
  const provider = ProviderUnit.create();
  ${this.dna.id}.learn([provider.teach()]);
  
Context: ${this.state().summary}
`);
```

# 16: CAPABILITY VALIDATION 
*"Units validate capability prerequisites before execution"*

**Rule:** Check capabilities exist before execute, provide helpful errors.

```typescript

async sign(data: string): Promise<string> {
  
  if (!this.can('signer.sign')) {
    throw new Error(`[${this.dna.id}] Cannot sign - missing 'signer.sign' capability. Learn from: Signer.create().teach()`);
  }
  
  return this.execute('signer.sign', data);
}
```

### 17. VALUE OBJECT FOUNDATION

*"Units are immutable value objects with identity and capabilities"*

**Rule:** All units extend Unit<T extends UnitProps> which extends ValueObject<T>.


```typescript

// ✅ Foundation architecture
export abstract class Unit<T extends UnitProps> extends ValueObject<T> implements IUnit

export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);  // ✅ Immutability guaranteed
  }
  
  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}

// ✅ Immutable benefits in action

const unit1 = MyUnit.create({ value: 'test' });
const unit2 = MyUnit.create({ value: 'test' });

unit1.equals(unit2);  // true - value equality
unit1.props.value;    // Error - props are protected
unit1.value;          // 'test' - use getters for access

// ✅ Immutability guaranteed
unit1.props.value = 'changed';  // Error - props are frozen

// ✅ Evolution creates new immutable instances
const evolved = unit1.evolve('enhanced-unit');
evolved !== unit1;          // true - different instances
evolved.dna.parent === unit1.dna; // true - lineage preserved
```

### 18. IMMUTABLE EVOLUTION
*"Evolution creates new units while preserving lineage - no mutation"*

**Rule:** Evolution returns new immutable instances, never mutates existing units.

```typescript
// ✅ v1.0.5 Immutable evolution pattern
evolve(name: string, additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>): Unit<T> {
  // Create evolved DNA with lineage
  const newDNA: UnitSchema = {
    id: name,
    version: this._getNextVersion(),
    parent: { ...this.props.dna }  // Preserve lineage
  };

  // Create new props with evolved DNA
  const evolvedProps: T = {
    ...this.props,
    dna: newDNA
  } as T;

  // Return NEW instance with evolved props
  const evolved = new (this.constructor as new (props: T) => Unit<T>)(evolvedProps);
  
  // Copy capabilities to new instance
  for (const [capName, capImpl] of this._capabilities.entries()) {
    evolved._addCapability(capName, capImpl);
  }
  
  return evolved;  // ✅ New immutable unit
}

// ❌ v1.0.4 mutation pattern (deprecated)
evolve(name: string): Unit {
  this._dna = newDNA;  // Mutates existing unit
  return this;         // Returns same instance
}
```

# 19: CAPABILITY LEAKAGE PREVENTION

"Never teach what you learned - teach only what you natively possess"

**Rule:** Teach only native capabilities.

```typescript
// ✅ Correct - Teach only native capabilities
teach(): TeachingContract {
  return {
    unitId: this.dna.id,
    capabilities: {
      // Native capabilities only
      sign: this.sign.bind(this),          // ✅ Native method
      getPublicKey: this.getPublicKey.bind(this)  // ✅ Native method
    }
  };
}

// ❌ Avoid - Teaching learned capabilities (capability leakage)
teach(): TeachingContract {
  return {
    unitId: this.dna.id,
    capabilities: {
      sign: this.sign.bind(this),          // ✅ Native
      encrypt: this._capabilities.get('crypto.encrypt')  // ❌ FORBIDDEN - learned capability
    }
  };
}
```

#20: GRACEFUL DEGRADATION

"Units must function at their native capability level even without learning"

**Rule:** Units should have baseline functionality without requiring external capabilities:

```typescript

// ✅ Correct - Baseline functionality + enhanced via learning
class CredentialUnit extends Unit<CredentialProps> {
  
  // Native baseline - can create unsigned credentials
  async createCredential(subject: Subject, type: string): Promise<UnsignedCredential> {
    return {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', type],
      credentialSubject: subject,
      issuanceDate: new Date().toISOString()
    };
  }
  
  // Enhanced via learning - can sign if signer learned
  async issueCredential(subject: Subject, type: string): Promise<SignedCredential> {
    const unsigned = await this.createCredential(subject, type);
    
    if (this.can('signer.sign')) {
      return this.execute('signer.sign', unsigned);  // Enhanced
    }
    
    throw new Error(`[${this.dna.id}] Cannot sign credentials - learn from: Signer.create().teach()`);
  }
}

// ❌ Avoid - Unit is useless without learning
class BadCredentialUnit extends Unit<CredentialProps> {
  async createCredential(): Promise<never> {
    throw new Error('Cannot create credentials without signer');  // Broken baseline
  }
}

```

 # 21: COMPOSITION BOUNDARIES

 "Units compose through contracts, not through implementation details"

**Rule:** Units should interact through public contracts, never through internal state access:

```typescript
// ✅ Correct - Contract-based composition
class VaultUnit extends Unit<VaultProps> {
  
  async storeEncryptedCredential(filepath:string, credential: VerifiableCredential): Promise<Result<void>> {
    
    // Compose through teaching contracts

    if (!this.can('crypto.encrypt')) {
        return Result.fail(`[${this.dna.id}] Cannot encrypt credentials - learn from: Crypto.create().teach()`)
    }

    if (!this.can('fs.writeFile')) {
        return Result.Fail(`[${this.dna.id}] Cannot persist credentials - learn from: FileSystem.create().teach()`)
    }

     const encrypted = await this.execute('crypto.encrypt', JSON.stringify(credential));     
     
     try {      
        
        await this.execute('fs.writeFile', filepath, encrypted);       
     
     } catch(error as unknown) {
      
      // Use Result pattern for complex compositions      
      return Result.fail(
        `Failed to persist credential: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      );
     }
     
     return Result.success(undefined);

  }
}

// Usage - composition through contracts
const vault = VaultUnit.create();
const crypto = CryptoUnit.create();
const fs = FileSystemUnit.create();

vault.learn([crypto.teach(), fs.teach()]);  // ✅ Contract-based composition

// ❌ Avoid - Implementation detail access
class BadVaultUnit extends Unit<VaultProps> {
  
  async storeCredential(credential: VerifiableCredential, cryptoUnit: CryptoUnit): Promise<string> {
    // Direct implementation access breaks autonomy
    const encrypted = cryptoUnit.encryptData(JSON.stringify(credential));  // ❌ Tight coupling
    return this.storeEncrypted(encrypted);
  }
}
```

# 22. STATELESS OPERATIONS

"Operations are stateless functions over immutable props and mutable capabilities - capabilities grow, operations don't mutate"

Rule: Operations should be deterministic given current state (props + capabilities), with capability growth explicit and operation logic pure. Learn capabilities, do not mutate private states.

```typescript
// ✅ STATELESS UNIT - Deterministic based on visible state
class StatelessUnit extends Unit<StatelessProps> {
  
  // ✅ Pure operation - same input + props = same output
  calculateHash(data: string): string {
    const salt = this.props.salt;  // Uses visible props state
    return crypto.hash(data + salt);  // Deterministic
  }
  
  // ✅ Stateless with capabilities - behavior determined by learned state
  async sign(data: string): Promise<string> {
    // Behavior determined by visible capability state
    if (this.can('signer.sign')) {
      return this.execute('signer.sign', data);  // Learned capability
    }
    
    return this.basicSign(data);  // Native capability
  }
  
  // ✅ Side effects explicit in signature and return type
  async persistCredential(credential: VerifiableCredential): Promise<Result<StorageLocation>> {
    // Side effect clearly indicated by:
    // 1. Method name (persist)
    // 2. Return type (Result<T>)
    // 3. External dependency explicit
    
    if (!this.can('fs.writeFile')) {
      return Result.fail('Cannot persist - learn from FileSystem.create().teach()');
    }
    
    try {
      const location = await this.execute('fs.writeFile', 'creds.json', credential);
      return Result.success(location);
    } catch (error) {
      return Result.fail('Persistence failed', error as Error);
    }
  }
  
}

// ❌ STATEFUL - Hidden mutations break determinism
class StatefulUnit extends Unit<StatefulProps> {
  private _cache = new Map();  // Hidden mutable state
  private _requestCount = 0;   // Hidden counter
  
  async process(data: string): Promise<string> {
    this._requestCount++;  // ❌ Avoid: Hidden side effect
    
    // ❌ Avoid: Behavior changes based on hidden state
    if (this._cache.has(data)) {
      return this._cache.get(data);  // Different execution path
    }

     // ✅ Correct: Behavior determined by learned capabilities (visible state)
    if (this.can('cache.get')) {
       return this.execute('cache.get', data);  // Predictable based on capabilities
    }

    const result = await this.expensiveOperation(data);

    // ❌ Avoid: Hidden state mutation
    this._cache.set(data, result);  

    // ✅ Correct
    if (this.can('cache.set')) {
       return this.execute('cache.set', data);  // Deterministic
    }

    return result;
  }
}
```
