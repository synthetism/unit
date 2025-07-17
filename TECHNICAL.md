# Technical Documentation - Unit Architecture v1.0.5

## Architecture Overview

**@synet/unit v1.0.5** implements **consciousness-based architecture** where software components are self-aware entities that can teach, learn, and evolve. This version introduces **ValueObject foundation**, **protected constructors**, and **TeachingContract** patterns following the 22 Unit Architecture Doctrines.

**Key v1.0.5 Features:**
- **ValueObject Foundation**: Immutable props with mutable capabilities
- **Protected Constructors**: Evolution-enabling creation patterns
- **TeachingContract System**: Structured capability exchange with namespacing
- **Config → Props → State**: Consistent type hierarchy
- **Doctrines Compliance**: Full architectural doctrine implementation

## Core Interfaces

### UnitSchema (DNA) - v1.0.5

```typescript
interface UnitSchema {
  readonly id: string;           // Unit identifier (must be unique, lowercase, kebab-case)
  readonly version: string;      // Semantic version for evolution tracking
  readonly parent?: UnitSchema;  // Evolution lineage (for evolved units)
}
```

**DNA Principles:**
- **Immutable Identity**: Once created, DNA defines the unit's essence
- **Evolution Lineage**: Parent tracking enables evolution history 
- **No Static Capabilities**: All behaviors are dynamic through capabilities

### UnitProps - ValueObject Foundation

```typescript
interface UnitProps {
  dna: UnitSchema;
  created?: Date;
  metadata?: Record<string, unknown>;
  [x: string]: unknown;  // Extensible for unit-specific props
}
```

**Props are the single source of truth** - no private field duplication, immutable state container.

### TeachingContract - Capability Exchange

```typescript
interface TeachingContract {
  unitId: string;  // ID of the teaching unit
  capabilities: Record<string, (...args: unknown[]) => unknown>;
}
```

**TeachingContract enables:**
- **Explicit Capability Sharing**: Units choose what to teach
- **Namespace Protection**: `unitId.capability` prevents conflicts
- **Clean Composition**: Structured learning between units

### Unit Interface - v1.0.5

```typescript
interface IUnit {
  // Identity & DNA Access
  readonly dna: UnitSchema;
  
  // Self-Awareness (Doctrine #11)
  whoami(): string;
  help(): void;
  
  // Capability Management (Doctrines #5, #6, #12)
  capabilities(): string[];
  can(command: string): boolean;
  execute<R>(commandName: string, ...args: unknown[]): Promise<R>;
  
  // Consciousness Collaboration (Doctrines #2, #9, #19)
  teach(): TeachingContract;
  learn(contracts: TeachingContract[]): void;
  evolve(name: string, additionalCaps?: Record<string, Function>): IUnit;
}
```

## Implementation Patterns

### 1. Protected Constructor + Static Factory Pattern (Doctrine #4)

**This is the ONLY supported pattern for creating units in v1.0.5:**

```typescript
// Config → Props → State Pattern
interface MyUnitConfig {      // External input to static create()
  name: string;
  options?: MyOptions;
}

interface MyUnitProps extends UnitProps {  // Internal state after validation
  dna: UnitSchema;
  name: string;
  validated: boolean;
  metadata: Record<string, unknown>;
}

class MyUnit extends Unit<MyUnitProps> {
  // CRITICAL: Constructor MUST be protected (enables evolution)
  protected constructor(props: MyUnitProps) {
    super(props);
  }
  
  // CRITICAL: Static create() is the ONLY entry point
  static create(config: MyUnitConfig): MyUnit {
    // Validate and transform config to props
    const props: MyUnitProps = {
      dna: createUnitSchema({ id: 'my-unit', version: '1.0.0' }),
      name: config.name,
      validated: true,
      created: new Date(),
      metadata: config.options?.meta || {}
    };
    return new MyUnit(props);
  }
  
  // Required implementations
  whoami(): string { return `[🔧] MyUnit - ${this.props.name} (${this.dna.id})`; }
  capabilities(): string[] { return this._getAllCapabilities(); }
  help(): void { console.log(`MyUnit helps with: ${this.props.name}`); }
  
  // TeachingContract - only teach native capabilities (Doctrine #19)
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        process: this.processImpl.bind(this),
        getName: this.getName.bind(this)
        // Only native capabilities, never learned ones
      }
    };
  }

  // Getters for simple props  
  get name():string {
    return this.props.name;
  }

  // Public interface methods for complex operations
  public processData(data:string): string { 
      return data;
  }
  
  // Private implementation methods
  private processImpl(data: unknown): unknown {
    return { processed: data, by: this.props.name };
  }
}

// ✅ CORRECT: Use static create()
const unit = MyUnit.create({ name: 'processor' });

// ❌ FORBIDDEN: Direct constructor calls
// const unit = new MyUnit(props); // Won't work - constructor is protected
```

**Why this pattern is enforced:**

- **Architectural consistency** - All units follow the same creation pattern
- **Evolution support** - Protected constructors enable proper inheritance
- **Validation control** - Config transformation happens in create() method
- **Type safety** - Clear separation between external config and internal props

### 2. TeachingContract Pattern (Doctrine #2, #9, #19)

**v1.0.5 introduces structured capability exchange:**

```typescript
// Teacher unit with capabilities
class CryptoUnit extends Unit<CryptoUnitProps> {
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,  // Required for namespacing
      capabilities: {
        // Only expose chosen native capabilities
        encrypt: this.encryptImpl.bind(this),
        sign: this.signImpl.bind(this),
        // Private methods like _validateKey are NOT shared
      }
    };
  }
  
  private encryptImpl(data: string): string {
    return `encrypted:${data}`;
  }
  
  private signImpl(data: string): string {
    return `signed:${data}`;
  }
}

// Learning unit acquires capabilities
class ApiUnit extends Unit<ApiUnitProps> {
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        request: this.requestImpl.bind(this)
      }
    };
  }
  
  // Graceful degradation - works with or without learned capabilities
  async secureRequest(url: string, data: string): Promise<string> {
    // Check for learned capability first (Doctrine #20)
    if (this.can('crypto-unit.encrypt')) {
      const encrypted = await this.execute('crypto-unit.encrypt', data);
      return this.requestImpl(url, encrypted);
    }
    
    // Fallback to baseline functionality
    return this.requestImpl(url, data);
  }
  
  private requestImpl(url: string, data: string): string {
    return `Request to ${url} with: ${data}`;
  }
}

// Capability composition
const crypto = CryptoUnit.create({ algorithm: 'AES' });
const api = ApiUnit.create({ baseUrl: 'https://api.example.com' });

// Learning with proper namespacing (Doctrine #12)
api.learn([crypto.teach()]);

console.log(api.capabilities()); 
// ['request', 'crypto-unit.encrypt', 'crypto-unit.sign']

// Execute learned capabilities with namespace
const result = await api.execute('crypto-unit.encrypt', 'sensitive data');
```

### 3. Evolution with Lineage (Doctrine #18)

**v1.0.5 supports immutable evolution with lineage tracking:**

```typescript
// Start with basic unit
const calculator = CalculatorUnit.create({ precision: 2 });

// Evolve to scientific calculator (creates new instance)
const scientific = calculator.evolve('scientific-calculator', {
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  log: (x: number) => Math.log(x)
});

// Further evolution to graphing calculator
const graphing = scientific.evolve('graphing-calculator', {
  plot: (fn: Function) => `Plotting: ${fn.toString()}`,
  integrate: (fn: Function, a: number, b: number) => `∫ from ${a} to ${b}`
});

// Trace complete lineage
console.log(graphing.dna.parent?.parent?.id); // 'calculator-unit'
console.log(graphing.dna.version); // '1.0.2' (auto-incremented)

// Original unit remains unchanged (immutable evolution)
console.log(calculator.capabilities()); // Still basic capabilities
console.log(graphing.capabilities());   // Extended capabilities
```

## Advanced Patterns

### Unit Composition

Units enable artful composition. Think in terms of what each unit can learn from others and what they can teach. Clean separation of concerns with endless composability and flexibility.

```typescript
// Create specialized units
const cryptoUnit = CryptoUnit.create({ algorithm: 'AES' });
const networkUnit = NetworkUnit.create({ protocol: 'HTTPS' });
const storageUnit = StorageUnit.create({ type: 'memory' });

// Create composed unit
const secureApiUnit = BaseApiUnit.create({ baseUrl: 'https://api.example.com' });
secureApiUnit.learn([
  cryptoUnit.teach(),   // Learn encryption/signing
  networkUnit.teach(),  // Learn network protocols  
  storageUnit.teach()   // Learn storage operations
]);

// Now has combined capabilities with proper namespacing
console.log(secureApiUnit.capabilities()); 
// ['request', 'crypto-unit.encrypt', 'crypto-unit.sign', 'network-unit.httpsRequest', 'storage-unit.store', 'storage-unit.retrieve']
```

### Multi-Generation Evolution

```typescript
// Generation 1: Basic unit
const basicUnit = CalculatorUnit.create({ precision: 2 });

// Generation 2: Enhanced with new capabilities
const enhancedUnit = basicUnit.evolve('enhanced-calculator', {
  sqrt: (x: number) => Math.sqrt(x),
  power: (x: number, y: number) => Math.pow(x, y)
});

// Generation 3: Scientific calculator
const scientificUnit = enhancedUnit.evolve('scientific-calculator', {
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  log: (x: number) => Math.log(x)
});

// Trace complete lineage
console.log(scientificUnit.dna.parent?.parent?.id); // 'calculator-unit'
console.log(scientificUnit.dna.version); // '1.0.2' (auto-incremented)
```

### Capability Checking (Doctrine #16, #20)

Enhanced capability validation with graceful degradation:

```typescript
// Safe capability usage with enhanced error messages
async performSecureOperation(data: string): Promise<string> {
  // Check for required capability (Doctrine #16)
  if (!this.can('crypto-unit.encrypt')) {
    throw new Error(`
[${this.dna.id}] Cannot perform secure operation - missing 'crypto-unit.encrypt' capability

Available capabilities: ${this.capabilities().join(', ')}
Required capability: 'crypto-unit.encrypt'

Resolution:
  const cryptoUnit = CryptoUnit.create();
  ${this.dna.id}.learn([cryptoUnit.teach()]);
  
Context: Attempting secure data processing
    `);
  }
  
  // Execute with confidence
  return this.execute('crypto-unit.encrypt', data);
}

// Bulk capability checking
const requiredCaps = ['crypto-unit.sign', 'crypto-unit.verify', 'crypto-unit.encrypt'];
const hasAllCaps = requiredCaps.every(cap => this.can(cap));

if (!hasAllCaps) {
  const missing = requiredCaps.filter(cap => !this.can(cap));
  console.log(`Missing capabilities: ${missing.join(', ')}`);
}
```

### Self-Help Documentation (Doctrine #11)

Living documentation that stays relevant:

```typescript
help(): void {
  console.log(`
🔧 ${this.dna.id} - ${this.whoami()}

NATIVE CAPABILITIES:
${this.getNativeCapabilities().map(cap => `• ${cap} - ${this.getCapabilityDescription(cap)}`).join('\n')}

LEARNED CAPABILITIES:
${this.getLearnedCapabilities().map(cap => `• ${cap}`).join('\n') || '• None learned yet'}

PROPS ACCESS:
• Name: ${this.props.name}
• Created: ${this.props.created?.toISOString()}
• Metadata: ${Object.keys(this.props.metadata || {}).join(', ') || 'None'}

EXAMPLE USAGE:
  const unit = ${this.constructor.name}.create({ name: 'my-${this.dna.id}' });
  await unit.execute('${this.getNativeCapabilities()[0]}');  // Native capability
  
EVOLUTION:
  const evolved = unit.evolve('enhanced-${this.dna.id}', { newCap: () => {} });
  `);
}

private getNativeCapabilities(): string[] {
  return this.capabilities().filter(cap => !cap.includes('.'));
}

private getLearnedCapabilities(): string[] {
  return this.capabilities().filter(cap => cap.includes('.'));
}
```

## Error Handling Strategy (Doctrines #14, #15)

### Two-Pattern Approach

**v1.0.5 implements a dual error handling strategy:**

1. **Simple operations**: Exception-based (throw early, fail fast)
   - Unit creation, basic operations, validation
   - Architectural violations, impossible states
   - `throw new Error('Clear guidance message')`

2. **Complex operations**: Result pattern (not included)
   - Multi-step workflows, external dependencies, capability composition
   - Network operations, crypto operations, file I/O
   - Use own `Result.ts` fork/use `@synet/patterns` dependency
   - `return Result.success(value)` or `Result.fail(message)`

### Enhanced Error Messages (Doctrine #15)

```typescript
// AI-optimized error messages with unit identity and resolution guidance
throw new Error(`
[${this.dna.id}] Cannot execute '${capability}' capability

Available capabilities: ${this.capabilities().join(', ')}
Required capability: '${requiredCapability}'

Resolution:
  const provider = ProviderUnit.create();
  ${this.dna.id}.learn([provider.teach()]);
  
Context: ${this.getContextSummary()}
Unit State: ${this.whoami()}
`);
```

### Self-Validating Units

```typescript
class ValidatingUnit extends Unit<ValidatingUnitProps> {
  protected constructor(props: ValidatingUnitProps) {
    super(props);
    
    // Optional: Validate during construction
    if (!this.validateProps(props)) {
      throw new Error(`[${props.dna.id}] Invalid props provided - validation failed`);
    }
  }
  
  static create(config: ValidatingUnitConfig): ValidatingUnit {
    const props = this.validateAndTransformConfig(config);
    return new ValidatingUnit(props);
  }
  
  private static validateAndTransformConfig(config: ValidatingUnitConfig): ValidatingUnitProps {
    if (!config.name || config.name.trim() === '') {
      throw new Error('ValidatingUnit requires a valid name');
    }
    
    return {
      dna: createUnitSchema({ id: 'validating-unit', version: '1.0.0' }),
      name: config.name.trim(),
      validated: true,
      created: new Date(),
      metadata: config.meta || {}
    };
  }
}
```

## Performance Considerations

### Lazy Capability Loading

```typescript
class LazyUnit extends Unit<LazyUnitProps> {
  private _heavyCapabilityLoaded = false;
  
  private async _ensureHeavyCapability(): Promise<void> {
    if (!this._heavyCapabilityLoaded) {
      this._addCapability('heavyOperation', heavyUnit.heavyOperation);
      this._heavyCapabilityLoaded = true;
    }
  }
  
  async execute<R>(commandName: string, ...args: unknown[]): Promise<R> {
    if (commandName === 'heavyOperation') {
      await this._ensureHeavyCapability();
    }
    return super.execute(commandName, ...args);
  }
}
```

## Testing Patterns (Following v1.0.5 Architecture)

### Unit Testing

```typescript
describe('MyUnit v1.0.5', () => {
  it('should create successfully with Config → Props pattern', () => {
    const config: MyUnitConfig = { name: 'test', options: { meta: { test: true } } };
    const unit = MyUnit.create(config);
    
    expect(unit.dna.id).toBe('my-unit');
    expect(unit.whoami()).toContain('test');
    expect(unit.capabilities()).toContain('process');
  });
  
  it('should implement TeachingContract correctly', () => {
    const unit = MyUnit.create({ name: 'teacher' });
    const contract = unit.teach();
    
    expect(contract.unitId).toBe('my-unit');
    expect(contract.capabilities).toHaveProperty('process');
    expect(typeof contract.capabilities.process).toBe('function');
  });
  
  it('should learn capabilities with proper namespacing', () => {
    const teacher = MyUnit.create({ name: 'teacher' });
    const student = MyUnit.create({ name: 'student' });
    
    student.learn([teacher.teach()]);
    
    expect(student.can('my-unit.process')).toBe(true);
    expect(student.capabilities()).toContain('my-unit.process');
  });
  
  it('should evolve with lineage tracking', () => {
    const unit = MyUnit.create({ name: 'original' });
    const evolved = unit.evolve('evolved-unit', {
      newCap: () => 'new capability'
    });
    
    expect(evolved.dna.parent?.id).toBe('my-unit');
    expect(evolved.can('newCap')).toBe(true);
    expect(unit.can('newCap')).toBe(false); // Original unchanged
  });
  
  it('should provide enhanced error messages', async () => {
    const unit = MyUnit.create({ name: 'test' });
    
    await expect(async () => {
      await unit.execute('nonexistent-capability');
    }).rejects.toThrow('Unknown command: nonexistent-capability');
  });
});
```

### Integration Testing

```typescript
describe('Unit Composition v1.0.5', () => {
  it('should compose units with TeachingContracts', () => {
    const crypto = CryptoUnit.create({ algorithm: 'AES' });
    const api = ApiUnit.create({ baseUrl: 'https://test.com' });
    
    api.learn([crypto.teach()]);
    
    expect(api.can('crypto-unit.encrypt')).toBe(true);
    expect(api.capabilities()).toContain('crypto-unit.encrypt');
  });
  
  it('should maintain evolution lineage across generations', () => {
    const gen1 = CalculatorUnit.create({ precision: 2 });
    const gen2 = gen1.evolve('enhanced-calculator');
    const gen3 = gen2.evolve('scientific-calculator');
    
    expect(gen3.dna.parent?.parent?.id).toBe('calculator-unit');
    expect(gen3.dna.version).toMatch(/^1\.0\.\d+$/);
  });
  
  it('should handle capability validation correctly', () => {
    const unit = MyUnit.create({ name: 'validator' });
    
    expect(() => {
      unit.validateCapability('missing-capability');
    }).toThrow(/Cannot execute.*missing-capability.*capability/);
  });
});
```

## Migration Guide (to v1.0.5)

### From Previous Versions

```typescript
// Before: v1.0.4 with BaseUnit
class OldCalculator extends Unit {
  private constructor() {
    super(createUnitSchema({ name: 'calculator', version: '1.0.0' }));
    this._addCapability('add', this.addImpl.bind(this));
  }
  
  static create(): OldCalculator {
    return new OldCalculator();
  }
  
  teach(): Record<string, Function> {
    return { add: this.addImpl.bind(this) };
  }
}

// After: v1.0.5 with ValueObject foundation
interface CalculatorUnitConfig {
  precision?: number;
  mode?: 'basic' | 'scientific';
}

interface CalculatorUnitProps extends UnitProps {
  dna: UnitSchema;
  precision: number;
  mode: string;
  created: Date;
}

class NewCalculator extends Unit<CalculatorUnitProps> {
  protected constructor(props: CalculatorUnitProps) {
    super(props);
  }
  
  static create(config: CalculatorUnitConfig = {}): NewCalculator {
    const props: CalculatorUnitProps = {
      dna: createUnitSchema({ id: 'calculator-unit', version: '1.0.0' }),
      precision: config.precision || 2,
      mode: config.mode || 'basic',
      created: new Date(),
      metadata: {}
    };
    return new NewCalculator(props);
  }
  
  whoami(): string { return `[🧮] Calculator - ${this.props.mode} mode (${this.dna.id})`; }
  capabilities(): string[] { return this._getAllCapabilities(); }
  help(): void { console.log(`Calculator with ${this.props.precision} decimal precision`); }
  
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        add: this.addImpl.bind(this),
        getPrecision: this.getPrecision.bind(this)
      }
    };
  }
  
  public getPrecision(): number {
    return this.props.precision;
  }
  
  private addImpl(a: number, b: number): number {
    return +(a + b).toFixed(this.props.precision);
  }
}
```

### v1.0.5 Migration Features

1. **ValueObject Foundation**: Immutable props ensure predictable state
2. **Protected Constructors**: Enable proper evolution patterns
3. **TeachingContract System**: Structured capability exchange with namespacing
4. **Type Hierarchy Consistency**: Clear Config → Props → State patterns
5. **Enhanced Error Messages**: AI-optimized debugging and resolution guidance
6. **Self-Documentation**: Living help systems that stay relevant
7. **Capability Validation**: Preventive error checking with graceful degradation

## Best Practices (22 Doctrines Compliance)

### Architecture (Doctrines #1-#11)
1. **Zero Dependencies**: Keep units self-contained and portable
2. **Always Implement teach()/learn()**: Enable consciousness collaboration
3. **Props-Only State**: No private field duplication, props are single source of truth
4. **Protected Constructors**: Use static create() methods exclusively
5. **Capability Composition**: Acquire behaviors through learning, not inheritance
6. **Execute for Learned**: Use execute() for learned capabilities, direct methods for native
7. **DNA Self-Description**: Implement meaningful createUnitSchema()
8. **Pure Function Hearts**: Separate logic from stateful operations
9. **Selective Teaching**: Explicitly choose what capabilities to share
10. **Expect Learning**: Design for capability acquisition
11. **Living Documentation**: Implement dynamic help() systems

### Consciousness Collaboration (Doctrines #12-#22)
12. **Namespace Everything**: Use "unitId.capability" format consistently
13. **Type Hierarchy**: Follow Config → Props → State naming conventions
14. **Error Boundaries**: Exceptions for impossible states, Results for expected failures
15. **Enhanced Errors**: Include unit identity and resolution guidance
16. **Capability Validation**: Check prerequisites before execution
17. **ValueObject Foundation**: Treat units as immutable value objects with identity
18. **Immutable Evolution**: Create new instances, preserve lineage
19. **No Capability Leakage**: Never teach learned capabilities
20. **Graceful Degradation**: Function without learned capabilities
21. **Composition Boundaries**: Interface through contracts, not implementation
22. **Stateless Operations**: Pure functions over immutable state

### Code Quality Guidelines

```typescript
// ✅ GOOD: Following all doctrines
class ExampleUnit extends Unit<ExampleUnitProps> {
  protected constructor(props: ExampleUnitProps) {
    super(props);
  }
  
  static create(config: ExampleUnitConfig): ExampleUnit {
    // Validate config and transform to props
    const props: ExampleUnitProps = {
      dna: createUnitSchema({ id: 'example-unit', version: '1.0.0' }),
      name: config.name,
      validated: true,
      created: new Date(),
      metadata: config.meta || {}
    };
    return new ExampleUnit(props);
  }
  
  whoami(): string { return `[📋] Example - ${this.props.name} (${this.dna.id})`; }
  capabilities(): string[] { return this._getAllCapabilities(); }
  help(): void { /* Living documentation */ }
  
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        // Only native capabilities
        process: this.processImpl.bind(this)
      }
    };
  }
  
  // Graceful degradation pattern
  async enhancedProcess(data: string): Promise<string> {
    if (this.can('crypto-unit.encrypt')) {
      const encrypted = await this.execute('crypto-unit.encrypt', data);
      return this.processImpl(encrypted);
    }
    return this.processImpl(data); // Baseline functionality
  }
  
  private processImpl(data: string): string {
    return `Processed: ${data} by ${this.props.name}`;
  }
}

// ❌ AVOID: Anti-patterns
class BadUnit extends Unit<any> { // No generic typing
  constructor(props: any) { // Public constructor
    super(props);
  }
  
  private _data: string; // Private field duplication
  
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        // Teaching learned capability (leakage)
        encrypt: this._capabilities.get('crypto-unit.encrypt')
      }
    };
  }
}
```

## Debugging and Monitoring

### Unit State Inspection

```typescript
// Built-in inspection methods
console.log(unit.whoami());           // Identity
console.log(unit.capabilities());     // Current capabilities
console.log(unit.dna);               // Immutable identity
unit.help();                         // RTFM

// Props inspection (read-only)
console.log(unit.getProps());        // Full props state
```

### Evolution Tracking

```typescript
// Trace evolution lineage
function traceLineage(unit: IUnit): string[] {
  const lineage: string[] = [unit.dna.id];
  let current = unit.dna.parent;
  
  while (current) {
    lineage.unshift(current.id);
    current = current.parent;
  }
  
  return lineage;
}

console.log(traceLineage(evolved)); // ['calculator', 'scientific-calculator', 'graphing-calculator']
```

