---
title: UNIT ARCHITECTURE DOCTRINE
description: Professional development principles for intelligent component architecture.
createdAt: 11.08.25
version: 1.0.8
---

# **UNIT ARCHITECTURE DOCTRINE v1.0.8**

Unit Architecture Doctrine v1.0.8 ensures intelligent, composable, AI-ready components that scale with team growth and system complexity

## **Introduction: Intelligent Component Architecture**

Unit Architecture is **capability-based software design** - where code components become self-aware, intelligent entities that can share capabilities, learn from others, and evolve while maintaining clear identity. This represents a fundamental shift from traditional object-oriented programming to **intelligent component architecture** for modern development teams.

**Core Principle:** *Structure enables intelligence* - Units are designed as intelligent components with DNA (identity), immutable state (props), and the capability trinity (Capabilities + Schema + Validator). Each unit follows **intelligence-first design** where:

- **Identity** = Unit's DNA and role in the system architecture
- **Capabilities** = What the unit can actually do (runtime instance)
- **Schema** = How the unit describes itself to other components (runtime instance)
- **Validator** = How the unit ensures its operations remain consistent (runtime instance)

**AI-Ready Architecture:** Units are designed for AI systems to understand, compose, and orchestrate autonomously. Every doctrine principle enables AI-driven development, testing, and architectural decision-making. Units become **living documentation** that AI can read, understand, and manipulate without human interpretation layers.

**Capability Trinity:** The breakthrough of v1.0.8 is that Capabilities, Schema, and Validator are no longer static configurations - they are **runtime instances** that can validate, introspect, and evolve. This creates true intelligent component infrastructure.

**Doctrines:** These aren't just programming rules - they're **architectural DNA** that ensures units remain intelligent, autonomous, and evolutionarily stable. AI systems use these doctrines to generate consistent, reliable code that self-validates, auto-documents, and evolves capability patterns.

---

## **CORE ARCHITECTURE PRINCIPLES (Doctrines 1-11)**

### 1. ZERO DEPENDENCY 
*"Dependencies create coupling - eliminate them to achieve maximum reusability"*

**Rule:** No external dependencies or injections in core units. Every unit must be self-contained.

```typescript
// ✅ Correct - Pure, self-contained
export class CryptoUnit extends Unit<CryptoUnitProps> {
  // Uses only native crypto, no external libs
}

// ❌ Avoid - External dependency injection
export class BadUnit extends Unit<CryptoUnitProps> {
  constructor(private lodash: typeof _) {} // Creates coupling
}
```

**Rationale:** Self-contained units can be moved between projects, understood by AI, and composed without dependency hell.

### 2. TEACH/LEARN PARADIGM
*"Units must share capabilities and learn from others - isolated components provide no value"*

**Rule:** Every unit MUST implement `teach()` and `learn()`. No unit exists in isolation.

```typescript
// ✅ Teaching capabilities to other units
class CryptoUnit extends Unit<CryptoProps> {
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
}

// ✅ Learning from other units
class APIUnit extends Unit<APIProps> {
  async setupCapabilities() {
    const crypto = CryptoUnit.create();
    this.learn([crypto.teach()]); // API can now encrypt/decrypt
  }
}
```

**Rationale:** Capability sharing enables true component reuse and AI orchestration.

### 3. PROPS CONTAIN EVERYTHING
*"Props are the single source of truth - avoid private field duplication"*

**Rule:** No private field duplication. Props via ValueObject<T> are the authoritative state.

```typescript
// ✅ Correct - Props as single source of truth
interface KeyUnitProps extends UnitProps {
  dna: UnitSchema;
  publicKey: string;
  privateKey: string;
  created: Date;
  metadata: Record<string, unknown>;
}

class KeyUnit extends Unit<KeyUnitProps> {
  // ✅ Protected constructor enables evolution
  protected constructor(props: KeyUnitProps) {
    super(props);
  }

  // ✅ Access props via getter pattern
  get publicKeyPEM(): string {
    return this.props.publicKey;
  }
}

// ❌ Avoid - Private field duplication
class BadUnit {
  private _publicKey: string; // Unnecessary duplication
  private _privateKey: string; // Props become stale
}
```

**Rationale:** Single source of truth prevents state inconsistencies and enables reliable introspection.

### 4. CREATE NOT CONSTRUCT
*"Protected constructors + static create() with proper validation"*

**Rule:** Primary construction through `static create()`. Constructor is protected.

```typescript
// ✅ Correct - Factory pattern with validation
export class FileSystemUnit extends Unit<FileSystemProps> {
  protected constructor(props: FileSystemProps) { 
    super(props); 
  }

  static create(config: FileSystemConfig): FileSystemUnit {
    // Validation and transformation logic here
    const props: FileSystemProps = {
      dna: createUnitSchema({ id: 'filesystem', version: '1.0.8' }),
      basePath: validatePath(config.basePath),
      permissions: config.permissions || 'read-write',
      created: new Date(),
      metadata: config.metadata || {}
    };
    
    return new FileSystemUnit(props);
  }
}

// ❌ Avoid - Public constructor
export class BadUnit extends Unit<BadProps> {
  constructor(props: BadProps) { /* No validation control */ }
}
```

**Rationale:** Controlled creation ensures valid units and enables evolution patterns.

### 5. CAPABILITY-BASED COMPOSITION
*"Acquire capabilities through learning, not inheritance"*

**Rule:** Units grow capabilities by learning from other units, not through class inheritance.

```typescript
// ✅ Correct - Capability composition
class ServiceUnit extends Unit<ServiceProps> {
  async initialize() {
    const crypto = CryptoUnit.create();
    const storage = StorageUnit.create();
    
    // Learn capabilities at runtime
    this.learn([crypto.teach(), storage.teach()]);
    
    // Now can encrypt and store
    await this.execute('crypto.encrypt', data);
    await this.execute('storage.save', encryptedData);
  }
}

// ❌ Avoid - Inheritance coupling
class BadService extends CryptoUnit { /* Tight coupling */ }
```

**Rationale:** Composition enables flexible, runtime-determined capabilities without inheritance constraints.

### 6. EXECUTE AS CAPABILITY MEMBRANE
*"Use execute() for learned capabilities, direct methods for native ones"*

**Rule:** `execute()` for learned capabilities, direct method calls for native capabilities.

```typescript
class ServiceUnit extends Unit<ServiceProps> {
  // ✅ Native capability - direct method
  async validateInput(data: unknown): Promise<boolean> {
    return this.isValidData(data);
  }

  // ✅ Learned capability - use execute()
  async processData(data: unknown): Promise<ProcessedData> {
    if (this.can('crypto.encrypt')) {
      return this.execute('crypto.encrypt', data); // Learned capability
    }
    return this.processPlaintext(data); // Fallback to native
  }
}
```

**Rationale:** Clear distinction between native and learned capabilities enables better debugging and AI understanding.

### 7. EVERY UNIT MUST HAVE DNA
*"Units self-describe through createUnitSchema() - identity is fundamental"*

**Rule:** Every unit must have a schema that defines its identity and role.

```typescript
// ✅ Required DNA pattern
static create(config: UnitConfig): SomeUnit {
  const props: SomeUnitProps = {
    dna: createUnitSchema({ 
      id: 'some-unit', 
      version: '1.0.8',
      description: 'Handles specific business logic with validation'
    }),
    // ... other props
  };
  return new SomeUnit(props);
}
```

**Rationale:** Identity enables capability resolution, debugging, and AI system understanding.

### 8. PURE FUNCTION HEARTS
*"Core logic should be pure functions - side effects isolated"*

**Rule:** Separate pure logic from stateful operations.

```typescript
// ✅ Pure function, easily tested
function generateKeyPair(algorithm: string): KeyPair { 
  // Pure computation, no side effects
}

// ✅ Unit wraps pure functions with state management
class KeyUnit extends Unit<KeyUnitProps> {
  generate(algorithm: string, options: KeyOptions): KeyResult {
    // Pure function as core logic
    const keyPair = generateKeyPair(algorithm);
    
    // State management and business logic
    const result = this.enhanceKeyPair(keyPair, options);
    
    return result;
  }
}
```

**Rationale:** Pure functions are predictable, testable, and enable AI to understand business logic.

### 9. ALWAYS TEACH
*"Teaching is capability transfer - Units choose what to share"*

**Rule:** Teaching must expose capability trinity for true knowledge transfer.

```typescript
// ✅ Complete capability sharing
class CryptoUnit extends Unit<CryptoProps> {
  protected build(): UnitCore {
    const capabilities = Capabilities.create(this.dna.id, {
      sign: (...args: unknown[]) => this.sign(...args),
      verify: (...args: unknown[]) => this.verify(...args),
      getPublicKey: (...args: unknown[]) => this.getPublicKey(...args)
    });

    const schema = Schema.create(this.dna.id, {
      sign: {
        name: 'sign',
        description: 'Sign data with private key',
        parameters: {
          type: 'object',
          properties: {
            data: { type: 'string', description: 'Data to sign' }
          },
          required: ['data']
        }
      }
    });

    const validator = Validator.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }

  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
}
```

**Rationale:** Complete capability sharing enables rich AI tool integration and reliable component composition.

### 10. EXPECT LEARNING
*"Structure code to gracefully handle capability acquisition"*

**Rule:** Units should work with or without learned capabilities.

```typescript
// ✅ Graceful degradation pattern
class DataProcessorUnit extends Unit<DataProcessorProps> {
  async processData(data: unknown): Promise<ProcessedData> {
    // Check for learned encryption capability
    if (this.can('crypto.encrypt')) {
      const encrypted = await this.execute('crypto.encrypt', data);
      return { data: encrypted, encrypted: true };
    }
    
    // Graceful fallback to basic processing
    return { data: this.basicProcess(data), encrypted: false };
  }
}
```

**Rationale:** Graceful degradation ensures units remain functional and enables progressive capability enhancement.

### 11. ALWAYS HELP
*"Implement living help() documentation"*

**Rule:** Every unit must provide runtime documentation.

```typescript
class DatabaseUnit extends Unit<DatabaseProps> {
  help(): void {
    console.log(`
DatabaseUnit - Data persistence and retrieval

NATIVE CAPABILITIES:
• save(data) - Persist data with validation
• find(id) - Retrieve by ID
• list(filters) - Query with filters

LEARNED CAPABILITIES:
${this.getCapabilities().filter(cap => cap.includes('.')).map(cap => `• ${cap}`).join('\n') || '• None learned yet'}

USAGE:
  const db = DatabaseUnit.create({ connectionString: '...' });
  await db.execute('save', userData);
  await db.execute('crypto.encrypt', sensitiveData); // If crypto learned

EVOLUTION:
  Parent: ${this.dna.parent?.id || 'None'}
  Version: ${this.dna.version}
    `);
  }
}
```

**Rationale:** Living documentation enables AI assistance and reduces onboarding time.

---

## **CAPABILITY COLLABORATION PRINCIPLES (Doctrines 12-22)**

### 12. NAMESPACE EVERYTHING
*"All learned capabilities use unitId.capability format"*

**Rule:** Learned capabilities must be namespaced to prevent conflicts.

```typescript
// ✅ Correct namespacing
const crypto = CryptoUnit.create();
const api = APIUnit.create();

api.learn([crypto.teach()]);

// Namespaced execution
await api.execute('crypto-unit.encrypt', data); // Clear origin
```

**Rationale:** Namespacing prevents capability name conflicts and enables capability debugging.

### 13. TYPE HIERARCHY CONSISTENCY
*"Config → Props → State → Output naming pattern"*

**Rule:** Use consistent naming patterns across type definitions.

```typescript
// ✅ Consistent type naming
interface DatabaseConfig {        // External input
  connectionString: string;
  options?: DatabaseOptions;
}

interface DatabaseProps extends UnitProps {  // Internal state
  dna: UnitSchema;
  connectionString: string;
  validated: boolean;
  metadata: Record<string, unknown>;
}

interface DatabaseState {         // Runtime state
  connected: boolean;
  transactionCount: number;
}

interface DatabaseOutput {        // Operation results
  success: boolean;
  data?: unknown;
  error?: string;
}
```

**Rationale:** Consistent naming enables AI to understand data flow and generates predictable code.

### 14. ERROR BOUNDARY CLARITY
*"Exceptions for impossible states, Results for expected failures"*

**Rule:** Use exceptions for architectural violations, Result patterns for business failures.

```typescript
// ✅ Exception for impossible state
static create(config: UnitConfig): DatabaseUnit {
  if (!config.connectionString) {
    throw new Error('[DatabaseUnit] Connection string required'); // Architectural violation
  }
}

// ✅ Result pattern for expected failures
async save(data: unknown): Promise<Result<SaveOutput>> {
  try {
    const validation = await this.validateData(data);
    if (!validation.valid) {
      return Result.fail(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const saved = await this.persistData(data);
    return Result.success({ id: saved.id, created: true });
  } catch (error) {
    return Result.fail(`Database error: ${error.message}`);
  }
}
```

**Rationale:** Clear error boundaries help AI understand when to catch vs. let errors propagate.

### 15. ENHANCED ERROR MESSAGES
*"Include unit identity, capabilities, and resolution guidance"*

**Rule:** Errors must provide actionable information with unit context.

```typescript
// ✅ Enhanced error messages
async processData(data: unknown): Promise<ProcessedData> {
  if (!this.can('crypto.encrypt')) {
    throw new Error(`
[${this.dna.id}] Cannot encrypt data - missing 'crypto.encrypt' capability

Available capabilities: ${this.getCapabilities().join(', ')}
Required capability: 'crypto.encrypt'

Resolution:
  const crypto = CryptoUnit.create();
  ${this.dna.id}.learn([crypto.teach()]);
  
Context: Processing sensitive user data requires encryption
    `);
  }
}
```

**Rationale:** Rich error messages enable faster debugging and provide AI with resolution context.

### 16. CAPABILITY VALIDATION
*"Check prerequisites before execution with helpful errors"*

**Rule:** Validate capabilities before attempting execution.

```typescript
// ✅ Capability validation pattern
async performSecureOperation(data: unknown): Promise<SecureResult> {
  // Check required capabilities
  const required = ['crypto.encrypt', 'storage.save'];
  const missing = required.filter(cap => !this.can(cap));
  
  if (missing.length > 0) {
    throw new Error(`
[${this.dna.id}] Missing required capabilities: ${missing.join(', ')}
Available: ${this.getCapabilities().join(', ')}

Required units:
${missing.map(cap => `  - ${cap.split('.')[0]}`).join('\n')}
    `);
  }
  
  // Proceed with operation
  const encrypted = await this.execute('crypto.encrypt', data);
  return this.execute('storage.save', encrypted);
}
```

**Rationale:** Early validation prevents runtime failures and provides clear resolution paths.

### 17. VALUE OBJECT FOUNDATION
*"Units are immutable value objects with identity and capabilities"*

**Rule:** Units extend ValueObject for immutability and equality semantics.

```typescript
// ✅ ValueObject foundation with capability extension
export abstract class Unit<T extends UnitProps> extends ValueObject<T> {
  protected readonly _unit: UnitCore;

  protected constructor(props: T) {
    super(props); // Immutable props foundation
    this._unit = this.build(); // Mutable capabilities layer
  }

  // Immutable identity
  get dna(): UnitSchema {
    return this.props.dna;
  }

  // Equality based on props, not capabilities
  equals(other: Unit<T>): boolean {
    return super.equals(other); // ValueObject comparison
  }
}
```

**Rationale:** ValueObject foundation ensures predictable equality and state management.

### 18. IMMUTABLE EVOLUTION
*"Evolution creates new units while preserving lineage"*

**Rule:** Evolution must preserve unit lineage and create new instances.

```typescript
// ✅ Immutable evolution pattern
evolve(name: string, additionalCapabilities?: Record<string, Function>): Unit<T> {
  // Create new DNA with evolution lineage
  const newDNA: UnitSchema = {
    id: name,
    version: this._getNextVersion(),
    parent: { ...this.props.dna } // Preserve lineage
  };

  // Create evolved instance
  const evolved = new (this.constructor as new (props: T) => Unit<T>)({
    ...this.props,
    dna: newDNA
  } as T);

  // Transfer existing capabilities
  evolved.learn([this.teach()]);

  // Add new capabilities if provided
  if (additionalCapabilities) {
    // Implementation preserves immutability
  }

  return evolved;
}
```

**Rationale:** Immutable evolution enables safe system upgrades with complete audit trails.

### 19. CAPABILITY LEAKAGE PREVENTION
*"Never teach what you learned - teach only native capabilities"*

**Rule:** Units can only teach their native capabilities, not learned ones.

```typescript
// ✅ Native capability teaching only
class ServiceUnit extends Unit<ServiceProps> {
  protected build(): UnitCore {
    // Only expose native capabilities
    const capabilities = Capabilities.create(this.dna.id, {
      processData: (...args: unknown[]) => this.processData(...args),
      validateInput: (...args: unknown[]) => this.validateInput(...args)
      // Never expose learned capabilities like 'crypto.encrypt'
    });
    
    return { capabilities, schema, validator };
  }

  teach(): TeachingContract {
    // Only shares native capabilities
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities, // Native only
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
}
```

**Rationale:** Prevents capability pollution and maintains clear ownership boundaries.

### 20. DO ONE THING AND DO IT WELL
*"Units function at native level even without learning"*

**Rule:** Units must provide baseline functionality without any learned capabilities.

```typescript
// ✅ Graceful degradation implementation
class PaymentUnit extends Unit<PaymentProps> {
  async processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult> {
    // Native validation
    if (!this.isValidAmount(amount)) {
      return { success: false, error: 'Invalid amount' };
    }

    // Enhanced processing if crypto available
    if (this.can('crypto.encrypt')) {
      const encrypted = await this.execute('crypto.encrypt', method);
      return this.processSecurePayment(amount, encrypted);
    }

    // Graceful fallback to basic processing
    return this.processBasicPayment(amount, method);
  }
}
```

**Rationale:** Baseline functionality ensures units work in minimal environments and during capability failures.

### 21. COMPOSITION BOUNDARIES
*"Units compose through contracts, not implementation details"*

**Rule:** Inter-unit communication must use defined contracts and interfaces.

```typescript
// ✅ Contract-based composition
interface PaymentContract {
  charge(amount: number, token: string): Promise<ChargeResult>;
  refund(transactionId: string): Promise<RefundResult>;
}

class PaymentUnit extends Unit<PaymentProps> implements PaymentContract {
  // Contract implementation provides stable interface
  async charge(amount: number, token: string): Promise<ChargeResult> {
    // Internal implementation can change
    return this.internalChargeLogic(amount, token);
  }
}

// Other units depend on contract, not implementation
class OrderUnit extends Unit<OrderProps> {
  async completeOrder(order: Order): Promise<OrderResult> {
    // Uses contract interface
    if (this.can('payment.charge')) {
      return this.execute('payment.charge', order.total, order.paymentToken);
    }
  }
}
```

**Rationale:** Contract-based composition enables independent evolution and reliable AI orchestration.

### 22. STATELESS OPERATIONS
*"Operations are stateless functions over immutable props and mutable capabilities"*

**Rule:** Operations should be deterministic given current props and capabilities.

```typescript
// ✅ Stateless operations pattern
class AnalyticsUnit extends Unit<AnalyticsProps> {
  // Deterministic given props + capabilities
  async analyzeData(dataset: DataSet): Promise<AnalysisResult> {
    // Uses immutable props for configuration
    const config = {
      algorithm: this.props.defaultAlgorithm,
      precision: this.props.precision
    };

    // Uses capabilities for optional enhancements
    if (this.can('ml.process')) {
      return this.execute('ml.process', dataset, config);
    }

    // Deterministic fallback using props
    return this.basicAnalysis(dataset, config);
  }
}
```

**Rationale:** Stateless operations enable predictable behavior and safe concurrent execution.

---

## **CAPABILITY TRINITY PRINCIPLES (Doctrines 23-27)**

### 23. CAPABILITY TRINITY PATTERN
*"Every unit implements build() creating Capabilities + Schema + Validator as runtime instances"*

**Rule:** Units must implement the trinity pattern for complete capability management.

```typescript
// ✅ Complete trinity implementation
class DatabaseUnit extends Unit<DatabaseProps> {
  protected build(): UnitCore {
    // Capabilities: What can be done
    const capabilities = Capabilities.create(this.dna.id, {
      save: (...args: unknown[]) => this.save(...args),
      find: (...args: unknown[]) => this.find(...args),
      delete: (...args: unknown[]) => this.delete(...args)
    });

    // Schema: How to do it (AI tool integration)
    const schema = Schema.create(this.dna.id, {
      save: {
        name: 'save',
        description: 'Persist data to database with validation',
        parameters: {
          type: 'object',
          properties: {
            data: { type: 'object', description: 'Data to persist' },
            options: { 
              type: 'object',
              properties: {
                validate: { type: 'boolean', description: 'Run validation' }
              }
            }
          },
          required: ['data']
        },
        response: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Generated ID' },
            success: { type: 'boolean', description: 'Operation success' }
          }
        }
      }
    });

    // Validator: Ensuring correctness
    const validator = Validator.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: this.props.strictValidation
    });

    return { capabilities, schema, validator };
  }

  // Trinity access methods
  capabilities(): Capabilities { return this._unit.capabilities; }
  schema(): Schema { return this._unit.schema; }
  validator(): Validator { return this._unit.validator; }
}
```

**Rationale:** The trinity pattern provides complete capability management for AI integration and reliable operation.

### 24. ORCHESTRATOR VS TOOL DISTINCTION
*"Orchestrator units have empty schemas, Tool units have rich schemas"*

**Rule:** AI orchestrators don't get learned, tools do.

```typescript
// ✅ Tool Unit - Rich schemas for learning
class WeatherUnit extends Unit<WeatherProps> {
  protected build(): UnitCore {
    const schema = Schema.create(this.dna.id, {
      getCurrentWeather: {
        name: 'getCurrentWeather',
        description: 'Get current weather for location',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City name' },
            units: { type: 'string', enum: ['metric', 'imperial'] }
          },
          required: ['location']
        }
      }
    });
    // ... capabilities and validator
  }
}

// ✅ Orchestrator Unit - Empty schemas
class AIAgentUnit extends Unit<AIAgentProps> {
  protected build(): UnitCore {
    const schema = Schema.create(this.dna.id, {}); // No schemas - AI orchestrates
    // ... capabilities for internal operations only
  }
}
```

**Rationale:** Clear distinction enables proper AI tool registration and prevents circular orchestration.

### 25. SCHEMA OPTIONAL DESIGN
*"Schemas exist only when teaching is intended (YAGNI principle)"*

**Rule:** Don't create schemas for capabilities that won't be shared.

```typescript
// ✅ Selective schema creation
class InternalProcessorUnit extends Unit<ProcessorProps> {
  protected build(): UnitCore {
    const capabilities = Capabilities.create(this.dna.id, {
      // Public capability with schema
      processData: (...args: unknown[]) => this.processData(...args),
      
      // Internal capability without schema
      internalCleanup: (...args: unknown[]) => this.internalCleanup(...args)
    });

    const schema = Schema.create(this.dna.id, {
      // Only public capabilities get schemas
      processData: {
        name: 'processData',
        description: 'Process input data with validation',
        // ... schema definition
      }
      // internalCleanup intentionally omitted
    });

    return { capabilities, schema, validator };
  }
}
```

**Rationale:** Schema creation requires effort - only invest where teaching/AI integration is needed.

### 26. CAPABILITY TRINITY TEACHING
*"Teaching exposes living instances, not static bindings"*

**Rule:** TeachingContract must provide runtime instances for full capability transfer.

```typescript
// ✅ Living instance teaching
class CryptoUnit extends Unit<CryptoProps> {
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,  // Living instance
      schema: this._unit.schema,              // Living instance
      validator: this._unit.validator         // Living instance
    };
  }
}

// ❌ Avoid - Static teaching
class BadUnit extends Unit<BadProps> {
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: { encrypt: this.encrypt.bind(this) }, // Static binding
      schema: { /* static object */ },                    // Static definition
      validator: { /* static methods */ }                 // Static validation
    };
  }
}
```

**Rationale:** Living instances enable dynamic capability validation and runtime introspection.

### 27. PROVIDER COMPATIBILITY AWARENESS
*"Handle external system behavior variations with Unit-layer validation"*

**Rule:** Units must validate external provider responses and normalize interfaces.

```typescript
// ✅ Provider compatibility handling
class EmailUnit extends Unit<EmailProps> {
  async send(email: EmailMessage): Promise<EmailResult> {
    try {
      let result: ProviderResult;
      
      // Provider-specific handling
      switch (this.props.provider) {
        case 'sendgrid':
          result = await this.sendViaSendGrid(email);
          break;
        case 'ses':
          result = await this.sendViaSES(email);
          break;
        default:
          throw new Error(`[${this.dna.id}] Unsupported provider: ${this.props.provider}`);
      }

      // Normalize response regardless of provider
      return this.normalizeEmailResult(result);
      
    } catch (error) {
      return {
        success: false,
        error: `Provider error: ${error.message}`,
        provider: this.props.provider
      };
    }
  }

  private normalizeEmailResult(providerResult: ProviderResult): EmailResult {
    // Convert provider-specific response to standard format
    return {
      success: this.extractSuccess(providerResult),
      messageId: this.extractMessageId(providerResult),
      timestamp: new Date().toISOString()
    };
  }
}
```

**Rationale:** Provider compatibility ensures units work reliably across different external services and environments.

---

## **AI INSTRUCTIONS CHECKLIST**

When creating a new unit, ensure compliance with all 27 doctrines:

### **Core Architecture (1-11)**
- [ ] Zero external dependencies
- [ ] Implements teach() and learn()
- [ ] Props contain all state, no private field duplication
- [ ] Protected constructor + static create()
- [ ] Capability-based composition, not inheritance
- [ ] execute() for learned, direct methods for native
- [ ] Unit has DNA via createUnitSchema()
- [ ] Pure function core with stateful wrapper
- [ ] Teaching exposes chosen capabilities only
- [ ] Graceful degradation without learned capabilities
- [ ] Implements help() with current capabilities

### **Capability Collaboration (12-22)**
- [ ] All learned capabilities are namespaced
- [ ] Consistent Config → Props → State → Output naming
- [ ] Exceptions for impossible states, Results for expected failures
- [ ] Enhanced error messages with resolution guidance
- [ ] Capability validation before execution
- [ ] Extends ValueObject for immutability
- [ ] Evolution preserves lineage, creates new instances
- [ ] Never teaches learned capabilities
- [ ] Functions without any learned capabilities
- [ ] Uses contracts, not implementation details
- [ ] Operations are stateless and deterministic

### **Capability Trinity (23-27)**
- [ ] Implements build() with Capabilities + Schema + Validator
- [ ] Tool units have rich schemas, orchestrators have empty schemas
- [ ] Schemas only for capabilities that will be shared
- [ ] Teaching provides living instances, not static bindings
- [ ] Handles provider variations with normalization



