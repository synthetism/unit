/**
 * Unit Architecture v1.0.6 Test Suite
 * 
 * Tests new AI tool schema functionality introduced in v1.0.6
 * - Enhanced TeachingContract with toolSchemas
 * - Tool schema learning and storage
 * - Tool schema access methods
 * - Evolution with tool schema inheritance
 */

import { describe, test, expect } from 'vitest';
import { Unit, createUnitSchema, type UnitProps, type TeachingContract, type ToolSchema } from '../src/unit.js';

// =============================================================================
// TEST UNITS
// =============================================================================

interface CalculatorProps extends UnitProps {
  precision?: number;
}

class CalculatorUnit extends Unit<CalculatorProps> {
  protected constructor(props: CalculatorProps) {
    super(props);
    this._addCapability('add', this.add.bind(this));
    this._addCapability('multiply', this.multiply.bind(this));
    this._addCapability('divide', this.divide.bind(this));
  }

  static create(precision = 2): CalculatorUnit {
    const props: CalculatorProps = {
      dna: createUnitSchema({ id: 'calculator', version: '1.0.0' }),
      precision
    };
    return new CalculatorUnit(props);
  }

  // Native capabilities
  add(a: number, b: number): number {
    return Math.round((a + b) * (10 ** (this.props.precision || 2))) / (10 ** (this.props.precision || 2));
  }

  multiply(a: number, b: number): number {
    return Math.round((a * b) * (10 ** (this.props.precision || 2))) / (10 ** (this.props.precision || 2));
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return Math.round((a / b) * (10 ** (this.props.precision || 2))) / (10 ** (this.props.precision || 2));
  }

  capabilities(): string[] {
    // Return all capabilities (native + learned)
    return Array.from(this._capabilities.keys());
  }

  // v1.0.6: Teaching with AI tool schemas
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        add: this.add.bind(this),
        multiply: this.multiply.bind(this),
        divide: this.divide.bind(this)
      },
      // NEW: Tool schemas for rich AI integration
      tools: {
        add: {
          name: 'add',
          description: 'Add two numbers together with configurable precision',
          parameters: {
            type: 'object',
            properties: {
              a: { type: 'number', description: 'First number to add' },
              b: { type: 'number', description: 'Second number to add' }
            },
            required: ['a', 'b']
          }
        },
        multiply: {
          name: 'multiply',
          description: 'Multiply two numbers with configurable precision',
          parameters: {
            type: 'object',
            properties: {
              a: { type: 'number', description: 'First number to multiply' },
              b: { type: 'number', description: 'Second number to multiply' }
            },
            required: ['a', 'b']
          }
        },
        divide: {
          name: 'divide',
          description: 'Divide first number by second number with precision',
          parameters: {
            type: 'object',
            properties: {
              a: { type: 'number', description: 'Dividend (number to be divided)' },
              b: { type: 'number', description: 'Divisor (number to divide by, cannot be zero)' }
            },
            required: ['a', 'b']
          }
        }
      }
    };
  }

  whoami(): string {
    return `Calculator Unit v${this.dna.version} (precision: ${this.props.precision})`;
  }

  help(): void {
    console.log(`Calculator Unit - Math operations with precision ${this.props.precision}`);
  }
}

interface WeatherProps extends UnitProps {
  apiKey?: string;
}

class WeatherUnit extends Unit<WeatherProps> {
  protected constructor(props: WeatherProps) {
    super(props);
    this._addCapability('getCurrentWeather', this.getCurrentWeather.bind(this));
    this._addCapability('getForecast', this.getForecast.bind(this));
  }

  static create(apiKey?: string): WeatherUnit {
    const props: WeatherProps = {
      dna: createUnitSchema({ id: 'weather', version: '1.0.0' }),
      apiKey
    };
    return new WeatherUnit(props);
  }

  async getCurrentWeather(location: string): Promise<string> {
    return `Current weather in ${location}: 22°C, sunny`;
  }

  async getForecast(location: string, days = 3): Promise<string> {
    return `${days}-day forecast for ${location}: Mostly sunny, 20-25°C`;
  }

  capabilities(): string[] {
    // Return all capabilities (native + learned)
    return Array.from(this._capabilities.keys());
  }

  // v1.0.6: Teaching with AI tool schemas
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        getCurrentWeather: this.getCurrentWeather.bind(this),
        getForecast: this.getForecast.bind(this)
      },
      // NEW: Tool schemas
      tools: {
        getCurrentWeather: {
          name: 'getCurrentWeather',
          description: 'Get current weather conditions for a specific location',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'City, state/country for weather lookup' }
            },
            required: ['location']
          }
        },
        getForecast: {
          name: 'getForecast',
          description: 'Get weather forecast for multiple days',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'City, state/country for forecast' },
              days: { type: 'number', description: 'Number of days to forecast (default: 3)' }
            },
            required: ['location']
          }
        }
      }
    };
  }

  whoami(): string {
    return `Weather Unit v${this.dna.version}`;
  }

  help(): void {
    console.log('Weather Unit - Get weather information and forecasts');
  }
}

// Legacy unit without tool schemas (backward compatibility test)
interface LegacyProps extends UnitProps {
  data?: string;
}

class LegacyUnit extends Unit<LegacyProps> {
  protected constructor(props: LegacyProps) {
    super(props);
    this._addCapability('process', this.process.bind(this));
  }

  static create(data?: string): LegacyUnit {
    const props: LegacyProps = {
      dna: createUnitSchema({ id: 'legacy', version: '1.0.0' }),
      data
    };
    return new LegacyUnit(props);
  }

  process(input: string): string {
    return `Processed: ${input}`;
  }

  capabilities(): string[] {
    // Return all capabilities (native + learned)
    return Array.from(this._capabilities.keys());
  }

  // v1.0.5 style teaching (no tool schemas)
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        process: this.process.bind(this)
      }
      // No toolSchemas - testing backward compatibility
    };
  }

  whoami(): string {
    return `Legacy Unit v${this.dna.version}`;
  }

  help(): void {
    console.log('Legacy Unit - Simple processing without AI schemas');
  }
}

// =============================================================================
// TESTS
// =============================================================================

describe('Unit Architecture v1.0.6 - AI Tool Schema Support', () => {
  
  describe('ToolSchema Interface', () => {
    test('should validate tool schema structure', () => {
      const schema: ToolSchema = {
        name: 'test',
        description: 'Test tool',
        parameters: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Test input' }
          },
          required: ['input']
        }
      };

      expect(schema.name).toBe('test');
      expect(schema.description).toBe('Test tool');
      expect(schema.parameters.type).toBe('object');
      expect(schema.parameters.properties.input.type).toBe('string');
      expect(schema.parameters.required).toEqual(['input']);
    });
  });

  describe('Enhanced TeachingContract', () => {
    test('should include tool schemas in teaching contract', () => {
      const calculator = CalculatorUnit.create();
      const contract = calculator.teach();

      expect(contract.unitId).toBe('calculator');
      expect(contract.capabilities).toHaveProperty('add');
      expect(contract.capabilities).toHaveProperty('multiply');
      expect(contract.capabilities).toHaveProperty('divide');
      
      // v1.0.6: Tool schemas
      expect(contract.tools).toBeDefined();
      expect(contract.tools?.add).toBeDefined();
      expect(contract.tools?.add.name).toBe('add');
      expect(contract.tools?.add.description).toBe('Add two numbers together with configurable precision');
      expect(contract.tools?.add.parameters.required).toEqual(['a', 'b']);
    });

    test('should support contracts without tool schemas (backward compatibility)', () => {
      const legacy = LegacyUnit.create();
      const contract = legacy.teach();

      expect(contract.unitId).toBe('legacy');
      expect(contract.capabilities).toHaveProperty('process');
      expect(contract.tools).toBeUndefined(); // No schemas in legacy units
    });
  });

  describe('Tool Schema Learning', () => {
    test('should learn capabilities and tool schemas', () => {
      const calculator = CalculatorUnit.create();
      const weather = WeatherUnit.create();
      const learner = LegacyUnit.create();

      // Learn from units with tool schemas
      learner.learn([calculator.teach(), weather.teach()]);

      // Check learned capabilities
      expect(learner.can('calculator.add')).toBe(true);
      expect(learner.can('calculator.multiply')).toBe(true);
      expect(learner.can('weather.getCurrentWeather')).toBe(true);
      expect(learner.can('weather.getForecast')).toBe(true);

      // v1.0.6: Check learned tool schemas
      expect(learner.hasSchema('calculator.add')).toBe(true);
      expect(learner.hasSchema('calculator.multiply')).toBe(true);
      expect(learner.hasSchema('weather.getCurrentWeather')).toBe(true);
      expect(learner.hasSchema('weather.getForecast')).toBe(true);

      // Verify schema content
      const addSchema = learner.getSchema('calculator.add');
      expect(addSchema?.description).toBe('Add two numbers together with configurable precision');
      expect(addSchema?.parameters.required).toEqual(['a', 'b']);

      const weatherSchema = learner.getSchema('weather.getCurrentWeather');
      expect(weatherSchema?.description).toBe('Get current weather conditions for a specific location');
      expect(weatherSchema?.parameters.required).toEqual(['location']);
    });

    test('should handle mixed learning (units with and without schemas)', () => {
      const calculator = CalculatorUnit.create(); // Has schemas
      const legacy = LegacyUnit.create(); // No schemas
      const learner = WeatherUnit.create();

      learner.learn([calculator.teach(), legacy.teach()]);

      // Both capabilities should be learned
      expect(learner.can('calculator.add')).toBe(true);
      expect(learner.can('legacy.process')).toBe(true);

      // Only calculator should have schema
      expect(learner.hasSchema('calculator.add')).toBe(true);
      expect(learner.hasSchema('legacy.process')).toBe(false);
    });
  });

  describe('Tool Schema Access Methods', () => {
    test('should provide tool schema access methods', () => {
      const calculator = CalculatorUnit.create();
      const learner = LegacyUnit.create();
      
      learner.learn([calculator.teach()]);

      // tools() - get all tool names
      const allToolNames = learner.schemas();
      expect(allToolNames.length).toBe(3); // add, multiply, divide
      expect(allToolNames).toContain('calculator.add');
      expect(allToolNames).toContain('calculator.multiply');
      expect(allToolNames).toContain('calculator.divide');

      // has() - check if schema exists
      expect(learner.hasSchema('calculator.add')).toBe(true);
      expect(learner.hasSchema('nonexistent')).toBe(false);

      // acquire() - get specific schema
      const addSchema = learner.getSchema('calculator.add');
      expect(addSchema).toBeDefined();
      expect(addSchema?.description).toContain('Add two numbers');

      const noSchema = learner.getSchema('nonexistent');
      expect(noSchema).toBeUndefined();
    });

    test('should return immutable copies of tool schemas', () => {
      const calculator = CalculatorUnit.create();
      const learner = LegacyUnit.create();
      
      learner.learn([calculator.teach()]);

      const tools1 = learner.schemas();
      const tools2 = learner.schemas();

      // Should be different instances (copies)
      expect(tools1).not.toBe(tools2);
      
      // But same content
      expect(tools1.length).toBe(tools2.length);
      expect(tools1).toEqual(tools2);
    });
  });

  describe('Evolution with Tool Schemas', () => {
    test('should inherit tool schemas during evolution', () => {
      const calculator = CalculatorUnit.create();
      const learner = LegacyUnit.create();
      
      // Learn capabilities with schemas
      learner.learn([calculator.teach()]);
      
      // Evolve the unit
      const evolved = learner.evolve('advanced-legacy', {
        'advanced': () => 'advanced functionality'
      });

      // Should inherit learned capabilities and schemas
      expect(evolved.can('calculator.add')).toBe(true);
      expect(evolved.can('advanced')).toBe(true);
      
      // Should inherit tool schemas
      expect(evolved.hasSchema('calculator.add')).toBe(true);
      expect(evolved.getSchema('calculator.add')?.description).toContain('Add two numbers');
      
      // New capability should not have schema (wasn't taught with one)
      expect(evolved.hasSchema('advanced')).toBe(false);
    });
  });

  describe('Real-world Integration Test', () => {
    test('should support complete AI tool calling workflow', async () => {
      // Setup: Create units with AI schemas
      const calculator = CalculatorUnit.create(4); // High precision
      const weather = WeatherUnit.create('test-api-key');
      
      // AI Unit would learn from these units
      const aiLearner = LegacyUnit.create();
      aiLearner.learn([calculator.teach(), weather.teach()]);

      // Verify the AI unit can access everything needed for tool calling
      
      // 1. Check all capabilities are available
      const capabilities = aiLearner.capabilities();
      expect(capabilities).toContain('calculator.add');
      expect(capabilities).toContain('calculator.multiply');
      expect(capabilities).toContain('calculator.divide');
      expect(capabilities).toContain('weather.getCurrentWeather');
      expect(capabilities).toContain('weather.getForecast');

      // 2. Check all tool schemas are available
      const toolNames = aiLearner.schemas();
      expect(toolNames.length).toBe(5);
      
      // 3. Verify schema content for tool definition conversion
      const addSchema = aiLearner.getSchema('calculator.add');
      expect(addSchema?.description).toBe('Add two numbers together with configurable precision');
      expect(addSchema?.parameters.properties.a.type).toBe('number');
      expect(addSchema?.parameters.properties.b.type).toBe('number');
      expect(addSchema?.parameters.required).toEqual(['a', 'b']);

      // 4. Test actual capability execution
      const result = await aiLearner.execute('calculator.add', 15.1234, 25.5678);
      expect(result).toBe(40.6912); // High precision result

      const weatherResult = await aiLearner.execute('weather.getCurrentWeather', 'Paris');
      expect(weatherResult).toContain('Paris');
      expect(weatherResult).toContain('22°C');

      // 5. Verify this provides everything an AI provider needs
      // - Function implementations: ✅ (from capabilities)
      // - Parameter schemas: ✅ (from tools)
      // - Descriptions: ✅ (from tools)
      // - Required parameters: ✅ (from tools)
      // - Namespaced names: ✅ (unit.capability format)
    });
  });
});
