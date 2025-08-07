# Technical Documentation v1.0.7

## Architecture Overview

@synet/unit implements a capability-based architecture where software components have immutable properties, dynamic capabilities, and runtime evolution. The architecture consists of three core patterns: composition through teaching contracts, runtime capability acquisition, and immutable evolution with lineage tracking.

## Core Interfaces

### UnitSchema (Identity)

```typescript
interface UnitSchema {
  id: string;             // Unique unit identifier
  version: string;        // Semantic version  
  parent?: UnitSchema;    // Evolution lineage
}
```

The schema provides immutable identity and lineage tracking for capability resolution and evolution management.

### UnitProps (State Container)

```typescript
interface UnitProps {
  dna: UnitSchema;
  created?: Date;
  metadata?: Record<string, unknown>;
  [x: string]: unknown;
}
```

All unit state exists in props - no private field duplication. Props are frozen immutable objects.

### Unit Interface (v1.0.7)

```typescript
interface IUnit {
  // Identity & Status
  readonly dna: UnitSchema;
  readonly created: boolean;
  readonly error?: string;
  
  // Capability System
  can(capability: string): boolean;
  execute<R>(capability: string, ...args: unknown[]): Promise<R>;
  
  // Consciousness Trinity Access
  capabilities(): Capabilities;
  schema(): Schema;
  validator(): Validator;
  
  // Evolution & Teaching
  teach(): TeachingContract;
  learn(contracts: TeachingContract[]): void;
  evolve(name: string): Unit;
  
  // Self-Documentation
  whoami(): string;
  help(): void;
}
```

### Consciousness Trinity Pattern (v1.0.7)

The core technical innovation is the consciousness trinity - three living instances that handle capability management:

```typescript
interface UnitCore {
  capabilities: Capabilities;  // Runtime capability executor
  schema: Schema;             // Capability descriptor and validator
  validator: Validator;       // Consistency and validation engine
}
```

These are not static data structures but active instances that can validate, transform, and reason about capabilities.

## Implementation Patterns

### 1. Unit Creation Pattern (v1.0.7)

**Mandatory pattern for all units:**

```typescript
class MyUnit extends Unit<MyUnitProps> {
  // CRITICAL: Constructor MUST be protected
  protected constructor(props: MyUnitProps) {
    super(props);
  }
  
  // CRITICAL: Consciousness Trinity Implementation
  protected build(): UnitCore {
    const capabilities = CapabilitiesClass.create(this.dna.id, {
      process: (...args: unknown[]) => this.processImpl(...args),
      validate: (...args: unknown[]) => this.validateImpl(...args)
    });

    const schema = SchemaClass.create(this.dna.id, {
      process: {
        name: 'process',
        description: 'Process input data',
        parameters: {
          type: 'object',
          properties: {
            data: { type: 'string' }
          }
        },
        response: { type: 'string' }
      }
    });

    const validator = ValidatorClass.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }
  
  // CRITICAL: Static create() is the ONLY entry point
  static create(config: MyUnitConfig): MyUnit {
    const props: MyUnitProps = {
      dna: createUnitSchema({ id: 'my-unit', version: '1.0.7' }),
      inputData: config.data,
      created: new Date(),
      metadata: config.metadata || {}
    };
    return new MyUnit(props);
  }
  
  // Required implementations
  whoami(): string { return `MyUnit[${this.dna.id}@${this.dna.version}]`; }
  help(): void { console.log('MyUnit processes data with validation'); }
  
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
}

// ✅ CORRECT: Use static create()
const unit = MyUnit.create({ data: 'input' });

// ❌ FORBIDDEN: Direct constructor calls
// const unit = new MyUnit(data); // Won't work - constructor is protected
```

**Why this pattern is enforced:**

- **Architectural consistency** - All units follow the same creation pattern
- **Prevents invalid states** - Validation happens in create() method
- **Lifecycle control** - Managed creation process with consciousness trinity
- **Error prevention** - Stops both human and AI mistakes

### 2. Capability Teaching Pattern (v1.0.7)

Units expose living capability instances through teaching contracts:

```typescript
teach(): TeachingContract {
  return {
    unitId: this.dna.id,
    capabilities: this._unit.capabilities,  // Living instance
    schema: this._unit.schema,              // Living instance  
    validator: this._unit.validator         // Living instance
  };
}

// Learning from other units
const crypto = CryptoUnit.create();
const network = NetworkUnit.create();

// Transfer capabilities through teaching contracts
apiUnit.learn([crypto.teach(), network.teach()]);

// Execute learned capabilities with namespacing
await apiUnit.execute('crypto-unit.encrypt', data);
await apiUnit.execute('network-unit.httpRequest', options);
```

**Technical Benefits:**
- **Namespace isolation** - No capability name collisions
- **Living validation** - Schema and validator instances provide runtime checks
- **Selective exposure** - Units choose which capabilities to teach
- **Dynamic composition** - Capabilities can be learned at runtime

### 3. Immutable Evolution with Lineage (v1.0.7)

Units create new immutable instances during evolution:

```typescript
evolve(newId: string): Unit<T> {
  const newDNA: UnitSchema = {
    id: newId,
    version: this._getNextVersion(),
    parent: { ...this.props.dna }  // Preserve lineage
  };

  const evolvedProps: T = {
    ...this.props,
    dna: newDNA
  } as T;

  // Create NEW instance with evolved properties
  const evolved = new (this.constructor as new (props: T) => Unit<T>)(evolvedProps);
  
  // Transfer capabilities to new instance
  for (const [capName, capImpl] of this._capabilities.entries()) {
    evolved._addCapability(capName, capImpl);
  }
  
  return evolved;  // Returns new immutable unit
}

// Usage creates new instances
const basicUnit = CalculatorUnit.create();
const evolvedUnit = basicUnit.evolve('advanced-calculator');

// Both units exist independently
console.log(basicUnit.dna.id);   // 'calculator'
console.log(evolvedUnit.dna.id); // 'advanced-calculator'
console.log(evolvedUnit.dna.parent?.id); // 'calculator'
```

**Technical Benefits:**
- **Immutability** - Original units remain unchanged
- **Lineage tracking** - Complete evolution history maintained
- **Memory safety** - No shared mutable state between versions
- **Rollback capability** - Previous versions remain accessible

## Advanced Patterns

### Capability Composition Strategy

Units are designed for capability composition through teaching contracts:

```typescript
// Create specialized units
const cryptoUnit = CryptoUnit.create();
const networkUnit = NetworkUnit.create();
const storageUnit = StorageUnit.create();

// Create composite unit through learning
const secureApiUnit = ApiUnit.create();
secureApiUnit.learn([
  cryptoUnit.teach(),   // Gains: crypto-unit.encrypt, crypto-unit.sign
  networkUnit.teach(),  // Gains: network-unit.request, network-unit.validate
  storageUnit.teach()   // Gains: storage-unit.save, storage-unit.load
]);

// Verify capabilities
console.log(secureApiUnit.can('crypto-unit.encrypt'));  // true
console.log(secureApiUnit.can('network-unit.request')); // true
console.log(secureApiUnit.can('storage-unit.save'));    // true

// Execute composed operations
const encrypted = await secureApiUnit.execute('crypto-unit.encrypt', data);
const response = await secureApiUnit.execute('network-unit.request', options);
await secureApiUnit.execute('storage-unit.save', response);
```

### Tool vs Orchestrator Pattern Distinction

Different unit types require different schema strategies:

```typescript
// Tool Unit - Rich schemas for external learning
class DatabaseUnit extends Unit<DatabaseProps> {
  protected build(): UnitCore {
    const schema = SchemaClass.create(this.dna.id, {
      query: {
        name: 'query',
        description: 'Execute database query',
        parameters: { /* detailed schema */ }
      },
      insert: {
        name: 'insert', 
        description: 'Insert record',
        parameters: { /* detailed schema */ }
      }
    });
    
    return { capabilities, schema, validator };
  }
}

// Orchestrator Unit - Empty schemas for coordination
class WorkflowUnit extends Unit<WorkflowProps> {
  protected build(): UnitCore {
    const schema = SchemaClass.create(this.dna.id, {}); // No teaching
    return { capabilities, schema, validator };
  }
}

### Multi-Generation Evolution Chains

Evolution preserves complete lineage for traceability:

```typescript
// Generation 1: Base functionality
const basicUnit = CalculatorUnit.create();
console.log(basicUnit.dna.id); // 'calculator'

// Generation 2: Extended with new operations
const enhancedUnit = basicUnit.evolve('enhanced-calculator');
console.log(enhancedUnit.dna.parent?.id); // 'calculator'

// Generation 3: Scientific operations
const scientificUnit = enhancedUnit.evolve('scientific-calculator');
console.log(scientificUnit.dna.parent?.id); // 'enhanced-calculator'
console.log(scientificUnit.dna.parent?.parent?.id); // 'calculator'

// All generations remain available
console.log(basicUnit.can('add'));         // true
console.log(enhancedUnit.can('add'));      // true (inherited)
console.log(scientificUnit.can('add'));    // true (inherited)
```

### Capability Checking and Validation

Runtime capability validation through the consciousness trinity:

```typescript
// Safe capability execution with validation
async function safeExecute<T>(unit: Unit, capability: string, ...args: unknown[]): Promise<T> {
  // Check capability existence
  if (!unit.can(capability)) {
    throw new Error(`Unit ${unit.dna.id} lacks capability: ${capability}`);
  }
  
  // Validate arguments through schema
  const schema = unit.schema().get(capability);
  if (schema) {
    const validationResult = unit.validator().validateInput(capability, args);
    if (!validationResult.valid) {
      throw new Error(`Invalid arguments: ${validationResult.errors.join(', ')}`);
    }
  }
  
  // Execute with validation
  return unit.execute<T>(capability, ...args);
}

// Bulk capability validation
function validateRequiredCapabilities(unit: Unit, required: string[]): boolean {
  return required.every(capability => unit.can(capability));
}

// Usage
const requiredCaps = ['crypto-unit.encrypt', 'storage-unit.save'];
if (validateRequiredCapabilities(unit, requiredCaps)) {
  await safeExecute(unit, 'crypto-unit.encrypt', data);
  await safeExecute(unit, 'storage-unit.save', result);
}
```

## Self-Documentation System

Units provide runtime documentation through `help()` method:

```typescript
help(): void {
  console.log(`
${this.whoami()} - Technical Specifications

Native Capabilities:
${this.capabilities().listNative().map(cap => `  - ${cap}`).join('\n')}

Learned Capabilities:
${this.capabilities().listLearned().map(cap => `  - ${cap}`).join('\n')}

Schemas Available:
${this.schema().list().map(s => `  - ${s.name}: ${s.description}`).join('\n')}

Evolution Lineage:
${this._getLineageChain().join(' → ')}

Technical Details:
  - Version: ${this.dna.version}
  - Created: ${this.props.created}
  - Memory Usage: ${this._getMemoryFootprint()}KB
  `);
}
```

This eliminates documentation drift by providing live, current information about unit capabilities and state.

## Error Handling and Validation

### Self-Validating Unit Construction

```typescript
class ValidatingUnit extends Unit<ValidatingUnitProps> {
  protected constructor(props: ValidatingUnitProps) {
    super(props);
    
    // Validation during construction
    if (!this._validateProps(props)) {
      this._markFailed('Invalid props provided', ['Props validation failed']);
      return;
    }
  }
  
  protected build(): UnitCore {
    if (!this.created) {
      // Return minimal consciousness trinity for failed units
      return {
        capabilities: CapabilitiesClass.create(this.dna.id, {}),
        schema: SchemaClass.create(this.dna.id, {}),
        validator: ValidatorClass.create({ unitId: this.dna.id })
      };
    }
    
    // Full consciousness trinity for valid units
    const capabilities = CapabilitiesClass.create(this.dna.id, {
      process: (...args) => this.processImpl(...args)
    });
    
    return { capabilities, schema, validator };
  }
  
  static create(config: ValidatingUnitConfig): ValidatingUnit {
    const props: ValidatingUnitProps = {
      dna: createUnitSchema({ id: 'validating-unit', version: '1.0.7' }),
      inputData: config.data,
      created: new Date()
    };
    return new ValidatingUnit(props);
  }
  
  whoami(): string {
    if (!this.created) {
      return `ValidatingUnit[FAILED: ${this.error}]`;
    }
    return `ValidatingUnit[${this.dna.id}@${this.dna.version}]`;
  }
  
  private _validateProps(props: ValidatingUnitProps): boolean {
    return props.inputData !== undefined && props.inputData.length > 0;
  }
}

// Usage with error handling
const unit = ValidatingUnit.create({ data: '' });
if (!unit.created) {
  console.error(`Unit creation failed: ${unit.error}`);
  console.error(`Stack: ${unit.stack?.join(' | ')}`);
}
```

### Result Pattern for Complex Operations

```typescript
import { Result } from '@synet/patterns';

async function complexOperation(unit: Unit, data: unknown): Promise<Result<ProcessedData>> {
  try {
    // Validate capabilities
    if (!unit.can('processor.validate')) {
      return Result.fail('Missing validation capability');
    }
    
    // Validate input
    const validation = await unit.execute('processor.validate', data);
    if (!validation) {
      return Result.fail('Input validation failed');
    }
    
    // Process data
    const result = await unit.execute('processor.process', data);
    return Result.success(result);
    
  } catch (error) {
    return Result.fail(
      `Processing failed: ${error.message}`,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
```

## Performance Considerations

### Lazy Capability Loading

```typescript
class LazyLoadingUnit extends Unit<LazyLoadingProps> {
  private _heavyCapabilityLoaded = false;
  
  protected build(): UnitCore {
    const capabilities = CapabilitiesClass.create(this.dna.id, {
      lightOperation: (...args) => this.lightOperation(...args),
      heavyOperation: (...args) => this.ensureHeavyAndExecute(...args)
    });
    
    return { capabilities, schema, validator };
  }
  
  private async ensureHeavyAndExecute(...args: unknown[]): Promise<unknown> {
    if (!this._heavyCapabilityLoaded) {
      const heavyLib = await import('./heavy-computation-library');
      this._heavyOperationImpl = heavyLib.heavyOperation;
      this._heavyCapabilityLoaded = true;
    }
    
    return this._heavyOperationImpl(...args);
  }
}
```

### Capability Caching and Optimization

```typescript
class OptimizedUnit extends Unit<OptimizedProps> {
  private _capabilityListCache?: string[];
  private _schemaCache?: Map<string, ToolSchema>;
  
  protected build(): UnitCore {
    const capabilities = CapabilitiesClass.create(this.dna.id, {
      cachedOperation: (...args) => this.cachedOperation(...args)
    });
    
    return { capabilities, schema, validator };
  }
  
  // Override capabilities for caching
  capabilities(): Capabilities {
    if (!this._capabilityListCache) {
      this._capabilityListCache = super.capabilities().list();
    }
    return super.capabilities();
  }
  
  learn(contracts: TeachingContract[]): void {
    super.learn(contracts);
    // Invalidate caches when learning new capabilities
    this._capabilityListCache = undefined;
    this._schemaCache = undefined;
  }
  
  private cachedOperation(input: string): string {
    // Implementation with memoization for expensive operations
    const cacheKey = this._hashInput(input);
    if (this._operationCache.has(cacheKey)) {
      return this._operationCache.get(cacheKey);
    }
    
    const result = this._expensiveComputation(input);
    this._operationCache.set(cacheKey, result);
    return result;
  }
}
```

### Memory Management for Long-Running Units

```typescript
class ManagedUnit extends Unit<ManagedProps> {
  private _cleanup: (() => void)[] = [];
  
  protected build(): UnitCore {
    // Register cleanup handlers
    this._cleanup.push(() => this._clearCaches());
    this._cleanup.push(() => this._closeConnections());
    
    return { capabilities, schema, validator };
  }
  
  dispose(): void {
    this._cleanup.forEach(cleanup => cleanup());
    this._cleanup = [];
  }
}

## Testing Patterns

### Unit Testing v1.0.7

```typescript
describe('MyUnit v1.0.7', () => {
  it('should create successfully with consciousness trinity', () => {
    const unit = MyUnit.create({ data: 'test' });
    
    expect(unit.created).toBe(true);
    expect(unit.error).toBeUndefined();
    
    // Verify consciousness trinity
    expect(unit.capabilities()).toBeDefined();
    expect(unit.schema()).toBeDefined();
    expect(unit.validator()).toBeDefined();
  });
  
  it('should have expected native capabilities', () => {
    const unit = MyUnit.create({ data: 'test' });
    
    expect(unit.can('process')).toBe(true);
    expect(unit.can('validate')).toBe(true);
    
    // Verify schemas exist for teachable capabilities
    expect(unit.schema().get('process')).toBeDefined();
  });
  
  it('should teach consciousness trinity not just functions', () => {
    const unit = MyUnit.create({ data: 'test' });
    const teaching = unit.teach();
    
    expect(teaching.unitId).toBe(unit.dna.id);
    expect(teaching.capabilities).toBeDefined();
    expect(teaching.schema).toBeDefined();
    expect(teaching.validator).toBeDefined();
    
    // Verify living instances
    expect(typeof teaching.capabilities.execute).toBe('function');
    expect(typeof teaching.schema.list).toBe('function');
    expect(typeof teaching.validator.validate).toBe('function');
  });
  
  it('should evolve with immutable lineage', () => {
    const original = MyUnit.create({ data: 'test' });
    const evolved = original.evolve('enhanced-unit');
    
    // Verify immutability
    expect(evolved).not.toBe(original);
    expect(evolved.dna.id).toBe('enhanced-unit');
    expect(evolved.dna.parent?.id).toBe(original.dna.id);
    
    // Verify original unchanged
    expect(original.dna.id).toBe('my-unit');
  });
  
  it('should validate capability execution', async () => {
    const unit = MyUnit.create({ data: 'test' });
    
    // Test capability validation
    expect(() => unit.execute('nonexistent')).toThrow();
    
    // Test successful execution
    const result = await unit.execute('process', 'input');
    expect(result).toBeDefined();
  });
});
```

### Integration Testing for Capability Composition

```typescript
describe('Unit Composition v1.0.7', () => {
  it('should compose capabilities through teaching contracts', () => {
    const crypto = CryptoUnit.create();
    const storage = StorageUnit.create();
    const composite = CompositeUnit.create();
    
    // Learn capabilities
    composite.learn([crypto.teach(), storage.teach()]);
    
    // Verify namespaced capabilities
    expect(composite.can('crypto-unit.encrypt')).toBe(true);
    expect(composite.can('storage-unit.save')).toBe(true);
    
    // Verify schemas transferred
    expect(composite.schema().get('crypto-unit.encrypt')).toBeDefined();
  });
  
  it('should maintain evolution lineage across generations', () => {
    const gen1 = BasicUnit.create();
    const gen2 = gen1.evolve('enhanced-unit');
    const gen3 = gen2.evolve('advanced-unit');
    
    // Verify lineage chain
    expect(gen3.dna.parent?.id).toBe('enhanced-unit');
    expect(gen3.dna.parent?.parent?.id).toBe('basic-unit');
    
    // Verify all generations remain separate
    expect(gen1.dna.id).toBe('basic-unit');
    expect(gen2.dna.id).toBe('enhanced-unit');
    expect(gen3.dna.id).toBe('advanced-unit');
  });
  
  it('should handle provider validation differences', async () => {
    const unit = ProviderAwareUnit.create();
    
    // Test with strict provider (should validate thoroughly)
    const strictResult = await unit.callWithProvider('strict', tools);
    expect(strictResult.validated).toBe(true);
    
    // Test with tolerant provider (should handle gracefully)
    const tolerantResult = await unit.callWithProvider('tolerant', tools);
    expect(tolerantResult.processed).toBe(true);
  });
});
```

## Migration Guide v1.0.7

### From Traditional Classes to Units

```typescript
// Before: Traditional class with methods
class Calculator {
  private history: number[] = [];
  
  add(a: number, b: number): number {
    const result = a + b;
    this.history.push(result);
    return result;
  }
  
  getHistory(): number[] {
    return this.history;
  }
}

// After: Unit with consciousness trinity
interface CalculatorProps extends UnitProps {
  precision: number;
}

class CalculatorUnit extends Unit<CalculatorProps> {
  protected constructor(props: CalculatorProps) {
    super(props);
  }
  
  protected build(): UnitCore {
    const capabilities = CapabilitiesClass.create(this.dna.id, {
      add: (...args: unknown[]) => this.addImpl(...args),
      subtract: (...args: unknown[]) => this.subtractImpl(...args)
    });

    const schema = SchemaClass.create(this.dna.id, {
      add: {
        name: 'add',
        description: 'Add two numbers',
        parameters: {
          type: 'object',
          properties: {
            a: { type: 'number' },
            b: { type: 'number' }
          },
          required: ['a', 'b']
        },
        response: { type: 'number' }
      }
    });

    const validator = ValidatorClass.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }
  
  static create(config: { precision?: number } = {}): CalculatorUnit {
    const props: CalculatorProps = {
      dna: createUnitSchema({ id: 'calculator', version: '1.0.7' }),
      precision: config.precision || 2,
      created: new Date()
    };
    return new CalculatorUnit(props);
  }
  
  whoami(): string { 
    return `CalculatorUnit[${this.dna.id}@${this.dna.version}]`; 
  }
  
  help(): void { 
    console.log(`Calculator with ${this.props.precision} decimal precision`); 
  }
  
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
  
  private addImpl(a: number, b: number): number {
    return Number((a + b).toFixed(this.props.precision));
  }
  
  private subtractImpl(a: number, b: number): number {
    return Number((a - b).toFixed(this.props.precision));
  }
}
```

### From v1.0.6 to v1.0.7 Migration

```typescript
// v1.0.6 Pattern (deprecated)
class OldUnit extends BaseUnit {
  constructor(data: any) {
    super(createUnitSchema({ name: 'old-unit', version: '1.0.6' }));
    this._addCapability('action', this.action.bind(this));
  }
  
  teach(): Record<string, Function> {
    return {
      action: this.action.bind(this)  // Static binding
    };
  }
  
  schemas(): ToolSchema[] {
    return [{ name: 'action', /* ... */ }];  // Static method
  }
}

// v1.0.7 Pattern (current)
class NewUnit extends Unit<NewUnitProps> {
  protected constructor(props: NewUnitProps) {
    super(props);
  }
  
  protected build(): UnitCore {
    // Living consciousness instances
    const capabilities = CapabilitiesClass.create(this.dna.id, {
      action: (...args) => this.action(...args)
    });
    
    const schema = SchemaClass.create(this.dna.id, {
      action: { /* schema definition */ }
    });
    
    const validator = ValidatorClass.create({
      unitId: this.dna.id,
      capabilities,
      schema
    });
    
    return { capabilities, schema, validator };
  }
  
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,  // Living instance
      schema: this._unit.schema,              // Living instance
      validator: this._unit.validator         // Living instance
    };
  }
}
```

### Technical Benefits of Migration

1. **Living Architecture**: Capabilities, schemas, and validators are active instances that can reason about themselves
2. **Namespace Safety**: All learned capabilities are namespaced preventing collisions
3. **Runtime Validation**: Schema and validator instances provide dynamic validation during execution
4. **Immutable Evolution**: Units evolve through new instances preserving complete lineage
5. **Composition Patterns**: Teaching contracts enable sophisticated capability composition
6. **Type Safety**: Full TypeScript support with generic typing throughout
7. **Performance Optimization**: Lazy loading, caching, and memory management built-in

## Best Practices v1.0.7

1. **Use Protected Constructors**: `Unit.create()` not `new Unit()`
2. **Implement Consciousness Trinity**: Mandatory `build()` method returning `UnitCore`
3. **Selective Teaching**: Only expose intended capabilities through schemas
4. **Namespace Capabilities**: Use `unitId.capability` format for all learned operations
5. **Validate Props**: Perform validation in constructor with proper error handling
6. **Version Semantically**: Use semantic versioning for evolution tracking
7. **Document Live**: Implement dynamic `help()` method that reflects current state
8. **Handle Providers**: Account for different validation strictness across external systems
9. **Immutable Operations**: Never mutate props, always return new instances
10. **Test Consciousness**: Verify consciousness trinity creation and teaching contracts

---

*This document provides the technical foundation for Unit Architecture v1.0.7 - a capability-based system with consciousness trinity patterns, immutable evolution, and runtime composition.*
