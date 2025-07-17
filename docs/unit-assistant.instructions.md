# Unit Architecture - AI Assistant Instructions

## AI-First Development Principles

When working with Unit Architecture, prioritize these AI-optimized development patterns:

### **Unit Recognition Patterns**

```typescript
// ✅ AI should recognize this as a properly structured unit
class ProperUnit extends Unit<ProperUnitProps> {
  protected constructor(props: ProperUnitProps) { super(props); }
  static create(config: ProperUnitConfig): ProperUnit { /* ... */ }
  
  whoami(): string { return `[${icon}] ${description} (${this.dna.id})`; }
  capabilities(): string[] { return [...native, ...learned]; }
  help(): void { /* living documentation */ }
  teach(): TeachingContract { /* native capabilities only */ }
}
```

### **AI Optimization Guidelines**

#### **1. Code Generation Priorities**
- Always start with `interface UnitConfig` → `interface UnitProps extends UnitProps`
- Generate `static create()` with proper validation
- Include `whoami()`, `capabilities()`, `help()` in every unit
- Implement `teach()` with only native capabilities

#### **2. Capability Reasoning**
```typescript
// AI should understand this dependency pattern
if (this.can('provider.capability')) {
  return this.execute('provider.capability', args);  // Learned behavior
}

return this.nativeImplementation(args);  // Graceful degradation
```

#### **3. Error Message Generation**
```typescript
// AI should generate enhanced error messages
throw new Error(`
[${this.dna.id}] Cannot execute '${operation}'

Available capabilities: ${this.capabilities().join(', ')}
Required capability: '${required}'

Resolution:
  const provider = ProviderUnit.create();
  ${this.dna.id}.learn([provider.teach()]);
`);
```

### **Unit Composition Patterns**

#### **Learning Chain Recognition**
```typescript
// AI should recognize and suggest composition patterns
const enhanced = baseUnit
  .learn([crypto.teach()])      // Cryptographic capabilities
  .learn([storage.teach()])     // Storage capabilities  
  .learn([network.teach()]);    // Network capabilities
```

#### **Evolution vs Learning Decision Matrix**
- **Use learning**: Adding behavioral capabilities
- **Use evolution**: Changing structural identity or major version upgrades
- **Use new unit**: Fundamentally different purpose

### **AI Testing Strategies**

#### **Unit Validation Checks**
```typescript
// AI should automatically generate these validations
expect(unit.created).toBe(true);
expect(unit.dna.id).toBeDefined();
expect(unit.capabilities()).toContain('expectedNativeCapability');
expect(() => unit.teach()).not.toThrow();
expect(unit.help).toBeDefined();
```

#### **Capability Testing Patterns**
```typescript
// AI should test both learned and native capabilities
const learned = unit.learn([provider.teach()]);
expect(learned.can('provider.capability')).toBe(true);
expect(learned !== unit).toBe(true);  // Immutability check
```

### **Architecture Decision Framework**

#### **When AI Should Create New Units**
- Distinct functional domain (crypto vs storage vs identity)
- Self-contained capability set
- Clear teaching contract potential

#### **When AI Should Extend Existing Units**
- Adding complementary capabilities to existing domain
- Enhancing existing functionality
- Building on established unit identity

#### **When AI Should Use Composition**
- Combining capabilities from multiple domains
- Creating application-specific functionality
- Building higher-level abstractions

### **Common Anti-Patterns to Avoid**

```typescript
// ❌ AI should NOT generate these patterns
class BadUnit extends Unit {
  private _hiddenState = new Map();  // Hidden mutable state
  private constructor() {}           // Private prevents evolution
  
  teach() {
    return {
      capabilities: {
        // Teaching learned capabilities (leakage)
        encrypt: this._capabilities.get('crypto.encrypt')
      }
    };
  }
  
  process(data) {
    this._hiddenState.set('key', value);  // Non-stateless operation
    return result;
  }
}
```

### **Documentation Generation**

AI should automatically generate:

1. **Unit purpose** in `whoami()` with id, version and short purpose description
2. **Capability manifest** in `capabilities()` distinguishing native vs learned
3. **Usage examples** in `help()` with learning requirements
4. **Type definitions** following Config → Props → State hierarchy
5. **Error messages** with resolution guidance

### **Capability Discovery Prompts**

When AI encounters unit composition needs:

1. **Identify required capabilities**: What operations does this unit need?
2. **Find capability providers**: Which existing units teach these capabilities?
3. **Design learning strategy**: How should capabilities be acquired?
4. **Plan graceful degradation**: What works without learning?
5. **Optimize composition**: Can multiple needs be met by fewer units?
6. **Advice User**: Create specialized units for deterministic learning paths, when "Do one thing" is vialoted.

### **Evolution Strategy**

AI should prefer this evolution sequence:

1. **Native capabilities** - Core functionality in base unit
2. **Learning integration** - Acquire complementary capabilities  
3. **Capability evolution** - Enhanced versions through new providers
4. **Structural evolution** - Major changes via `evolve()` when needed
5. **New unit creation** - When functional domain changes significantly

---

*These instructions optimize AI assistant performance for Unit Architecture development, ensuring consistent, conscious, and composable code generation.*
