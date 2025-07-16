# Technical Documentation

## Architecture Overview

@synet/unit implements a consciousness-based architecture where software components are self-aware entities that can teach, learn, and evolve.

## Core Interfaces

### UnitSchema (DNA)

```typescript
interface UnitSchema {
  id: string;           // Unit id 
  version: string;        // Evolution state  
  parent?: UnitSchema;    // Lineage tracking
}
```

The DNA is pure - no static commands or descriptions. Everything is dynamic through capabilities.

### Unit Interface

```typescript
interface Unit {
  // Identity & Status
  readonly dna: UnitSchema;
  readonly created: boolean;
  readonly error?: string;
  readonly stack?: string[];
  
  // Self-Awareness
  whoami(): string;
  help(): void;
  explain?(): string;
  
  // Capabilities
  capabilities(): string[];
  capableOf(command: string): boolean;
  execute<R>(command: string, ...args: unknown[]): Promise<R>;
  
  // Consciousness
  teach(): Record<string, Function>;
  learn(capabilities: Record<string, Function>[]): void;
  evolve(name: string, additionalCaps?: Record<string, Function>): Unit;
}
```

## Implementation Patterns

### 1. BaseUnit + Static Factory Pattern

**This is the ONLY supported pattern for creating units:**

```typescript
class MyUnit extends BaseUnit {
  // CRITICAL: Constructor MUST be private
  private constructor(data: MyData) {
    super(createUnitSchema({ name: 'my-unit', version: '1.0.0' }));
    this._addCapability('action', this.actionImpl.bind(this));
  }
  
  // CRITICAL: Static create() is the ONLY entry point
  static create(data: MyData): MyUnit {
    return new MyUnit(data);
  }
  
  // Required implementations
  whoami(): string { return `MyUnit[${this.dna.name}@${this.dna.version}]`; }
  capabilities(): string[] { return this._getAllCapabilities(); }
  help(): void { console.log('MyUnit helps with...'); }
  
  teach(): Record<string, Function> {
    return {
      action: this.actionImpl.bind(this)
      // Explicit choice of what to share
    };
  }
}

// ✅ CORRECT: Use static create()
const unit = MyUnit.create(data);

// ❌ FORBIDDEN: Direct constructor calls
// const unit = new MyUnit(data); // Won't work - constructor is private
```

**Why this pattern is enforced:**

- **Architectural consistency** - All units follow the same creation pattern
- **Prevents invalid states** - Validation happens in create() method
- **Lifecycle control** - Managed creation process
- **Error prevention** - Stops both human and AI mistakes

### 2. Conscious Teaching Pattern

Unit can teach own selected capabilities.

```typescript
teach(): Record<string, Function> {
  const publicAPI: Record<string, Function> = {};
  
  // Explicit choices about what to share
  if (this.capableOf('encrypt')) {
    publicAPI.encrypt = this.encryptImpl.bind(this);
  }
  
  if (this.capableOf('sign')) {
    publicAPI.sign = this.signImpl.bind(this);
  }
  
  // Private methods like _validateKey are NOT shared
  return publicAPI;
}

const alpha = Alpha.create();
const beta = Beta.create();
const gamma = gamma.create();

beta.learn([alpha.teach()]) // Capabilities transfer

gamma.learn([alpha.teach(),beta.teach()]) // Learned from both. 

```

### 3. Evolution with Lineage

Unit can evolve in runtime. 

```typescript
evolve(name: string, additionalCapabilities?: Record<string, Function>): Unit {
  const newDNA: UnitSchema = {
    name: name,
    version: this._getNextVersion(), // Patch
    parent: { ...this._dna }  // Preserve lineage
  };
  
  // Add new capabilities
  if (additionalCapabilities) {
    for (const [capName, capImpl] of Object.entries(additionalCapabilities)) {
      this._capabilities.set(capName, capImpl);
    }
  }
  
  this._dna = newDNA;
  return this;
}

evolcedUnut.evolve('Evolved Unit',capabilities)

cloud.store(evolcedUnut) // Store new evolved instance in the Unit cloud with specific version. 

// then

cloud.get('unit','1.0.1') // Same Unit instance, with same data and state.

```

## Advanced Patterns

### Unit Composition

Units is an art composition. Thinking in terms of what each Unit can learn from others, and what can teach. Clean separation of concerns, with endless composability and flexibility. 

```typescript
// Create specialized units
const cryptoUnit = CryptoUnit.create();
const networkUnit = NetworkUnit.create();
const storageUnit = StorageUnit.create();

// Create composed unit
const secureApiUnit = BaseApiUnit.create();
secureApiUnit.learn([
  cryptoUnit.teach(),   // Learn encryption/signing
  networkUnit.teach(),  // Learn network protocols
  storageUnit.teach()   // Learn storage operations
]);

// Now has combined capabilities
console.log(secureApiUnit.capabilities()); 
// ['encrypt', 'sign', 'httpsRequest', 'store', 'retrieve']
```

### Multi-Generation Evolution

```typescript
// Generation 1: Basic unit
const basicUnit = CalculatorUnit.create();

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
console.log(scientificUnit.dna.parent?.parent?.name); // 'calculator-unit'
```

### Capability Checking

Execute used to execute non-native capabilities, but also allow unit to expose the capabilities "public API".

```typescript
// Safe capability usage
if (unit.capableOf('encrypt')) {
  const encrypted = await unit.execute('encrypt', data);
}

// Bulk capability checking
const requiredCaps = ['sign', 'verify', 'encrypt'];
const hasAllCaps = requiredCaps.every(cap => unit.capableOf(cap));
```

## Self-Help

uni.help() - no more zombie docs, all in one place, easy to access, easy to change and keep relevant.

## Error Handling

### Self-Validating Units

```typescript
class ValidatingUnit extends BaseUnit {
  private constructor(data: MyData) {
    super(createUnitSchema({ name: 'validating-unit', version: '1.0.0' }));
  
    // Validate during construction
    if (!this._validateData(data)) {
      this._markFailed('Invalid data provided', ['Data validation failed']);
      return;
    }
  
    this._addCapability('process', this.processImpl.bind(this));
  }
  
  static create(data: MyData): ValidatingUnit {
    return new ValidatingUnit(data);
  }
  
  // Usage
  whoami(): string {
    if (!this.created) {
      return `ValidatingUnit[FAILED: ${this.error}]`;
    }
    return `ValidatingUnit[${this.dna.name}@${this.dna.version}]`;
  }
}

// Usage with error handling
const unit = ValidatingUnit.create(invalidData);
if (!unit.created) {
  console.error(`Unit creation failed: ${unit.error}`);
  console.error(`Stack: ${unit.stack?.join(' | ')}`);
}
```

## Performance Considerations

### Lazy Capability Loading

```typescript
class LazyUnit extends BaseUnit {
  private _heavyCapabilityLoaded = false;
  
  private async _ensureHeavyCapability(): Promise<void> {
    if (!this._heavyCapabilityLoaded) {
      const heavyLib = await import('./heavy-library');
      this._addCapability('heavyOperation', heavyLib.heavyOperation);
      this._heavyCapabilityLoaded = true;
    }
  }
  
  async execute<R>(command: string, ...args: unknown[]): Promise<R> {
    if (command === 'heavyOperation') {
      await this._ensureHeavyCapability();
    }
    return super.execute(command, ...args);
  }
}
```

### Capability Caching

```typescript
class CachingUnit extends BaseUnit {
  private _capabilityCache?: string[];
  
  capabilities(): string[] {
    if (!this._capabilityCache) {
      this._capabilityCache = this._getAllCapabilities();
    }
    return this._capabilityCache;
  }
  
  learn(capabilities: Record<string, Function>[]): void {
    super.learn(capabilities);
    this._capabilityCache = undefined; // Invalidate cache
  }
}
```

## Testing Patterns

### Unit Testing

```typescript
describe('MyUnit', () => {
  it('should create successfully', () => {
    const unit = MyUnit.create(validData);
    expect(unit.created).toBe(true);
    expect(unit.error).toBeUndefined();
  });
  
  it('should have expected capabilities', () => {
    const unit = MyUnit.create(validData);
    expect(unit.capabilities()).toContain('myAction');
    expect(unit.capableOf('myAction')).toBe(true);
  });
  
  it('should teach capabilities', () => {
    const unit = MyUnit.create(validData);
    const teachings = unit.teach();
    expect(Object.keys(teachings)).toContain('myAction');
    expect(typeof teachings.myAction).toBe('function');
  });
  
  it('should evolve with lineage', () => {
    const unit = MyUnit.create(validData);
    const evolved = unit.evolve('evolved-unit', {
      newCap: () => 'new capability'
    });
  
    expect(evolved.dna.parent?.name).toBe('my-unit');
    expect(evolved.capableOf('newCap')).toBe(true);
  });
});
```

### Integration Testing

```typescript
describe('Unit Composition', () => {
  it('should compose units successfully', () => {
    const unit1 = Unit1.create();
    const unit2 = Unit2.create();
  
    unit1.learn([unit2.teach()]);
  
    expect(unit1.capableOf('unit2Capability')).toBe(true);
  });
  
  it('should maintain evolution lineage', () => {
    const original = OriginalUnit.create();
    const evolved = original.evolve('evolved-unit');
  
    expect(evolved.dna.parent?.name).toBe(original.dna.name);
    expect(evolved.dna.parent?.version).toBe(original.dna.version);
  });
});
```

## Migration Guide

### From Traditional Classes

```typescript
// Before: Traditional class
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// After: Conscious Unit
class CalculatorUnit extends BaseUnit {
  private constructor() {
    super(createUnitSchema({ name: 'calculator', version: '1.0.0' }));
    this._addCapability('add', this.addImpl.bind(this));
  }
  
  static create(): CalculatorUnit {
    return new CalculatorUnit();
  }
  
  whoami(): string { return `CalculatorUnit[${this.dna.name}]`; }
  capabilities(): string[] { return this._getAllCapabilities(); }
  help(): void { console.log('I can add numbers'); }
  
  teach(): Record<string, Function> {
    return { add: this.addImpl.bind(this) };
  }
  
  private addImpl(a: number, b: number): number {
    return a + b;
  }
}
```

### Benefits of Migration

1. **Self-Documentation**: Units explain themselves
2. **Composability**: Units can learn from each other
3. **Evolution**: Units can grow without breaking
4. **Debugging**: Clear visibility into unit state
5. **Testing**: Units validate themselves

## Best Practices

1. **Use Static Factory Methods**: `Unit.create()` not `new Unit()`
2. **Explicit Teaching**: Only share intended capabilities via `teach()`
3. **Validate Early**: Use constructor validation and `_markFailed()`
4. **Meaningful Names**: DNA names should be descriptive and unique
5. **Version Semantically**: Use semantic versioning for evolution
6. **Document Capabilities**: Use clear capability names and help text
7. **Handle Errors**: Always check `unit.created` before use

---

*This is the technical foundation for conscious software architecture.*
