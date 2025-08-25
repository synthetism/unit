## (⊚) Unit Architecture 

```bash
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


version: 1.1.1
                                                              
```
Here's something I've been thinking about: what if your code could actually learn from other code? Not through inheritance, dependency or injection, but by literally teaching and learning capabilities ?

```typescript
const myService = EmailService.create();
myService.learn([crypto.teach()]); // Now it can sign emails
myService.learn([storage.teach()]); // Now it can save drafts

// That's it. Your email service just learned cryptography and storage.
```

I know it sounds weird, but stick with me. This isn't another framework trying to solve everything. It's a pattern that makes software composition feel... natural.

**What you get:**
- Code that can teach and learn new things, without dependencies
- AI-ready components (every unit works with AI tools automatically)  
- Loose coupling that doesn't hurt
- Systems that evolve without breaking

---

## The Basic Idea

Every Unit can do two things:
1. **Teach** - share what it knows with other units
2. **Learn** - acquire new capabilities from other units

```typescript
// Create some units
const crypto = CryptoUnit.create();
const emailer = EmailUnit.create();

// Email unit learns crypto capabilities
emailer.learn([crypto.teach()]);

// Now email can do crypto stuff
const signed = await emailer.execute('crypto.sign', message);
```

That's really it. No complex wiring, no dependency graphs to manage. Units just teach each other what they know.

## A Real Example

Let's say you're building a notification system. You need to send emails, encrypt sensitive data, and maybe store some logs. Here's how we got used to approach it:

```typescript
// The usual way - inject everything you might need
class NotificationService {
  constructor(
    private emailer: EmailProvider,
    private crypto: CryptoService,
    private logger: Logger,
    private storage: Storage
  ) {}
  
  async sendSecureNotification(user: User, message: string) {
    // Hope all the dependencies work together...
  }
}
```

It's clean, it works, but you're now coupled to specific implementations, testing is a pain because you have to mock everything, and adding new capabilities means updating constructors everywhere. When it get out of control - CommandBuses, Mediators, Queries - massive cognitive, that becomes unmanagable.

**Here's the Unit way:**

```typescript
// Create a unit that starts simple
const notifier = NotificationUnit.create();

// Teach it what it needs to know, when it needs to know it
notifier.learn([
  emailUnit.teach(),    // Now it can send emails
  cryptoUnit.teach(),   // Now it can encrypt
  loggerUnit.teach()    // Now it can log
]);

// Use the capabilities it learned
await notifier.execute('email.send', user, message);
await notifier.execute('crypto.encrypt', sensitiveData);
```

## Why This Matters

**Testing gets easier.** Instead of mocking a dozen dependencies, you test units in isolation and then test the learning contracts.

**AI integration is automatic.** Every unit exposes its capabilities as schemas that AI tools can understand and use immediately.

**Your architecture stays flexible.** Need to swap email providers? Teach your units a different email capability. The rest of your code doesn't change.

**New team members get productive faster.** They can ask any unit "what can you do?" and get a real answer.

## How Units Work

A Unit is just a class, a Value-Object, that follows a specific pattern:

```typescript

// Implementation - your Unit
class EmailUnit extends Unit<Props> {
  // 1. Every unit has a protected constructor
  protected constructor(props:Props) {
    super(props);
  }
  
  // 2. Create through static factory
  static create(config:Config) {
    return new EmailUnit({
      dna: { id: 'email', version: '1.0.0', description: 'my first unit' },
      apiKey: config.apiKey // Immutable props
    });
  }
  
  // 3. Define what you can teach others
  teach() {
    return {
      unitId: this.dna.id,
      capabilities: {
        'send': (...args) => this.sendEmail(...args),
        'template': (...args) => this.renderTemplate(...args)
      },
      schema: {
        send: { /* describes the send method for AI */ },
        template: { /* describes the template method for AI */ }
      }
    };
  }
  
  // 4. Your actual business logic
  private async sendEmail(to: string, subject: string, body: string) {
    // Send the email however you want
  }
}
```

That's it. Once you have units, they can teach and learn from each other.

## Getting Started

Install the package:

```bash
npm install @synet/unit
```

Create your first unit:

```typescript
import { Unit } from '@synet/unit';

class MathUnit extends Unit {
  protected constructor(props) { super(props); }
  
  static create() {
    return new MathUnit({
      dna: { id: 'math', version: '1.0.0' }
    });
  }

  build() {

     // Unit methods as capabilities    
     Capabilities.create(
      unitId: this.props.dna.id,
      {
        'add': (a, b) => a + b,
        'multiply': (a, b) => a * b
     });

    // Schema and AI tool 
    Schema.create(
      unitId: this.props.dna.id,
      {
        add: {
          description: 'Add two numbers',
          parameters: { a: 'number', b: 'number' }
        }
      })
    
    // Schema and capabilities are validated on build.     
    const validator = Validator.create({
      unitId: this.props.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }
  
  // Teach any unit your capabilities, schemas and provide own validation logic
  teach(): TeachingContract {
    return {
      unitId: this.props.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
}
// Use it
const math = MathUnit.create();
const calculator = CalculatorUnit.create();

calculator.learn([math.teach()]);
const result = calculator.execute('math.add', 5, 3); // 8
```

## AI Integration

This is where it gets interesting. Every unit automatically works with AI:

```typescript
import { chatWithTools } from '@synet/ai';

// Your units become AI tools automatically
const weather = WeatherUnit.create({ apiKey: 'your-key' });
const email = EmailUnit.create({ apiKey: 'your-key' });

// AI can use them directly
const response = await chatWithTools([
  weather.teach(), 
  email.teach()
], "Check the weather in NYC and email me the forecast");

// The AI will:
// 1. Call weather.getCurrentWeather('NYC')  
// 2. Call email.send('you@email.com', 'Weather Forecast', result)
```

No tool definitions to write, no schema mapping, no integration code. Units handle all of that for you.

## Testing

Testing units is straightforward because they're self-contained:

```typescript
describe('EmailUnit', () => {
  it('should send emails', async () => {
    const email = EmailUnit.create({ apiKey: 'test-key' });
    const result = await email.execute('send', 'test@example.com', 'Subject', 'Body');
    expect(result.success).toBe(true);
  });
  
  it('should teach email capabilities', () => {
    const email = EmailUnit.create({ apiKey: 'test-key' });
    const contract = email.teach();
    
    expect(contract.capabilities).toHaveProperty('send');
    expect(contract.schema.send).toBeDefined();
  });
});
```

Test learning between units:

```typescript
it('should learn and use capabilities', () => {
  const crypto = CryptoUnit.create();
  const email = EmailUnit.create({ apiKey: 'test-key' });
  
  email.learn([crypto.teach()]);
  
  expect(email.can('crypto.sign')).toBe(true);
  expect(email.can('crypto.encrypt')).toBe(true);
});
```

## Events and Observability

Units have built-in event support for monitoring and debugging:

```typescript
const email = EmailUnit.create({ apiKey: 'your-key' });

// Listen to what your units are doing
email.on('email.send', (event) => {
  console.log(`${event.unitId} executed ${event.capability} in ${event.duration}ms`);
});

// get all events 
email.on('*', (event) => {
  console.log(`${event.type} emitted`);
  if(event.error) {
      console.log(`${event.type} error: ${event.error.message}`);
  }  
});


// Use wildcards to all or certain event types, like unit.*, *.error etc.
email.on('email.*', (event) => {
  console.log(`${event.unitId} executed ${event.capability} in ${event.duration}ms`);
});


email.on('error', (event) => {
  console.log(`Error in ${event.unitId}: ${event.error.message}`);
});

// Events are emitted automatically
await email.execute('send', 'user@example.com', 'Hello', 'World');
// → capability.executed event fired
```

You can disable events for performance in high-volume scenarios:

```typescript
const email = EmailUnit.create({ 
  apiKey: 'your-key',
  emitEvents: false  // Skip events for better performance
});
```

## Why this rocks

**You stop writing glue code.** Units figure out how to work together.

**Testing becomes simple.** Test units in isolation, then test the learning contracts.

**AI integration is free.** Every unit works with AI tools automatically.

**Self-documenting**  Just call `unit.help()` and get full documentation and available methods. Always up-to-date, close to the source, changed together.

**Your architecture stays flexible.** Need to change providers? Teach your units new capabilities. The rest of your code doesn't change.

## Common Patterns

Here are some patterns that teams find useful:

```typescript
// Capability composition
const api = ApiUnit.create();
api.learn([
  auth.teach(),        // Authentication
  logger.teach(),      // Logging
  metrics.teach(),     // Monitoring
  cache.teach()        // Caching
]);

// Feature units
const userService = UserServiceUnit.create();
userService.learn([
  database.teach(),    // Data persistence
  email.teach(),       // Notifications
  crypto.teach()       // Password hashing
]);

// AI-powered workflows
const assistant = AssistantUnit.create();
assistant.learn([
  userService.teach(), // User management
  api.teach(),         // External APIs
  scheduler.teach()    // Task scheduling
  cryptoUnit.teach(),    // Encryption  
]);

```

## Getting Help

Every unit documents itself:

```typescript
// Ask any unit what it can do
console.log(myUnit.help());

// Check if it has specific capabilities
if (myUnit.can('crypto.sign')) {
  await myUnit.execute('crypto.sign', data);
}

// See what it's learned
console.log(myUnit.capabilities().list());
```

The documentation is always up-to-date because it's generated from the actual running code.

## Enterprise Adoption

While Unit Architecture started as a developer productivity pattern, many teams are finding it valuable for enterprise-scale applications:

**Benefits for teams :**

- Faster integration between teams (no more "integration meetings")
- Better AI tooling adoption (every component works with AI immediately)
- Easier testing and maintenance (units are self-contained)
- Reduced vendor lock-in (swap implementations by teaching new capabilities)
- Less type-battles. Schemas allow validation.

**Common enterprise patterns:**
```typescript
// Multi-provider support
const storage = StorageUnit.create();
storage.learn([
  awsS3.teach(),     // Primary storage
  azureBlob.teach(), // Backup storage
  gcs.teach()        // Archive storage
]);

// Compliance and audit trails
const processor = ProcessorUnit.create();
processor.learn([
  auditLogger.teach(),    // Track all operations
  encryptionUnit.teach(), // Encrypt sensitive data
  validatorUnit.teach()   // Ensure data quality
]);
```

If you're evaluating Unit Architecture for enterprise use, the [DOCTRINE.md](./DOCTRINE.md) file contains the complete architectural principles and patterns.

---

**Questions? Issues? Ideas?**  
[Technical documentation](./TECHNICAL.md) | 
[GitHub Issues](https://github.com/synthetism/unit/issues) | [Documentation](./DOCTRINE.md) | [Examples](./examples/)
[Email me](anton@synthetism.ai)
