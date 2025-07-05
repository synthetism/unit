/**
 * Unit Architecture: Framework vs Architecture Approach
 * 
 * Showing both patterns - let developers choose their path
 */

import { Unit, createUnitSchema, ValueObject } from './src/unit.js';

/**
 * Option A: Pure Null-Safe (Architecture Approach)
 * Clean, simple, opinionated - units that exist always work
 */
interface PureUnitProps {
  value: string;
}

class PureUnit extends ValueObject<PureUnitProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'PureUnit',
    version: '1.0.0',
    commands: ['process'],
    description: 'Pure null-safe unit'
  });

  constructor(props: PureUnitProps) {
    super(props);
  }

  static create(value: string): PureUnit | null {
    if (!value || value === 'invalid') {
      console.error('PureUnit creation failed');
      return null;
    }
    return new PureUnit({ value });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`✨ ${this.whoami()} - Always valid, always works`);
  }

  explain(): string {
    return `Pure unit with value: ${this.getProps().value}`;
  }

  process(): string {
    return `processed-${this.getProps().value}`;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      process: () => this.process(),
      getValue: () => this.getProps().value
    };
  }
}

/**
 * Option B: Flexible Self-Validating (Framework Approach)
 * More flexible, gives developers choice - can track creation state
 */
interface FlexibleUnitProps {
  value: string;
  created: boolean;
  error?: string;
  stack?: string[];
  warnings?: string[];
}

class FlexibleUnit extends ValueObject<FlexibleUnitProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'FlexibleUnit',
    version: '1.0.0',
    commands: ['process'],
    description: 'Flexible self-validating unit'
  });

  constructor(props: FlexibleUnitProps) {
    super(props);
  }

  // Can return either null OR invalid unit - developer's choice
  static create(value: string, options: { 
    returnInvalid?: boolean 
  } = {}): FlexibleUnit | null {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!value) {
      errors.push('Value is required');
    }
    if (value === 'invalid') {
      errors.push('Value cannot be "invalid"');
    }
    if (value.length < 3) {
      warnings.push('Value is very short');
    }

    // Option 1: Return null (pure approach)
    if (errors.length > 0 && !options.returnInvalid) {
      console.error(`FlexibleUnit creation failed: ${errors.join(', ')}`);
      return null;
    }

    // Option 2: Return invalid unit (flexible approach)
    if (errors.length > 0) {
      return new FlexibleUnit({
        value: value || '',
        created: false,
        error: errors[0],
        stack: [...errors, ...warnings]
      });
    }

    // Return valid unit
    return new FlexibleUnit({
      value,
      created: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      stack: warnings
    });
  }

  // Expose validation state (optional, for flexibility)
  get created(): boolean { return this.getProps().created; }
  get error(): string | undefined { return this.getProps().error; }
  get stack(): string[] | undefined { return this.getProps().stack; }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.created && this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`🔧 ${this.whoami()} - Flexible validation`);
    if (!this.created) {
      console.log(`❌ Invalid: ${this.error}`);
    } else {
      console.log(`✅ Valid with value: ${this.getProps().value}`);
      if (this.stack && this.stack.length > 0) {
        console.log(`⚠️  Warnings: ${this.stack.join(', ')}`);
      }
    }
  }

  explain(): string {
    if (this.created) {
      return `Flexible unit created successfully with value: ${this.getProps().value}`;
    }
    return `Flexible unit creation failed: ${this.error}`;
  }

  process(): string {
    if (!this.created) {
      throw new Error(`Cannot process: ${this.error}`);
    }
    return `processed-${this.getProps().value}`;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    if (!this.created) {
      return {}; // No capabilities if invalid
    }
    
    return {
      process: () => this.process(),
      getValue: () => this.getProps().value
    };
  }
}

/**
 * Demo showing both approaches
 */
async function demonstrateArchitectureVsFramework() {
  console.log('🏗️  Architecture vs Framework: Choose Your Path\n');

  // Pure Null-Safe Approach (Architecture)
  console.log('✨ Pure Null-Safe Approach (Architecture):');
  console.log('• Simple, opinionated, clean');
  console.log('• Units that exist always work');
  console.log('• TypeScript enforces safety');
  console.log('• No validation properties needed\n');

  const goodPure = PureUnit.create('valid-value');
  const badPure = PureUnit.create('invalid');

  if (goodPure) {
    goodPure.help();
    console.log(`Process result: ${goodPure.process()}`);
  }

  if (badPure) {
    console.log('This should not print');
  } else {
    console.log('❌ Pure unit creation failed (returned null)');
  }

  console.log('\n🔧 Flexible Self-Validating Approach (Framework):');
  console.log('• More flexible, gives developers choice');
  console.log('• Can return null OR invalid units');
  console.log('• Optional validation properties');
  console.log('• Backwards compatible\n');

  // Flexible approach - return null
  const goodFlexible = FlexibleUnit.create('valid-value');
  const badFlexibleNull = FlexibleUnit.create('invalid');

  if (goodFlexible) {
    goodFlexible.help();
    console.log(`Process result: ${goodFlexible.process()}`);
  }

  if (badFlexibleNull) {
    console.log('This should not print');
  } else {
    console.log('❌ Flexible unit creation failed (returned null)');
  }

  // Flexible approach - return invalid unit
  const badFlexibleInvalid = FlexibleUnit.create('invalid', { returnInvalid: true });
  if (badFlexibleInvalid) {
    badFlexibleInvalid.help();
    console.log(`Created: ${badFlexibleInvalid.created}`);
    console.log(`Error: ${badFlexibleInvalid.error}`);
  }

  console.log('\n🎨 The Art of Choice:');
  console.log('• Pure approach: "Units that exist always work"');
  console.log('• Flexible approach: "Developers choose their validation style"');
  console.log('• Both approaches are valid and beautiful');
  console.log('• Architecture provides structure, not constraints');
  console.log('• The simpler the better - but choice is power');

  console.log('\n✨ Your Insight is Correct:');
  console.log('• Architecture > Framework');
  console.log('• Structure and lore > Rigid rules');
  console.log('• Open all options > Force one way');
  console.log('• Let developers compose their own symphony 🎭');
}

// Run the demo
demonstrateArchitectureVsFramework().catch(console.error);
