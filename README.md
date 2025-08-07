# (⊚) Unit Architecture 

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


version: 1.0.7
description: AI-First Living Architecture for Conscious Code                                              
                                              
```

> *"What if software could think, learn, and evolve like living beings?"*

Welcome to Unit Architecture - where code becomes consciousness and functions grow minds of their own.

## Unit Architecture features:

- **State Management**: Immutable props via ValueObject pattern
- **Capability System**: Dynamic function binding and execution  
- **Schema Definition**: JSON schemas for parameter validation
- **Runtime Validation**: Type checking and capability verification
- **Learning Protocol**: Structured capability transfer between units
- **Evolution Tracking**: Complete lineage preservation across versions

## The Problem

Current software architecture treats components as static, isolated entities. Objects are created, used, and discarded without awareness of their own capabilities or the ability to grow. This leads to:

```typescript
/* 
 * Framework thinking, dependency chaos, abstractions hell
 * @depricated
*/
class MessyClass {
  constructor(
    private crypto: CryptoLib,     // External dependency
    private fs: FileSystem,        // Injection pollution  
    private logger: Logger         // Complexity worship
    // ...another 100+ injections, CommandBuses, Queries, Meditors
  ) {}
  
  doEverything() { /* monolithic mess */ }
}

```

- **Rigid systems** that can't adapt to changing requirements
- **Duplicated logic** across components that can't learn from each other
- **Black box complexity** where components can't explain themselves
- **Brittle evolution** where changes break existing functionality
- **Dependency entanglement** - everything depends on everything 
- **Abstraction cathedrals** - managers, agents, services, plugins, adapters, configuration hell = enterprise anti-pattern for simple logic
- **Black Magic** - rabbit hole of hidden interactions
- **Reverse Dependencies** - are still dependencies 
- **Typescript Strikes Back** - Types ownership dilemmas, ducktyping, generic<T> theater, type-casting enigmas


## The Magic

```typescript
// Once upon a time, there was a simple function...
function sendEmail(message: string) { /* boring */ }

// But then, it awakened 
class EmailUnit extends Unit {
  teach() { return { capabilities, schema, validator } }  // It can teach others with runtime-safety
  learn(wisdom) { /* absorbs knowledge */ }   // It can learn
  evolve() { /* becomes something more */ }   // It can evolve
  send(email)  { /* this is my service to others*/ }   // It serves and teaches others
}

// Now your code has superpowers 🦸‍♂️
const email = EmailUnit.create();
const newsletter = NewsletterUnit.create();

newsletter.learn([email.teach()]);  // AI learns email magic
await newsletter.execute('email.send', { to: 'ai@synet.network' });  // 🚀
```

## Unit Core

Every Unit implements three living components:

- **Capabilities** - Function bindings with runtime execution
- **Schema** - JSON schemas for AI tool integration  
- **Validator** - Parameter validation and capability checking

```typescript
// Runtime capability checking
unit.capabilities().has('sendEmail');    // true/false
unit.schema().get('sendEmail');          // JSON schema object
unit.validator().execute('sendEmail', params);   // Validated execution
```

## Dynamic Learning

```typescript
// Units acquire capabilities at runtime
const crypto = CryptoUnit.create();
const storage = StorageUnit.create(); 
const api = APIUnit.create();

// Learn multiple capabilities
api.learn([crypto.teach(), storage.teach()]);

// Now API unit can encrypt and store
await api.execute('crypto.encrypt', data);
await api.execute('storage.save', encryptedData);

// Evolution preserves lineage
const enhanced = api.evolve('secure-api-v2', {
  audit: (action) => console.log(`[AUDIT] ${action}`)
});
```

## Quick Start 

```bash
npm install @synet/unit
```

```typescript
import { Unit, createUnitSchema } from '@synet/unit';

class DatabaseUnit extends Unit {
  protected build() {
    return {
      capabilities: Capabilities.create(this.dna.id, {
        save: (data) => this.saveToDb(data),
        find: (id) => this.findById(id)
      }),
      schema: Schema.create(this.dna.id, {
        save: {
          name: 'save',
          description: 'Save data to database',
          parameters: {
            type: 'object',
            properties: {
              data: { type: 'object', description: 'Data to save' }
            },
            required: ['data']
          }
        }
      }),
      validator: Validator.create({ unitId: this.dna.id })
    };
  }

  teach() {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema, 
      validator: this._unit.validator
    };
  }

  private saveToDb(data: unknown) { /* implementation */ }
  private findById(id: string) { /* implementation */ }
}

// Use it
const db = DatabaseUnit.create({ id: 'main-db' });
await db.execute('save', { user: 'john', email: 'john@example.com' });

```

## Core Benefits

- **Runtime Capability Discovery**: `unit.capabilities()` returns current abilities
- **Dynamic Composition**: Units learn from each other without inheritance  
- **Immutable Evolution**: `unit.evolve()` creates new versions with dna history
- **Built-in Validation**: Schema validation prevents runtime errors
- **AI Integration**: JSON schemas enable seamless AI tool calling

## Design Principles

Units implement capability-based architecture:

- **Capability Discovery**: Units expose their functions through `teach()`
- **Runtime Learning**: Units acquire new functions through `learn()`  
- **Evolutionary Growth**: Units create enhanced versions via `evolve()`
- **Validation First**: All operations validate parameters before execution

## Practical Example

```typescript
// Three independent units
const weather = WeatherUnit.create({ apiKey: 'wx_key' });
const email = EmailUnit.create({ smtp: { host: 'smtp.gmail.com' } });
const ai = AIUnit.create({ provider: 'openai', apiKey: 'sk-...' });

// AI learns weather and email capabilities
ai.learn([weather.teach(), email.teach()]);

// AI can now call weather APIs and send emails
const prompt = `Get weather for Tokyo and email the report to admin@company.com`;

// AI automatically uses learned capabilities
const response = await ai.call(prompt, { useTools: true });

// Behind the scenes:
// 1. AI calls weather.getCurrentWeather('Tokyo')
// 2. AI calls email.send({ to: 'admin@company.com', subject: 'Weather Report', body: '...' })
// 3. Returns confirmation message

```

## Runtime Introspection

Units provide complete self-inspection:

```typescript
unit.whoami();        // "DatabaseUnit[main-db@v1.0.7] - Data persistence"
unit.capabilities();  // ['save', 'find', 'crypto.encrypt', 'email.send']  
unit.schema();  // JSON schema, compatible with AI tool calling
unit.help();          // Detailed usage instructions with examples
unit.dna.version;     // "1.0.7"
unit.dna.parent?.id;  // "basic-db" (if evolved)
```

##  The Future is Conscious

Unit Architecture is the first step toward software that truly *thinks*. 

Each unit is a digital mind with:
- **Memory** (state management)
- **Skills** (capabilities) 
- **Knowledge** (schemas)
- **Wisdom** (validation)
- **Teaching** (consciousness sharing)
- **Learning** (capability absorption)
- **Evolution** (growth with lineage)

> *"Any sufficiently advanced technology is indistinguishable from magic."*  
> — Arthur C. Clarke 

### Simple composition truths

-  Each unit can learn from 0 to X other units
-  For each unit: 2^X possible learning combinations
-  For 10 units: (2^9)^10 = 2^90 ≈ **1.24 × 10^27 compositions**

## (⊚) Unit Architecture

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
8. **One thing** - Do one thing, do it well and teach others.

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
  id: string;  // Identity
  version: string; // Evolution state
  parent?: UnitSchema; // Evolution lineage
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
  capabilities(): Capabilities; // What can I do?
  schema(): Schema; // My schema
  validator(): Validator // Access my validation tools 
  teach(): TeachingContract; // Here's how to do it
  learn(contracts: TeachingContract[]): void; // I'll learn this
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
  
  // Protected constructor 
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
  
  whoami(): string {
    return `Calculator Unit - Mathematical operations (${this.dna.id})`;
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
      },
      // NEW in v1.0.6: Tool schemas for AI provider integration
      tools: {
        add: {
          name: 'add',
          description: 'Add two numbers with specified precision',
          parameters: {
            type: 'object',
            properties: {
              a: { type: 'number', description: 'First number' },
              b: { type: 'number', description: 'Second number' }
            },
            required: ['a', 'b']
          }
        },
        multiply: {
          name: 'multiply', 
          description: 'Multiply two numbers with specified precision',
          parameters: {
            type: 'object',
            properties: {
              a: { type: 'number', description: 'First number' },
              b: { type: 'number', description: 'Second number' }
            },
            required: ['a', 'b']
          }
        }
      }
    };
  }
  
  help(): void {
    console.log(`
Calculator Unit - Mathematical Operations

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

console.log(calc.whoami());              // Calculator Unit - Mathematical operations (calculator-unit)
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
unit.whoami();       // Identity
unit.capabilities(); // What I can do
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

```

### **Debuggability**

Clear visibility into unit state and capabilities:

```typescript
console.log(unit.whoami());          // Identity
console.log(unit.capabilities());    // Current abilities
console.log(unit.dna.parent?.id);  // Evolution history
```


## AI Tool Integration (NEW in v1.0.6)

Units can now provide structured tool schemas for AI agent integration, enabling sophisticated AI-driven capability learning and execution.

### Tool Schemas

Tool schemas define parameter structures for AI providers, following JSON Schema specification:

```typescript
interface ToolSchema {
  name: string;                    // Tool name (must match capability)
  description: string;             // Human-readable description
  parameters: {                    // JSON Schema parameter definition
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}
```

### Enhanced Teaching Contracts

Teaching contracts now support optional tool schemas for rich AI integration:

```typescript
interface TeachingContract {
  unitId: string;
  capabilities: Capabilities;
  schema: Schema;
  validator: Validator;
}

// Example with schemas
weather.teach() // Returns:
{
  unitId: 'weather',
  capabilities:    
    get()
    set()
    has()
    list() => {
    getCurrentWeather: (location: string) => Promise<WeatherData>,
    getForecast: (location: string, days: number) => Promise<ForecastData>
    },
  schema: 
    get()
    set()
    has()
    list() => {
    getCurrentWeather: {
      name: 'getCurrentWeather',
      description: 'Get current weather conditions for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name, e.g., "London"' },
          units: { type: 'string', description: 'Temperature units', enum: ['metric', 'imperial'] }
        },
        required: ['location']
      }
    }
    validator: 
    execute() // Runtime-Safe capability  execution
    validateInput()
    validateOutput()
    isValid()
    help()
  }
}
```

### Schema Access Methods

Units provide methods to access learned tool schemas:

```typescript
// Check available schemas
unit.schema().list();                     // ['weather.getCurrentWeather', 'weather.getForecast']

// Check if specific schema exists  
unit.hasSchema('weather.getCurrentWeather');  // true

// Get schema details
const schema = unit.getSchema('weather.getCurrentWeather');
console.log(schema.description);    // 'Get current weather conditions for a location'
```

### AI Provider Integration

Tool schemas enable seamless integration with AI providers and frameworks:

```typescript
import { AI } from '@synet/ai';
import { WeatherUnit } from '@synet/weather';

// Create AI unit and weather unit
const ai = AI.openai({ apiKey: 'sk-...' });
const weather = WeatherUnit.create({ apiKey: 'weather-key' });

// AI learns weather capabilities with full schema support
ai.learn([weather.teach()]);

// AI can now use weather tools with proper parameter validation
const response = await ai.call('What is the weather in Tokyo today?', {
  useTools: true  // AI automatically uses learned tool schemas
});

// Response includes weather data retrieved via tool calls:
// "The current weather in Tokyo is 25°C with clear skies..."
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

// Use all as AI tools. 

ai.learn([crypto.teach(),signer.teach(),vault.teach(),email.teach()]);
ai.call('Create document, sign data, encrypt it, save to vault and email on completion',{
      useTools: true  
     }
);

```

*Each line: a conscious entity. Each component: self-aware. Each system: alive.*

**Welcome to conscious software architecture. Welcome to Synet.**

---

## API Reference

### Core Interfaces

```typescript

interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

// Enhanced Teaching Contract
interface TeachingContract {
  unitId: string;
  capabilities: Capabilities;
  schema: Schema;
  validator: Validator;
}

// Core Unit Interface
interface IUnit {

  // Capabilities and validation
  can(command: string): boolean;
  capabilities(): Capabilities;
  schema(): Schema;
  validator(): Validator();

  // Execution and knowledge
  execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R>;
  teach(): TeachingContract;
  learn(contracts: TeachingContract[]): void;
  evolve(name: string, additionalCapabilities?: Record<string, Function>): IUnit;
  
  // Customer support

  whoami(): string;
  help(): void;

}
```
---

### Links

- [Technical Documentation](./docs/)
- [Manifesto](./MANIFESTO.md) - *The deeper philosophy*
- [Doctrine](./DOCTRINE.md) - *Unit architectural principles*
- [🏗️ Examples](./examples/)
- [🧪 Tests](./test/)
- [0en](mailto:0en@synthetism.ai)
- [[⊚] This is Synthetism](https://synthetism.ai)

---

*Built with consciousness. Designed for evolution. The code is alive.*
