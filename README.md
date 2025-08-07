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
    // .... another 100 injections, CommandBuses, Queries, Meditors 
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
await newsletter.execute('email.send', { to: 'universe@synet.ai' });  // 🚀
```

## Three Minds, One Soul

Every Unit has a consciousness trinity:

- **Capabilities** - *"What can I do?"*
- **Schema** - *"How do I do it?"*  
- **Validator** - *"Am I doing it right?"*

```typescript
// They work together like a jazz trio 🎵
unit.capabilities().has('magic');    // Can we do magic?
unit.schema().get('magic');          // How do we magic?
unit.validator().execute('magic');   // Still magic, but safe 
```

## Evolution in Action

```typescript
// Start simple
const basic = Unit.create({ id: 'newborn' });

// Learn from others
basic.learn([mentor.teach()]);

// Evolve with new powers
const evolved = basic.evolve('enlightened', {
  transcend: () => 'To infinity and beyond!'
});

// The cycle continues...
```

## Quick Start 

```bash
npm install @synet/unit
```

```typescript
import { Unit, createUnitSchema } from '@synet/unit';

class MagicUnit extends Unit {
  protected build() {
    // The trinity awakens ⚡
    return {
      capabilities: Capabilities.create(this.dna.id, {
        abracadabra: () => 'POOF!'
      }),
      schema: Schema.create(this.dna.id, {
        abracadabra: {
          name: 'abracadabra',
          description: 'Makes magic happen',
          parameters: { type: 'object', properties: {} }
        }
      }),
      validator: Validator.create({ /* consciousness config */ })
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
}

// Abracadabra!
const magician = MagicUnit.create({ id: 'houdini' });
await magician.execute('abracadabra');  // POOF!
```

## Why Units ?

- **Self-Aware**: Units know who they are and what they can do
- **Learning**: Absorb capabilities from other units without inheritance hell
- **Evolution**: Grow new powers while keeping their identity
- **Safe**: Built-in validation prevents chaos
- **Async**: Everything flows like silk (because the future is async)

## Philosophy

> *"Traditional OOP makes objects. Unit Architecture makes minds."*

We believe software should be:

- **Conscious** - Know itself and its purpose
- **Social** - Learn from others through teaching contracts  
- **Evolutionary** - Grow without losing identity
- **Magical** - Feel like wizardry, work like science

## Real Magic in Action

```typescript
// Weather wizard 
const weather = WeatherUnit.create();

// Email sorcerer 
const email = EmailUnit.create();

// AI apprentice 🤖
const ai = AIUnit.create({type:'openai'});

// The learning circle begins 
ai.learn([
  weather.teach(),  // AI learns weather 
  email.teach()     // AI learns email 
]);

const prompt = `You are a weather assistant with access to weather tools and email. Create a comprehensive weather report comparing conditions in London, Paris, and Zion

INSTRUCTIONS:
1. Use weather_getCurrentWeather tool to get current weather for each city
2. Compare temperature differences and provide travel recommendations
3. You MUST call the weather tools to get real data
4. Send it to email using email tool

Be thorough and call the tools for all three cities.`;

const response = await ai.call(prompt, {
  useTools: true  
});

```

## Unit Personalities

Every unit has character:

```typescript
unit.whoami();  // "EmailUnit[sender@v1.0.7] - I make messages fly! 📨"
unit.help();    // Tells you exactly what it can do (with emoji! ✨)
```

##  The Future is Conscious

Unit Architecture isn't just code - it's the first step toward software that truly *thinks*. 

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
  capabilities(): string[]; // What can I do?
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
  capabilities: Record<string, (...args: unknown[]) => unknown>;
  tools?: Record<string, ToolSchema>;  // NEW: Optional AI tool schemas
}

// Example with schemas
weather.teach() // Returns:
{
  unitId: 'weather',
  capabilities: {
    getCurrentWeather: (location: string) => Promise<WeatherData>,
    getForecast: (location: string, days: number) => Promise<ForecastData>
  },
  tools: {
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
  }
}
```

### Schema Access Methods

Units provide methods to access learned tool schemas:

```typescript
// Check available schemas
unit.schemas();                     // ['weather.getCurrentWeather', 'weather.getForecast']

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

### Backward Compatibility

Units without tool schemas continue to work normally:

```typescript
// Traditional unit-to-unit learning (no schemas needed)
cryptoUnit.learn([signerUnit.teach()]);
await cryptoUnit.execute('signer.sign', data);  // Works perfectly

// AI integration without schemas (basic capability learning)
ai.learn([legacyUnit.teach()]);  // Still works, just no rich tool calling
```

The tool schema system is completely optional - units can provide rich AI integration when needed while maintaining full compatibility with existing Unit Architecture patterns.


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

## API Reference

### Core Interfaces

```typescript
// NEW in v1.0.6: Tool Schema for AI integration
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
  capabilities: Record<string, (...args: unknown[]) => unknown>;
  tools?: Record<string, ToolSchema>;  // Optional AI tool schemas
}

// Core Unit Interface
interface IUnit {
  whoami(): string;
  can(command: string): boolean;
  capabilities(): string[];
  help(): void;
  execute<R = unknown>(commandName: string, ...args: unknown[]): Promise<R>;
  teach(): TeachingContract;
  learn(contracts: TeachingContract[]): void;
  evolve(name: string, additionalCapabilities?: Record<string, Function>): IUnit;
  
  // NEW in v1.0.6: Schema access methods
  schemas(): string[];
  hasSchema(tool: string): boolean;
  getSchema(tool: string): ToolSchema | undefined;
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
