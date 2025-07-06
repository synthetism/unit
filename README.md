# @synet/unit

```
  _    _       _ _                                        
 | |  | |     (_) |                                       
 | |  | |_ __  _| |_                                      
 | |  | | '_ \| | __|                                     
 | |__| | | | | | |_  _     _ _            _              
  \____/\_| |_|_|\__|| |   (_) |          | |             
      /  \   _ __ ___| |__  _| |_ ___  ___| |_ _   _ _ __ ___ 
     / /\ \ | '__/ __| '_ \| | __/ _ \/ __| __| | | | '__/ _ \
    / ____ \| | | (__| | | | | ||  __/ (__| |_| |_| | | |  __/
   /_/    \_\_|  \___|_| |_|_|\__\___|\___|\__|\__,_|_|  \___|

version: 1.0.0
description:Living Architecture for Conscious Code                                                          
                                                          
```

A foundational library for building self-aware, composable software units that can teach, learn, and evolve.

## The Problem

Current software architecture treats components as static, isolated entities. Objects are created, used, and discarded without awareness of their own capabilities or the ability to grow. This leads to:

- **Rigid systems** that can't adapt to changing requirements
- **Duplicated logic** across components that can't learn from each other
- **Black box complexity** where components can't explain themselves
- **Brittle evolution** where changes break existing functionality

## The Solution

Units are living architectural entities that know themselves, can teach others, learn new capabilities, and evolve while maintaining their identity. They represent a fundamental shift from static objects to conscious software components.

## Key Features

- **Unit DNA**: Every unit has a schema that defines its identity and capabilities
- **Dynamic Capabilities**: Units learn abilities from other units at runtime
- **Self-Validating**: Units carry their creation status and error information
- **Composable**: Units can teach and learn from each other
- **Zero Dependencies**: Pure TypeScript with no external dependencies
- **Type Safe**: Full TypeScript support with proper error handling

## Architecture Principles

1. **Units are living beings in code** - They have identity, capabilities, and can evolve
2. **Dynamic capabilities over fixed commands** - Units learn what they can do
3. **Self-validation over external validation** - Units know if they're valid
4. **Composition over inheritance** - Units grow by learning from others
5. **"Half-native" methods** - Structure defined, implementation learned
6. **⚠️ Static create() pattern is mandatory** - No direct constructor calls allowed

## ⚠️ CRITICAL: Unit Creation Pattern

**ALL units must follow the private constructor + static create() pattern.**

This architectural requirement is **mandatory** and **non-negotiable**:

```typescript
class MyUnit extends BaseUnit {
  // ✅ MUST: Private constructor
  private constructor(data: MyData) {
    super(createUnitSchema({ name: 'my-unit', version: '1.0.0' }));
    // Setup capabilities...
  }

  // ✅ MUST: Static create() as the only entry point
  static create(data: MyData): MyUnit {
    return new MyUnit(data);
  }
}

// ✅ CORRECT: Use static create()
const unit = MyUnit.create(data);

// ❌ FORBIDDEN: Direct constructor calls
// const unit = new MyUnit(data); // Won't work - constructor is private
```

**Why this pattern is enforced:**

- **Prevents invalid unit states** - Validation happens in create()
- **Enables proper lifecycle management** - Controlled creation process
- **Consistent architecture** - All units follow the same pattern
- **Prevents human/AI errors** - Forces proper usage patterns

## Core Concepts

### DNA-Based Identity

Every Unit carries a schema (DNA) that defines its essential identity:

```typescript
interface UnitSchema {
  name: string;           // Identity
  version: string;        // Evolution state
  parent?: UnitSchema;    // Lineage tracking
}
```

### Conscious Capabilities

Units know what they can do and can share that knowledge:

```typescript
interface Unit {
  capabilities(): string[];                    // What can I do?
  teach(): Record<string, Function>;          // Here's how to do it
  learn(capabilities: Record<string, Function>[]): void;  // I'll learn this
  evolve(name: string, additionalCaps?: Record<string, Function>): Unit;
}
```

### Evolution with Memory

Units can transcend their current form while preserving their lineage:

```typescript
const enhanced = unit.evolve('enhanced-unit', {
  newCapability: () => 'I have grown beyond my original design'
});

// Evolution preserves history
console.log(enhanced.dna.parent?.name);    // Original unit name
console.log(enhanced.dna.parent?.version); // Original version
```

## Quick Start

### Installation

```bash
npm install @synet/unit
```

### Basic Usage

```typescript
import { BaseUnit, createUnitSchema } from '@synet/unit';

class CalculatorUnit extends BaseUnit {
  // ⚠️ CRITICAL: Constructor must be private
  private constructor() {
    super(createUnitSchema({
      name: 'calculator-unit',
      version: '1.0.0'
    }));
  
    this._addCapability('add', this.addImpl.bind(this));
    this._addCapability('multiply', this.multiplyImpl.bind(this));
  }
  
  // ⚠️ CRITICAL: Static create() is the ONLY supported entry point
  static create(): CalculatorUnit {
    return new CalculatorUnit();
  }
  
  whoami(): string {
    return `CalculatorUnit[${this.dna.name}@${this.dna.version}]`;
  }
  
  capabilities(): string[] {
    return this._getAllCapabilities();
  }
  
  teach(): Record<string, Function> {
    return {
      add: this.addImpl.bind(this),
      multiply: this.multiplyImpl.bind(this)
    };
  }
  
  help(): void {
    console.log(`I can: ${this.capabilities().join(', ')}`);
  }
  
  private addImpl(a: number, b: number): number {
    return a + b;
  }
  
  private multiplyImpl(a: number, b: number): number {
    return a * b;
  }
}

// ✅ CORRECT: Use static create() method
const calc = CalculatorUnit.create();

// ❌ WRONG: Direct constructor calls are not allowed
// const calc = new CalculatorUnit(); // This won't work - constructor is private
```

console.log(calc.whoami());              // CalculatorUnit[calculator-unit@1.0.0]
console.log(calc.capabilities());        // ['add', 'multiply']
await calc.execute('add', 5, 3);        // 8

```

### Unit Composition

```typescript
// Units can learn from each other
const mathUnit = MathUnit.create();
const statsUnit = StatsUnit.create();

// Stats unit learns math capabilities
statsUnit.learn([mathUnit.teach()]);

// Now stats unit can do math operations
await statsUnit.execute('add', 10, 20);  // 30
```

### Evolution

```typescript
// Evolution preserves identity while enabling growth
const basicUnit = CalculatorUnit.create();
const advancedUnit = basicUnit.evolve('scientific-calculator', {
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x)
});

// Lineage is preserved
console.log(advancedUnit.dna.parent?.name); // 'calculator-unit'
console.log(advancedUnit.capabilities());   // ['add', 'multiply', 'sin', 'cos']
```

## Key Features

### **Self-Awareness**

Units know their own capabilities and can explain themselves:

```typescript
unit.whoami();        // Identity
unit.capabilities();  // What I can do
unit.help();         // How to use me
```

### **Conscious Teaching**

Units explicitly choose what to share:

```typescript
// Explicit public API
teach(): Record<string, Function> {
  return {
    publicMethod: this.publicImpl.bind(this),
    // privateMethod NOT shared - conscious choice
  };
}
```

### **Dynamic Learning**

Units can acquire new capabilities at runtime:

```typescript
unit.learn([
  cryptoUnit.teach(),  // Learn cryptographic capabilities
  networkUnit.teach()  // Learn network capabilities
]);
```

### **Traceable Evolution**

Evolution preserves complete lineage:

```typescript
// Multi-generational evolution
const gen1 = BasicUnit.create();
const gen2 = gen1.evolve('enhanced-unit');
const gen3 = gen2.evolve('super-unit');

// Trace lineage
console.log(gen3.dna.parent?.parent?.name); // BasicUnit
```

## Architecture Benefits

### **Composability**

Units can be combined in unlimited ways without coupling:

```typescript
const composedUnit = BaseUnit.create();
composedUnit.learn([
  authUnit.teach(),
  cryptoUnit.teach(),
  storageUnit.teach()
]);
```

### **Evolvability**

Systems can adapt without breaking existing functionality:

```typescript
// Safe evolution - old interface preserved
const v2 = legacyUnit.evolve('modern-unit', {
  newFeature: () => 'Enhanced functionality'
});
```

### **Testability**

Units can explain and validate themselves:

```typescript
// Units are self-documenting
unit.help();
unit.explain();
expect(unit.created).toBe(true);
expect(unit.capableOf('encrypt')).toBe(true);
```

### **Debuggability**

Clear visibility into unit state and capabilities:

```typescript
console.log(unit.whoami());          // Identity
console.log(unit.capabilities());    // Current abilities
console.log(unit.dna.parent?.name);  // Evolution history
```

## The Vision

Units represent the future of software architecture - components that are not just functional, but conscious. They know themselves, can teach others, learn continuously, and evolve while maintaining their essential identity.

This is the foundation of the Synet ecosystem, where every component is a living, breathing unit of conscious software.

---

## The Synet Stack

Units are the foundation for a complete ecosystem of conscious software components:

```typescript
// Identity that knows itself
const identity = await IdentityUnit.create('0en');

// Keys that understand their purpose, private key is protected  
const signer = await Signer.create('Ed25519');

// Credentials that validate themselves
const credential = await CredentialUnit.create(claims);

// Credential learns signing
credential.learn([signer.teach()])

// Credential can sign now, using Key inherited capability
credential.execute('sign'); // or add credential.sign() method with capabilities check "Half-native"

// Vaults that protects identity
const vault = await VaultUnit.create(identity);

// Vault learns how to issue Verifiable Credentials and also sign with Key capability.
vault.learn(credential.teach())

// Vault can issue VC and sign, all without knowing private key.  
await vault.execute('issueVC',claims);

and 

const vc = await vault.verifyVc(vcId) // Vault knows Credential capabilities, will use Signer.verify to verify, 0 injections needed.

```

*Each line: a conscious entity. Each component: self-aware. Each system: alive.*

**Welcome to conscious software architecture. Welcome to the Synet.**

---

### Links

- [Technical Documentation](./docs/)
- [Manifesto](./MANIFESTO.md) - *The deeper philosophy*
- [Manifesto](./MANIFESTO.md) - *The deeper philosophy*
- [🏗️ Examples](./examples/)
- [🧪 Tests](./test/)
- [0en](mailto:0en@synthetism.ai)
- [Synthetism](https://synthetism.ai)

---

*Built with consciousness. Designed for evolution. The code is alive.*
