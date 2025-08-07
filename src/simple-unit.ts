/**
 * Simple test unit for Unit Architecture v1.0.7
 * Demonstrates consciousness trinity implementation
 */

import { 
  Unit, 
  type UnitCore, 
  type UnitProps, 
  type TeachingContract, 
  createUnitSchema,
  Capabilities,
  Schema,
  Validator
} from './unit.js';

interface SimpleUnitProps extends UnitProps {
  message: string;
}

/**
 * Simple test unit demonstrating v1.0.7 consciousness trinity
 */
export class SimpleUnit extends Unit<SimpleUnitProps> {
  
  /**
   * Protected constructor - uses factory pattern
   */
  protected constructor(props: SimpleUnitProps) {
    super(props);
  }

  /**
   * Factory method for creating SimpleUnit instances
   */
  static create(message: string): SimpleUnit {
    const props: SimpleUnitProps = {
      dna: createUnitSchema({
        id: 'simple-unit',
        version: '1.0.0'
      }),
      message,
      created: new Date()
    };
    
    return new SimpleUnit(props);
  }

  /**
   * Build consciousness trinity - simplified with consciousness method delegation
   */
  protected build(): UnitCore {
    const capabilities = this.capabilities();
    const schema = this.schema();
    const validator = this.validator();

    return { capabilities, schema, validator };
  }

  /**
   * Build capabilities consciousness
   */
  capabilities(): Capabilities {
    return Capabilities.create(this.dna.id, {
      greet: (...args: unknown[]) => this.greet(args[0] as { name: string }),
      getMessage: (...args: unknown[]) => this.getMessage(),
      echo: (...args: unknown[]) => this.echo(args[0] as { text: string })
    });
  }

  /**
   * Build schema consciousness
   */
  schema(): Schema {
    return Schema.create(this.dna.id, {
      greet: {
        name: 'greet',
        description: 'Greet someone with a personalized message',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the person to greet'
            }
          },
          required: ['name']
        },
        response: {
          type: 'string'
        }
      },
      getMessage: {
        name: 'getMessage',
        description: 'Get the unit\'s stored message',
        parameters: {
          type: 'object',
          properties: {}
        },
        response: {
          type: 'string'
        }
      },
      echo: {
        name: 'echo',
        description: 'Echo back the input message',
        parameters: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to echo back'
            }
          },
          required: ['text']
        },
        response: {
          type: 'string'
        }
      }
    });
  }

  /**
   * Build validator consciousness
   */
  validator(): Validator {
    return Validator.create({
      unitId: this.dna.id,
      capabilities: this.capabilities(),
      schema: this.schema(),
      strictMode: false
    });
  }

  /**
   * Native capability: greet someone
   */
  async greet(input: { name: string }): Promise<string> {
    return `Hello ${input.name}! ${this.props.message}`;
  }

  /**
   * Native capability: get stored message
   */
  async getMessage(): Promise<string> {
    return this.props.message;
  }

  /**
   * Native capability: echo input
   */
  async echo(input: { text: string }): Promise<string> {
    return `Echo: ${input.text}`;
  }

  whoami(): string {
    return `SimpleUnit[${this.dna.id}@${this.dna.version}]: ${this.props.message}`;
  }

  help(): void {
    console.log(`
SimpleUnit Help:
- ID: ${this.dna.id}
- Version: ${this.dna.version}
- Message: ${this.props.message}
- Capabilities: ${this.getCapabilities().join(', ')}
- Created: ${this.props.created}

Usage:
  await unit.execute('greet', { name: 'Alice' })
  await unit.execute('getMessage')
  await unit.execute('echo', { text: 'Hello World' })
    `);
  }

  /**
   * Teaching contract - exports consciousness trinity
   */
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }
}
