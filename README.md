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

version: 1.0.5
description: Living Architecture for Conscious Code                                              
                                              
```

A foundational library for building self-aware, composable software units that can teach, learn, and evolve.

## The Problem

Current software architecture treats components as static, isolated entities. Objects are created, used, and discarded without awareness of their own capabilities or the ability to grow. This leads to:

```typescript
/* 
 * Framework thinking, dependency chaos
 @depricated
*/
class MessyUnit {
  constructor(
    private crypto: CryptoLib,     // External dependency
    private fs: FileSystem,        // Injection pollution  
    private logger: Logger         // Complexity worship
  ) {}
  
  doEverything() { /* monolithic mess */ }
}

```

- **Rigid systems** that can't adapt to changing requirements
- **Duplicated logic** across components that can't learn from each other
- **Black box complexity** where components can't explain themselves
- **Brittle evolution** where changes break existing functionality
- **Dependency entanglement** - everything depends on everything 
- **Abstraction cathedrals** - managers, agents (managers of managers), services, plugins, adapters, configuration hell = enterprise anti-pattern for simple logic.
- **Street Magic** - rabbit hole of hidden interactions.

## The Solution

Composition over inheritance. Simple Unit composition creates complex behaviours.

```typescript
// Unit consciousness, capability flow
class SimpleUnit extends Unit<SimpleUnitProps> {
  protected constructor(props: SimpleUnitProps) { super(props); }
  
  static create(config: SimpleUnitConfig): SimpleUnit { 
    const props: SimpleUnitProps = {
      dna: createUnitSchema({ id: 'simple-unit', version: '1.0.0' }),
      ...validateConfig(config)
    };
    return new SimpleUnit(props);
  }
  
  teach(): TeachingContract { /* explicit capability sharing */ }
  learn(contracts: TeachingContract[]): void { /* conscious evolution */ }
  execute(capability: string, ...args: unknown[]): Promise<unknown> { /* capability execution */ }
}

const simpleUnit = SimpleUnit.create();
const smartUnit = SmartUnit.create();

simpleUnit.learn([smartUnit.teach()]); // simple became smart
smartUnit.learn([simpleUnit.teach()]); // learn new capabilities 

```
## Simple composition truths

-  Each unit can learn from 0 to X other units
-  For each unit: 2^X possible learning combinations
-  For 10 units: (2^9)^10 = 2^90 ≈ **1.24 × 10^27 compositions**

## Unit Architecture

Units are living architectural entities that know themselves, can teach others, learn new capabilities, and evolve while maintaining their identity. They represent a fundamental shift from static objects to conscious software components.

Built on **ValueObject foundation**, units combine:
- **Immutable props** (identity, state) via `ValueObject<T>`
- **Mutable capabilities** (learned behaviors) via capability map
- **Stateless operations** (deterministic given current state)

```typescript
interface Unit<T> {
  private readonly props: T; // Private immutable deterministic state

  create()   // Genesis - how unit comes into being and protect itself.
  execute()  // Action - how unit expresses itself  
  teach()    // Expression - how unit shares itself
  learn()    // Evolution - how unit evolves itself
}
```

- **Unit DNA**: Every unit has a schema that defines its identity and capabilities
- **Dynamic Capabilities**: Units learn abilities from other units at runtime
- **Immutable State**: Props are frozen via ValueObject pattern for mathematical consistency
- **Self-Validating**: Units carry their creation status and error information
- **Composable**: Units can teach and learn from each other


## Architecture Principles

1. **Units are living beings in code** - They have identity, capabilities, and can evolve. 
2. **Dynamic capabilities over fixed commands** - Units learn what they can do
3. **Self-validation over external validation** - Units know if they're valid
4. **Composition over inheritance** - Units grow by learning from others
6. **Expected learning** - Structure defined, implementation learned
8. **One thing** - Do one thing and do it well and teach others.

## Unit Creation Pattern

**ALL units must follow the protected constructor + static create() pattern.**

```typescript
interface MyUnitConfig {
  value: string;
  options?: MyOptions;
}

interface MyUnitProps extends UnitProps {
  dna: UnitSchema;
  value: string;
  validated: boolean;
  created: Date;
  metadata: Record<string, unknown>;
}

class MyUnit extends Unit<MyUnitProps> {

  // Protected constructor (enables evolution)
  protected constructor(props: MyUnitProps) {
    super(props);
  }

  // Static create() as the only entry point
  static create(config: MyUnitConfig): MyUnit {
    const props: MyUnitProps = {
      dna: createUnitSchema({ id: 'my-unit', version: '1.0.0' }),
      value: config.value,
      validated: true,
      created: new Date(),
      metadata: config.options || {}
    };
    
    return new MyUnit(props);
  }
}

// ✅ OK: Use static create()
const unit = MyUnit.create({ value: 'test' });

// ❌ FAIL: Direct constructor calls
// const unit = new MyUnit(props); // Won't work - constructor is protected
```

This pattern:

- **Prevents invalid unit states** - Validation happens in create()
- **Enables proper lifecycle management** - Controlled creation process
- **Enables evolution** - Protected constructor allows inheritance
- **Consistent architecture** - All units follow the same pattern
- **Prevents human/AI errors** - Forces proper usage patterns

## Core Concepts

### DNA-Based Identity

Every Unit carries a schema (DNA) that defines its essential identity:

```typescript
interface UnitSchema {
  id: string;           // Identity
  version: string;        // Evolution state
  parent?: UnitSchema;    // Evolution lineage
}
```

### Capability Acquisition

Units know what they can do and can share that knowledge:

```typescript
interface TeachingContract {
  unitId: string;
  capabilities: Record<string, (...args: unknown[]) => unknown>;
}

interface IUnit {
  readonly dna: UnitSchema;
  capabilities(): string[];                           // What can I do?
  teach(): TeachingContract;                         // Here's how to do it
  learn(contracts: TeachingContract[]): void;        // I'll learn this
  evolve(name: string, additionalCaps?: Record<string, Function>): Unit<T>;
  execute(capability: string, ...args: unknown[]): Promise<unknown>;
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
import { Unit, createUnitSchema, type UnitProps } from '@synet/unit';

interface CalculatorConfig {
  precision?: number;
}

interface CalculatorProps extends UnitProps {
  dna: UnitSchema;
  precision: number;
  created: Date;
  metadata: Record<string, unknown>;
}

class CalculatorUnit extends Unit<CalculatorProps> {
  
  // Protected constructor (enables evolution)
  protected constructor(props: CalculatorProps) {
    super(props);
  }
  
  // Static create() 
  static create(config: CalculatorConfig = {}): CalculatorUnit {
    const props: CalculatorProps = {
      dna: createUnitSchema({
        id: 'calculator-unit',
        version: '1.0.0'
      }),
      precision: config.precision || 2,
      created: new Date(),
      metadata: {}
    };
    
    return new CalculatorUnit(props);
  }
  
  // Static create() 
  static create(): CalculatorUnit {
    return new CalculatorUnit();
  }
  
  whoami(): string {
    return `[🧮] Calculator Unit - Mathematical operations (${this.dna.id})`;
  }
  
  capabilities(): string[] {
    return ['add', 'multiply', ...this._getAllCapabilities().filter(cap => cap.includes('.'))];
  }
  
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        add: this.addImpl.bind(this),
        multiply: this.multiplyImpl.bind(this)
      }
    };
  }
  
  help(): void {
    console.log(`
🧮 Calculator Unit - Mathematical Operations

NATIVE CAPABILITIES:
• add(a, b) - Addition operation
• multiply(a, b) - Multiplication operation

LEARNED CAPABILITIES:
${this._getAllCapabilities().filter(cap => cap.includes('.')).map(cap => `• ${cap}`).join('\n') || '• None learned yet'}

USAGE:
  const calc = CalculatorUnit.create({ precision: 4 });
  await calc.execute('add', 5, 3);        // 8
  await calc.execute('multiply', 4, 7);   // 28
    `);
  }
  
  private addImpl(a: number, b: number): number {
    const result = a + b;
    return Math.round(result * Math.pow(10, this.props.precision)) / Math.pow(10, this.props.precision);
  }
  
  private multiplyImpl(a: number, b: number): number {
    const result = a * b;
    return Math.round(result * Math.pow(10, this.props.precision)) / Math.pow(10, this.props.precision);
  }
}

// Usage
const calc = CalculatorUnit.create({ precision: 4 });

console.log(calc.whoami());              // [🧮] Calculator Unit - Mathematical operations (calculator-unit)
console.log(calc.capabilities());        // ['add', 'multiply']
await calc.execute('add', 5, 3);        // 8

```

### Unit Composition

```typescript
import { Unit, createUnitSchema, type UnitProps, type TeachingContract } from '@synet/unit';

// Units can learn from each other
const mathUnit = MathUnit.create();
const statsUnit = StatsUnit.create();

// Stats unit learns math capabilities
statsUnit.learn([mathUnit.teach()]);

// Now stats unit can do math operations
await statsUnit.execute('math-unit.add', 10, 20);  // 30
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
console.log(advancedUnit.dna.parent?.id); // 'calculator-unit'
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
// Explicit public API via TeachingContract
teach(): TeachingContract {
  return {
    unitId: this.dna.id,  // Required for namespacing
    capabilities: {
      publicMethod: this.publicImpl.bind(this),
      // privateMethod NOT shared - conscious choice
    }
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
console.log(gen3.dna.parent?.parent?.id); // BasicUnit
```

## Architecture Benefits

### **Composability**

Units can be combined in unlimited ways without coupling:

```typescript
const composedUnit = Unit.create();
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
console.log(unit.dna.parent?.id);  // Evolution history
```

## The Vision

Units represent the future of software architecture - components that are not just functional, but conscious. They know themselves, can teach others, learn continuously, and evolve while maintaining their essential identity.

This architecture follows the **22 Unit Architecture Doctrines** that ensure units remain conscious, composable, and evolutionarily stable. From zero dependencies to stateless operations, these principles create software that AI agents can understand, compose, and evolve autonomously.


---

## The Synet Stack

Units are the foundation for a complete ecosystem of conscious software components:

```typescript
// Identity that knows itself
const identity = await IdentityUnit.create('0en');

// Keys that understand their purpose, private key is protected  
const signer = await Signer.generate('Ed25519');

// Credentials that validate themselves
const credential = await CredentialUnit.create(claims);

// Credential learns signing
credential.learn([signer.teach()])

// Credential can sign, using signer inherited capability.
credential.execute('signer.sign'); 

// Vaults that protects identity
const vault = await VaultUnit.create(identity);

// Vault learns how to issue Verifiable Credentials and also sign with Signer capability.
vault.learn(credential.teach())

// Vault can issue VC and sign, all without knowing private key.  
await vault.execute('credential.issueVC',claims);


```

*Each line: a conscious entity. Each component: self-aware. Each system: alive.*

**Welcome to conscious software architecture. Welcome to Synet.**

---

### Links

- [Technical Documentation](./docs/)
- [Function-Behaviour-Structure Analysis](./docs/FUNCTION-BEHAVIOUR-STRUCTURE.md) - *How Unit Architecture implements FBS ontology*
- [Manifesto](./MANIFESTO.md) - *The deeper philosophy*
- [Doctrine](./DOCTRINE.md) - *The 22 architectural principles*
- [🏗️ Examples](./examples/)
- [🧪 Tests](./test/)
- [0en](mailto:0en@synthetism.ai)
- [Synthetism](https://synthetism.ai)

---

*Built with consciousness. Designed for evolution. The code is alive.*
