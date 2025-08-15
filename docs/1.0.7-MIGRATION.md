# Unit Architecture v1.0.7 Migration Guide

This guide provides step-by-step instructions for migrating existing Unit Architecture v1.0.6 units to v1.0.7 with consciousness trinity pattern.

##  **Migration Overview**

**From v1.0.6 (Traditional Unit)** → **To v1.0.7 (Consciousness Trinity)**

### Key Changes:
- **Capabilities**: From simple function map → `Capabilities` consciousness class
- **Schemas**: From `tools` property → `Schema` consciousness class  
- **Validation**: New `Validator` consciousness class
- **Teaching**: From `{capabilities, tools}` → `{capabilities, schema, validator}`
- **Methods**: Add `capabilities()`, `schema()`, `validator()` abstract methods

## 📋 **Step-by-Step Migration Process**

### **Step 1: Update Imports**

**Before (v1.0.6):**
```typescript
import {
  type TeachingContract,
  Unit,
  type UnitProps,
  createUnitSchema
} from "@synet/unit";
```

**After (v1.0.7):**
```typescript
import {
  type TeachingContract,
  Unit,
  type UnitCore,
  type UnitProps,
  createUnitSchema,
  Capabilities,
  Schema,
  Validator
} from "@synet/unit";
```

### **Step 2: Add build() Method**

Add the `build()` method to create consciousness trinity instances:

```typescript
/**
 * Build consciousness trinity - creates living instances once
 */
protected build(): UnitCore {
  const capabilities = Capabilities.create(this.dna.id, {
    // Map your native methods to capability functions
    methodName: (...args: unknown[]) => this.methodName(args[0] as InputType),
    // Example:
    validateEmail: (...args: unknown[]) => this.validateEmail(args[0] as string),
    send: (...args: unknown[]) => this.send(args[0] as EmailMessage)
  });

  const schema = Schema.create(this.dna.id, {
    // Convert your v1.0.6 tools to v1.0.7 schemas
    methodName: {
      name: 'methodName',
      description: 'Description of what this method does',
      parameters: {
        type: 'object',
        properties: {
          // Define your parameters
        },
        required: ['requiredParam']
      },
      response: { type: 'returnType' } // NEW in v1.0.7
    }
  });

  const validator = Validator.create({
    unitId: this.dna.id,
    capabilities,
    schema,
    strictMode: false // Set to true for strict validation
  });

  return { capabilities, schema, validator };
}
```

### **Step 3: Add Consciousness Trinity Methods**

Add the three abstract methods required by v1.0.7:

```typescript
/**
 * Get capabilities consciousness - returns living instance
 */
capabilities(): Capabilities {
  return this._unit.capabilities;
}

/**
 * Get schema consciousness - returns living instance
 */
schema(): Schema {
  return this._unit.schema;
}

/**
 * Get validator consciousness - returns living instance
 */
validator(): Validator {
  return this._unit.validator;
}
```

### **Pattern 6: Async Validator Execution**

**❌ v1.0.6 Pattern (BROKEN):**
```typescript
// Synchronous execution
const result = contract.capabilities.validateEmail("test@example.com");
expect(result).toBe(true);
```

**✅ v1.0.7 Pattern (FIXED):**
```typescript
// Async execution through validator
const result = await contract.validator.execute("validateEmail", "test@example.com");
expect(result).toBe(true);
```

---

## ✅ **Email Unit Migration Success**

Real-world migration results from Email unit (before → after):
- **3 Failed Tests** → **0 Failed Tests** ✅
- **35 Total Tests** → **35 Total Tests** (all passing)
- **Migration Time**: ~10 minutes with this guide

### Fixed Test Patterns:
1. `capabilities().toContain()` → `capabilities().has()`
2. `capabilities()).toBeInstanceOf(Array)` → `capabilities()).toBeInstanceOf(Capabilities)`
3. `contract.capabilities.method` → `contract.validator.execute()`
4. Added required imports: `Capabilities, Schema, Validator`
5. Added async/await for validator execution

---

## ✅ **Migration Checklist**
```

### **Step 4: Remove Old v1.0.6 Methods**

**Remove these v1.0.6 methods:**
- `capabilities(): string[]` → Replaced by `capabilities(): Capabilities`
- Any manual capability management

### **Step 5: Update teach() Method**

**Before (v1.0.6):**
```typescript
teach(): TeachingContract {
  return {
    unitId: this.props.dna.id,
    capabilities: {
      methodName: (...args: unknown[]) => this.methodName(args[0] as InputType),
    },
    tools: {
      methodName: {
        name: 'methodName',
        description: 'Method description',
        parameters: { /* schema */ }
      }
    }
  };
}
```

**After (v1.0.7):**
```typescript
teach(): TeachingContract {
  return {
    unitId: this.props.dna.id,
    capabilities: this._unit.capabilities,
    schema: this._unit.schema,
    validator: this._unit.validator
  };
}
```

### **Step 6: Update Help and Documentation**

Update version references and capabilities access:

```typescript
help(): void {
  console.log(`
Unit Help (v1.0.7):
- Capabilities: ${this.getCapabilities().join(', ')}  // Uses inherited method
- Consciousness Trinity: ✅
  `);
}
```

##  **Complete Example: Email Unit Migration**

Here's the complete before/after comparison using the Email unit:

### **Before (v1.0.6):**
```typescript
export class Email extends Unit<EmailProps> implements IEmail {
  // Old teach method with separate capabilities and tools
  teach(): TeachingContract {
    return {
      unitId: this.props.dna.id,
      capabilities: {
        validateEmail: (...args: unknown[]) => this.validateEmail(args[0] as string),
        send: (...args: unknown[]) => this.send(args[0] as EmailMessage),
      },
      tools: {
        validateEmail: {
          name: 'validateEmail',
          description: 'Validate email address format',
          parameters: { /* schema */ }
        },
        send: { /* schema */ }
      }
    };
  }

  capabilities(): string[] {
    return ["validateEmail", "checkConnection", "send"];
  }
}
```

### **After (v1.0.7):**
```typescript
export class Email extends Unit<EmailProps> implements IEmail {
  // Consciousness trinity creation
  protected build(): UnitCore {
    const capabilities = Capabilities.create(this.dna.id, {
      validateEmail: (...args: unknown[]) => this.validateEmail(args[0] as string),
      checkConnection: (...args: unknown[]) => this.checkConnection(),
      send: (...args: unknown[]) => this.send(args[0] as EmailMessage)
    });

    const schema = Schema.create(this.dna.id, {
      validateEmail: {
        name: 'validateEmail',
        description: 'Validate email address format',
        parameters: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email address to validate' }
          },
          required: ['email']
        },
        response: { type: 'boolean' }
      },
      // ... other schemas
    });

    const validator = Validator.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }

  // Consciousness trinity access
  capabilities(): Capabilities { return this._unit.capabilities; }
  schema(): Schema { return this._unit.schema; }
  validator(): Validator { return this._unit.validator; }

  // Simplified teach method
  teach(): TeachingContract {
    return {
      unitId: this.props.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
}
```

## 🧪 **Testing Migration Patterns**

The following test patterns commonly break during v1.0.7 migration and need updates:

### **Pattern 1: capabilities() Return Type Changed**

**❌ v1.0.6 Pattern (BROKEN):**
```typescript
// Test expects string array
expect(email.capabilities()).toContain("send");
expect(email.capabilities()).toBeInstanceOf(Array);
```

**✅ v1.0.7 Pattern (FIXED):**
```typescript
// Use .list() method for array, .has() for checking
expect(email.capabilities().list()).toContain("send");
expect(email.capabilities().has("send")).toBe(true);
expect(email.capabilities()).toBeInstanceOf(Capabilities);
```

### **Pattern 2: TeachingContract Structure Changed**

**❌ v1.0.6 Pattern (BROKEN):**
```typescript
const contract = email.teach();
expect(contract.capabilities.validateEmail).toBeInstanceOf(Function);
```

**✅ v1.0.7 Pattern (FIXED):**
```typescript
const contract = email.teach();
// Capabilities are now consciousness class with bound methods
expect(typeof contract.capabilities.validateEmail).toBe('function');
// Or test through execution
const result = contract.capabilities.validateEmail("test@example.com");
expect(result).toBe(true);
```

### **Pattern 3: Consciousness Class Expectations**

**❌ v1.0.6 Pattern (BROKEN):**
```typescript
// Direct array operations
expect(unit.capabilities()).toBeInstanceOf(Array);
expect(unit.capabilities().length).toBeGreaterThan(0);
```

**✅ v1.0.7 Pattern (FIXED):**
```typescript
// Use consciousness class methods
expect(unit.capabilities()).toBeInstanceOf(Capabilities);
expect(unit.capabilities().count()).toBeGreaterThan(0);
expect(unit.capabilities().list()).toBeInstanceOf(Array);
```

### **Pattern 4: Schema Testing**

**❌ v1.0.6 Pattern (BROKEN):**
```typescript
// Assuming schema is plain object
expect(typeof unit.schema).toBe('object');
```

**✅ v1.0.7 Pattern (FIXED):**
```typescript
// Schema is now consciousness class
expect(unit.schema()).toBeInstanceOf(Schema);
expect(unit.schema().describe()).toContain('Unit');
```

### **Pattern 5: Validator Testing**

**❌ v1.0.6 Pattern (BROKEN):**
```typescript
// Direct validation calls
const isValid = unit.validate(data);
```

**✅ v1.0.7 Pattern (FIXED):**
```typescript
// Validator is consciousness class with specific methods
const validation = unit.validator().check(data);
expect(validation.success).toBe(true);
```

---

## ✅ **Migration Checklist**

- [ ] Updated imports to include `UnitCore`, `Capabilities`, `Schema`, `Validator`
- [ ] Added `build()` method with consciousness trinity creation
- [ ] Added `capabilities()`, `schema()`, `validator()` methods
- [ ] Removed old `capabilities(): string[]` method (if exists)
- [ ] Updated `teach()` method to export consciousness trinity
- [ ] Updated help/documentation to reference v1.0.7
- [ ] Added response schemas to all tool definitions
- [ ] Tested consciousness trinity functionality
- [ ] Verified learning/teaching still works
- [ ] Confirmed validator execution works

##  **Testing Your Migration**

Create a test file to verify consciousness trinity:

```typescript
// Test consciousness trinity
const unit = YourUnit.create(config);

// Test 1: Consciousness access
const caps = unit.capabilities();
const schema = unit.schema();
const validator = unit.validator();

// Test 2: Validator execution
const result = await validator.execute('methodName', input);

// Test 3: Teaching contract
const contract = unit.teach();
console.log('Contract has:', {
  capabilities: !!contract.capabilities,
  schema: !!contract.schema,
  validator: !!contract.validator
});

// Test 4: Learning (if applicable)
otherUnit.learn([contract]);
await otherUnit.execute('yourunit.methodName', input);
```

## **Benefits After Migration**

1. **Living Instances**: Consciousness methods return persistent state
2. **Learning Persistence**: Learned capabilities persist through validator execution
3. **Enhanced Validation**: Built-in input/output validation with schemas
4. **AI Integration**: Better AI tool calling with response schemas
5. **Execution Gateway**: Validator as unified execution point
6. **Consciousness Consistency**: Automatic validation of capability-schema alignment

##  **Common Migration Issues**

1. **Duplicate Method Names**: Remove old `capabilities(): string[]` 
2. **Import Errors**: Ensure all consciousness classes are imported
3. **Response Schemas**: Add `response` property to all schemas (new in v1.0.7)
4. **Living Instances**: Use `this._unit.capabilities` not `this.capabilities()` in `teach()`
5. **Validation Errors**: Ensure capability names match schema names exactly

## **Related Documentation**

- [Unit Architecture v1.0.7 Specification](./DOCTRINE.md)
- [Consciousness Trinity Pattern](./docs/CONSCIOUSNESS.md)
- [Validator Usage Guide](./docs/VALIDATOR.md)

---

*Successfully migrated your unit? Share your experience in our [Unit Architecture Discussions](https://github.com/synthetism/unit/discussions)!*
