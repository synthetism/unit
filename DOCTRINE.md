## **SYNET UNIT ARCHITECTURE DOCTRINE**

### 1. ZERO DEPENDENCY 
*"Dependencies are technical debt - eliminate them to achieve infinite freedom"*

**Rule:** No external dependencies or injections in core units. Every unit must be self-contained.

```typescript
// ✅ Correct - Pure, self-contained
export class CryptoUnit extends Unit {
  // Uses only native crypto, no external libs
}

// ❌ Avoid - Inject external dependency
export class BadUnit extends Unit {
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

*"Props contain all state - no duplication, no private field pollution"

**Rule:** Units are constructed via `super(props)`, not complex constructors with dependencies, no private underscore pollution.

```typescript

// ✅ Correct - Props-based construction

// Input data
export interface KeyUnitConfig {

   	publicKey:string;	
	privateKey:string;
    meta?: Record<string, unknown> = {}
    // ... other config options.

}

// Private Unit props

interface KeyUnitProps  {
	publicKey:string;	
	privateKey:string;
    secure: boolean;
}

class KeyUnit extends Unit {
    
  // Constructor is private
  private constructor(props: KeyUnitProps) {
    super(props);
  }

  // Params validation and props construction with static `create()`
  static create(params: KeyUnitConfig): KeyUnit { 
    
     const props = {
        publicKey: params.publicKey,
        privateKey: params.publicKey,
     }

     if(props.meta?.private) {
        props.secure = true;
     }
               
     return new KeyUnit(props);
    
  }

 // Use getters to expose props

  get publicKeyPEM(): string {
    return this.props.publicKey;
  }

}

// ❌ Avoid  - duplication pollution  
class BadUnit {
  private _publicKey: string; // Unnecessary duplication
  private _privateKey: string; // Props become stale
}

```

### 4. CREATE NOT CONSTRUCT
*"Static create() methods provide clean interfaces - hide complexity behind factories"*

**Rule:** Primary construction through `static create()`. Constructors is private.

```typescript

// ✅ Correct - Factory pattern
export class FileSystem extends Unit {
  private constructor(props: FileSystemProps) { super(props); }
  static create(config: FileSystemConfig): FileSystem { 
	  
	  return new FileSystem(props);
  }
}

const unit = FileSystem.create(fileSystemConfig);

// ❌ Avoid  - Public constructor
export class BadUnit extends Unit {
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

### **7. EVERY UNIT MUST HAVE DNA**
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

// Built-in schema validation
this.dna = createUnitSchema({
  name: 'crypto-unit', // No spaces, no special symbols
  version: '1.0.0',
});


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
class KeyUnit extends Unit {
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
class KeyUnit extends Unit {
  constructor(props: KeyUnitProps) {
    super(props);

  }
  
  // Signing learning is expected. "Half-Native" method.

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


