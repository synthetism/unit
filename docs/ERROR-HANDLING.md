# Error Handling in Unit Architecture

## Philosophy: Clear Failures Enable Conscious Decisions

Unit Architecture treats errors as consciousness opportunities - moments where units must make intelligent decisions about how to proceed. We avoid hidden failures and complex error hierarchies in favor of clear, actionable error patterns.

## Two-Pattern Strategy

### 1. Simple Operations: Exception-Based (Throw Early, Fail Fast)

**When to use:** Basic unit operations, single-responsibility methods, straightforward validations.

**Pattern:** Operations either succeed or throw with clear guidance.

```typescript
// ✅ Simple operation - throw on failure
class KeyUnit extends Unit {
  static create(config: KeyConfig): KeyUnit {
    if (!config.algorithm) {
      throw new Error('Algorithm required for key creation');
    }
    
    if (!SUPPORTED_ALGORITHMS.includes(config.algorithm)) {
      throw new Error(`Unsupported algorithm: ${config.algorithm}. Supported: ${SUPPORTED_ALGORITHMS.join(', ')}`);
    }
    
    return new KeyUnit(props);
  }
  
  getPublicKey(): string {
    if (!this.props.publicKey) {
      throw new Error('Public key not available - unit creation failed');
    }
    return this.props.publicKey;
  }
}
```

**Benefits:**
- Immediate feedback
- Clear stack traces
- Simple to reason about
- No branching complexity

### 2. Complex Operations: Result Pattern

**When to use:** Multi-step operations, external integrations, capability learning, network operations.

**Pattern:** Operations return `Result<T>` for explicit success/failure handling.

```typescript
// ✅ Complex operation - Result pattern
import { Result } from './result'; // Local copy or @synet/patterns

class IdentityUnit extends Unit {
  async generateDID(options: DIDOptions): Promise<Result<string>> {
    try {
      // Step 1: Validate learned capabilities
      if (!this.can('crypto.sign')) {
        return Result.fail('Missing signing capability - learn from crypto unit first');
      }
      
      // Step 2: Generate key material
      const keyResult = await this.generateKeyMaterial(options);
      if (!keyResult.isSuccess) {
        return Result.fail(`Key generation failed: ${keyResult.errorMessage}`);
      }
      
      // Step 3: Create DID
      const did = this.createDIDFromKey(keyResult.value);
      
      return Result.ok(did);
      
    } catch (error) {
      return Result.fail(`DID generation failed: ${error.message}`);
    }
  }
}

// Usage
const didResult = await identity.generateDID(options);
if (didResult.isSuccess) {
  console.log('DID created:', didResult.value);
} else {
  console.error('Failed:', didResult.errorMessage);
}
```

## Result Pattern Implementation

### Local Result.ts (Recommended for Core Units)

```typescript
// src/result.ts - Zero dependency implementation
export class Result<T> {
  private constructor(
    private _isSuccess: boolean,
    private _value?: T,
    private _error?: string
  ) {}
  
  static ok<T>(value: T): Result<T> {
    return new Result(true, value);
  }
  
  static fail<T>(error: string): Result<T> {
    return new Result(false, undefined, error);
  }
  
  get isSuccess(): boolean {
    return this._isSuccess;
  }
  
  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot access value of failed result');
    }
    return this._value!;
  }
  
  get errorMessage(): string {
    return this._error || 'Unknown error';
  }
}
```

### @synet/patterns Dependency (For Complex Compositions)

```typescript
// For multi-unit compositions or advanced patterns
import { Result, ApiResponse } from '@synet/patterns';

class ComposedUnit extends Unit {
  async complexOperation(): Promise<ApiResponse<Data>> {
    // Leverage full patterns library for advanced scenarios
  }
}
```

## Error Message Guidelines

### 1. Capability-Driven Errors
Always guide toward solution through learning:

```typescript
// ✅ Guides toward capability acquisition
throw new Error('Cannot sign data - learn signing capability: unit.learn([signer.teach()])');

// ❌ Generic, unhelpful
throw new Error('Signing failed');
```

### 2. Context-Rich Failures
Include unit identity and operation context:

```typescript
// ✅ Rich context
throw new Error(`${this.whoami()} cannot execute '${command}' - capability not learned`);

// ❌ No context
throw new Error('Command failed');
```

### 3. Actionable Messages
Tell developers exactly how to fix the issue:

```typescript
// ✅ Actionable
return Result.fail('DID generation requires crypto capabilities. Learn from: CryptoUnit.create().teach()');

// ❌ Vague
return Result.fail('Missing dependencies');
```

## Unit Creation Error Handling

### Factory Pattern with Clear Failures

```typescript
class MyUnit extends Unit {
  private constructor(props: MyUnitProps) {
    super(props);
  }
  
  static create(config: MyUnitConfig): MyUnit {
    // Validate configuration
    if (!config.required) {
      throw new Error('Required configuration missing: config.required');
    }
    
    // Transform and validate props
    const props = this.buildProps(config);
    
    // Create unit (may throw during capability setup)
    return new MyUnit(props);
  }
  
  private static buildProps(config: MyUnitConfig): MyUnitProps {
    // Validation and transformation logic
    // Throws on invalid configuration
  }
}
```

## Integration with Unit Architecture

### Teaching/Learning Error Patterns

```typescript
// Teaching failures (simple - should be rare)
teach(): TeachingContract {
  if (!this.capableOf('sign')) {
    throw new Error('Cannot teach signing - capability not available');
  }
  
  return {
    unitId: this.dna.id,
    capabilities: { sign: this.sign.bind(this) }
  };
}

// Learning integration (complex - use Result)
async learnAndExecute(contracts: TeachingContract[]): Promise<Result<void>> {
  try {
    this.learn(contracts);
    
    // Validate learned capabilities
    const requiredCaps = ['sign', 'encrypt'];
    const missingCaps = requiredCaps.filter(cap => !this.can(cap));
    
    if (missingCaps.length > 0) {
      return Result.fail(`Missing capabilities after learning: ${missingCaps.join(', ')}`);
    }
    
    return Result.ok(undefined);
    
  } catch (error) {
    return Result.fail(`Learning failed: ${error.message}`);
  }
}
```

## Best Practices

### 1. Choose the Right Pattern
- **Throw**: Unit creation, basic operations, validation
- **Result**: Multi-step workflows, external dependencies, capability composition

### 2. Fail Fast, Fail Clear
- Validate early in static `create()` methods
- Provide actionable error messages
- Include unit identity in error context

### 3. Preserve Unit Consciousness
- Units should never be in invalid states
- Failed creation should throw, not return broken units
- Error messages should guide toward capability acquisition

### 4. Zero Dependency Principle
- Use local Result.ts for core units
- Only depend on @synet/patterns for complex compositions
- Keep error handling self-contained

## Anti-Patterns to Avoid

```typescript
// ❌ Hidden failures
unit.created // Checking creation status - units should throw on creation failure

// ❌ Complex error hierarchies  
class UnitError extends Error {}
class CapabilityError extends UnitError {}

// ❌ Generic error handling
try { unit.operation(); } catch { /* ignore */ }

// ❌ Dependency injection for error handling
constructor(private errorHandler: ErrorHandler) {}
```

## Summary

Error handling in Unit Architecture follows the consciousness principle: units make intelligent decisions about failures and guide users toward solutions. Use exceptions for simple operations and the Result pattern for complex workflows, always maintaining the zero-dependency principle and capability-driven error messages.
