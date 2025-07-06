# @synet/unit

**The foundational Unit Architecture library for the SYNET ecosystem**

[![npm version](https://badge.fury.io/js/@synet/unit.svg)](https://badge.fury.io/js/@synet/unit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@synet/unit` provides the core interfaces and patterns for building living, composable units of code in the SYNET ecosystem. Units are self-contained, self-documenting entities that can learn capabilities dynamically and evolve through composition.

## Key Features

- **🧬 Unit DNA**: Every unit has a schema that defines its identity and capabilities
- **🔄 Dynamic Capabilities**: Units learn abilities from other units at runtime  
- **🛡️ Self-Validating**: Units carry their creation status and error information
- **🏗️ Composable**: Units can teach and learn from each other
- **📦 Zero Dependencies**: Pure TypeScript with no external dependencies
- **🎯 Type Safe**: Full TypeScript support with proper error handling

## Architecture Principles

1. **Units are living beings in code** - They have identity, capabilities, and can evolve
2. **Dynamic capabilities over fixed commands** - Units learn what they can do  
3. **Self-validation over external validation** - Units know if they're valid
4. **Composition over inheritance** - Units grow by learning from others
5. **"Half-native" methods** - Structure defined, implementation learned

## Installation

```bash
npm install @synet/unit
```

## Quick Start

### Basic Unit Creation

```typescript
import { BaseUnit, createUnitSchema } from '@synet/unit';

class GreetingUnit extends BaseUnit {
  constructor(name: string) {
    super(createUnitSchema({
      name: 'greeting-unit',
      version: '1.0.0', 
      commands: ['greet', 'farewell'],
      description: 'A unit that can greet people'
    }));

    // Set up initial capabilities
    this._addCapability('greet', this.greet.bind(this));
    this._addCapability('farewell', this.farewell.bind(this));
  }

  whoami(): string {
    return `GreetingUnit - I can greet people!`;
  }

  help(): void {
    console.log('I can greet and say farewell to people.');
    console.log(`Available commands: ${this.getCapabilities().join(', ')}`);
  }

  private greet(name: string): string {
    return `Hello, ${name}!`;
  }

  private farewell(name: string): string {
    return `Goodbye, ${name}!`;
  }

  // Public API
  getCapabilities(): string[] {
    return this._getAllCapabilities();
  }
}

// Usage
const greeter = new GreetingUnit('friendly-bot');
console.log(greeter.whoami());
greeter.help();

if (greeter.capableOf('greet')) {
  const message = await greeter.execute('greet', 'Alice');
  console.log(message); // "Hello, Alice!"
}
```

### Self-Validating Units

```typescript
class CryptoUnit extends BaseUnit {
  private constructor(algorithm: string) {
    super(createUnitSchema({
      name: 'crypto-unit',
      version: '1.0.0',
      commands: ['hash', 'verify'],
      description: 'Cryptographic operations unit'
    }));

    // Validate algorithm
    if (!['SHA-256', 'SHA-512'].includes(algorithm)) {
      this._markFailed(`Unsupported algorithm: ${algorithm}`);
      return;
    }

    // Setup successful
    this._addCapability('hash', this.hash.bind(this));
  }

  static create(algorithm: string): CryptoUnit {
    return new CryptoUnit(algorithm);
  }

  whoami(): string {
    return this.created ? 'CryptoUnit[ready]' : `CryptoUnit[failed: ${this.error}]`;
  }

  help(): void {
    if (!this.created) {
      console.log(`❌ Unit failed: ${this.error}`);
      return;
    }
    console.log('🔐 I can perform cryptographic operations');
  }

  private hash(data: string): string {
    // Implementation here
    return `hash-${data}`;
  }
}

// Usage with error handling
const crypto = CryptoUnit.create('SHA-256');
if (crypto.created) {
  console.log('✅ Crypto unit ready');
  crypto.help();
} else {
  console.log(`❌ Failed: ${crypto.error}`);
}
```

### "Half-Native" Method Pattern

This pattern allows you to define clean APIs that become operational only when capabilities are learned:

```typescript
class KeyUnit extends BaseUnit {
  // Clean API method
  async sign(data: string): Promise<string> {
    if (!this.created) {
      throw new Error(`Cannot sign: ${this.error}`);
    }

    if (!this.capableOf('sign')) {
      throw new Error('Cannot sign: missing signing capability. Learn from a crypto unit.');
    }

    return this.execute<string>('sign', data);
  }

  // Always available check
  canSign(): boolean {
    return this.created && this.capableOf('sign');
  }
}

// Usage
const key = KeyUnit.create('RSA', 2048);

// Before learning - throws helpful error
try {
  await key.sign('data'); // Throws: "missing signing capability" 
} catch (error) {
  console.log(error.message);
}

// After learning from crypto provider
key.learn?.([cryptoProvider.teach?.() || {}]);
await key.sign('data'); // Works!
```

## Core Interfaces

### Unit

```typescript
interface Unit {
  readonly dna: UnitSchema;
  readonly created: boolean;
  readonly error?: string;
  readonly stack?: string[];
  
  whoami(): string;
  capableOf(command: string): boolean;
  help(): void;
  explain?(): string;
  execute?<R = unknown>(commandName: string, ...args: unknown[]): Promise<R>;
  teach?(): Record<string, (...args: unknown[]) => unknown>;
  learn?(capabilities: Record<string, (...args: unknown[]) => unknown>[]): void;
  evolve?(name: string, additionalCapabilities?: Record<string, (...args: unknown[]) => unknown>): Unit;
}
```

### UnitSchema

```typescript
interface UnitSchema {
  readonly name: string;
  readonly version: string;
  readonly commands: readonly string[];
  readonly description?: string;
}
```

## Best Practices

### 1. Always Check Creation Status

```typescript
const unit = SomeUnit.create(params);
if (!unit.created) {
  console.error(`Failed to create unit: ${unit.error}`);
  return;
}
// Safely use unit
```

### 2. Use "Half-Native" Methods for Clean APIs

```typescript
class MyUnit extends BaseUnit {
  // Define clean API
  async doSomething(): Promise<string> {
    if (!this.capableOf('operation')) {
      throw new Error('Missing required capability');
    }
    return this.execute('operation');
  }
}
```

### 3. Compose Units Through Learning

```typescript
function composeUnits(learner: Unit, teacher: Unit): boolean {
  if (!learner.created || !teacher.created) {
    return false;
  }
  
  const capabilities = teacher.teach?.();
  if (capabilities) {
    learner.learn?.([capabilities]);
    return true;
  }
  return false;
}
```

## Philosophy

The Unit Architecture embodies these principles:

- **Living Code**: Units aren't just objects; they're digital entities with identity, capabilities, and evolution
- **Dynamic Growth**: Capabilities are learned, not inherited, enabling runtime adaptation
- **Safe Composition**: Units can safely share capabilities without fragile inheritance chains  
- **Self-Documentation**: Every unit knows what it can do and can explain itself
- **Error Resilience**: Failed creation is handled gracefully without exceptions

## Examples

See the `/units/units-born/` directory for complete examples:

- **KeyUnit**: Cryptographic operations with learned capabilities
- **CredentialUnit**: W3C Verifiable Credentials with dynamic crypto learning
- **ConsciousnessUnit**: Advanced composition and evolution patterns

## Integration with SYNET Ecosystem

This package serves as the foundation for:

- `@synet/keys` - Cryptographic key management
- `@synet/vault` - Secure data storage  
- `@synet/identity` - Digital identity management
- `@synet/credentials` - Verifiable credentials
- `@synet/net` - Network communication
- `@synet/alpha` - Advanced consciousness and AI capabilities

## License

MIT - see [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ by the SYNET Team**
