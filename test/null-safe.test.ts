/**
 * Tests for Null-Safe Unit Creation Pattern
 * 
 * Validates that units return null for failed creation,
 * forcing proper error handling and type safety.
 */

import { describe, it, expect } from 'vitest';
import { Unit, createUnitSchema, ValueObject } from '../src/unit';

// Test unit implementation
interface TestProps {
  value: string;
}

class TestUnit extends ValueObject<TestProps> implements Unit {
  readonly dna = createUnitSchema({
    name: 'TestUnit',
    version: '1.0.0',
    commands: ['test'],
    description: 'Test unit for null-safe pattern'
  });

  constructor(props: TestProps) {
    super(props);
  }

  static create(value: string): TestUnit | null {
    if (!value) {
      return null; // Invalid input
    }
    if (value === 'invalid') {
      return null; // Validation fails
    }
    return new TestUnit({ value });
  }

  whoami(): string {
    return `${this.dna.name} v${this.dna.version}`;
  }

  capableOf(command: string): boolean {
    return this.dna.commands.includes(command);
  }

  help(): void {
    console.log(`Test unit with value: ${this.getProps().value}`);
  }

  explain(): string {
    return `Test unit created successfully with value: ${this.getProps().value}`;
  }

  getValue(): string {
    return this.getProps().value;
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      getValue: () => this.getValue(),
      test: () => `tested-${this.getValue()}`
    };
  }
}

describe('Null-Safe Unit Creation Pattern', () => {
  describe('Successful Creation', () => {
    it('should create valid unit with valid input', () => {
      const unit = TestUnit.create('valid-value');
      
      expect(unit).not.toBeNull();
      expect(unit!.whoami()).toBe('TestUnit v1.0.0');
      expect(unit!.capableOf('test')).toBe(true);
      expect(unit!.getValue()).toBe('valid-value');
    });

    it('should have all expected properties and methods', () => {
      const unit = TestUnit.create('test');
      
      expect(unit).not.toBeNull();
      expect(unit!.dna).toBeDefined();
      expect(unit!.dna.name).toBe('TestUnit');
      expect(unit!.dna.version).toBe('1.0.0');
      expect(unit!.dna.commands).toEqual(['test']);
      expect(typeof unit!.whoami).toBe('function');
      expect(typeof unit!.capableOf).toBe('function');
      expect(typeof unit!.help).toBe('function');
      expect(typeof unit!.explain).toBe('function');
      expect(typeof unit!.teach).toBe('function');
    });

    it('should provide working capabilities', () => {
      const unit = TestUnit.create('test-value');
      
      expect(unit).not.toBeNull();
      
      const capabilities = unit!.teach();
      expect(Object.keys(capabilities)).toEqual(['getValue', 'test']);
      expect(capabilities.getValue()).toBe('test-value');
      expect(capabilities.test()).toBe('tested-test-value');
    });
  });

  describe('Failed Creation', () => {
    it('should return null for empty input', () => {
      const unit = TestUnit.create('');
      
      expect(unit).toBeNull();
    });

    it('should return null for invalid input', () => {
      const unit = TestUnit.create('invalid');
      
      expect(unit).toBeNull();
    });

    it('should handle null gracefully in conditional checks', () => {
      const unit = TestUnit.create('invalid');
      
      if (unit) {
        // This should not execute
        expect.fail('Unit should be null');
      } else {
        expect(unit).toBeNull();
      }
    });
  });

  describe('Type Safety', () => {
    it('should enforce null checking with TypeScript', () => {
      const unit = TestUnit.create('test');
      
      // TypeScript should require null checking
      if (unit) {
        // Safe to use unit here
        expect(unit.getValue()).toBe('test');
        expect(unit.capableOf('test')).toBe(true);
      } else {
        expect.fail('Unit should not be null');
      }
    });

    it('should work with type guards', () => {
      function isValidUnit(unit: TestUnit | null): unit is TestUnit {
        return unit !== null;
      }

      const goodUnit = TestUnit.create('good');
      const badUnit = TestUnit.create('invalid');

      expect(isValidUnit(goodUnit)).toBe(true);
      expect(isValidUnit(badUnit)).toBe(false);

      if (isValidUnit(goodUnit)) {
        expect(goodUnit.getValue()).toBe('good');
      }
    });

    it('should work with array filtering', () => {
      const potentialUnits = [
        TestUnit.create('valid1'),
        TestUnit.create('invalid'),
        TestUnit.create('valid2'),
        TestUnit.create('')
      ];

      const validUnits = potentialUnits.filter((unit): unit is TestUnit => unit !== null);

      expect(validUnits).toHaveLength(2);
      expect(validUnits[0].getValue()).toBe('valid1');
      expect(validUnits[1].getValue()).toBe('valid2');
    });
  });

  describe('Composition Safety', () => {
    it('should enable safe composition patterns', () => {
      const unit1 = TestUnit.create('first');
      const unit2 = TestUnit.create('second');

      function composeUnits(a: TestUnit | null, b: TestUnit | null): string | null {
        if (!a || !b) {
          return null;
        }
        return `${a.getValue()}-${b.getValue()}`;
      }

      const result = composeUnits(unit1, unit2);
      expect(result).toBe('first-second');

      const failedResult = composeUnits(unit1, TestUnit.create('invalid'));
      expect(failedResult).toBeNull();
    });

    it('should prevent unsafe operations', () => {
      const validUnit = TestUnit.create('valid');
      const invalidUnit = TestUnit.create('invalid');

      function useUnit(unit: TestUnit | null): string {
        if (!unit) {
          return 'No unit available';
        }
        
        // Safe to use unit here
        return unit.getValue();
      }

      expect(useUnit(validUnit)).toBe('valid');
      expect(useUnit(invalidUnit)).toBe('No unit available');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors at creation time', () => {
      // Mock console.error to capture error messages
      const originalError = console.error;
      const errorMessages: string[] = [];
      console.error = (message: string) => {
        errorMessages.push(message);
      };

      class ErrorUnit extends ValueObject<{ value: string }> implements Unit {
        readonly dna = createUnitSchema({
          name: 'ErrorUnit',
          version: '1.0.0',
          commands: ['error'],
          description: 'Error handling unit'
        });

        constructor(props: { value: string }) {
          super(props);
        }

        static create(value: string): ErrorUnit | null {
          if (!value) {
            console.error('ErrorUnit creation failed: Value is required');
            return null;
          }
          return new ErrorUnit({ value });
        }

        whoami(): string {
          return `${this.dna.name} v${this.dna.version}`;
        }

        capableOf(command: string): boolean {
          return this.dna.commands.includes(command);
        }

        help(): void {
          console.log(`Error unit with value: ${this.getProps().value}`);
        }
      }

      const unit = ErrorUnit.create('');
      expect(unit).toBeNull();
      expect(errorMessages).toContain('ErrorUnit creation failed: Value is required');

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('Interface Compliance', () => {
    it('should implement Unit interface correctly', () => {
      const unit = TestUnit.create('test');
      
      expect(unit).not.toBeNull();
      
      // Check all required Unit interface properties/methods
      expect(unit!.dna).toBeDefined();
      expect(typeof unit!.whoami).toBe('function');
      expect(typeof unit!.capableOf).toBe('function');
      expect(typeof unit!.help).toBe('function');
      
      // Check optional methods
      expect(typeof unit!.explain).toBe('function');
      expect(typeof unit!.teach).toBe('function');
    });

    it('should work with generic Unit type', () => {
      function processUnit(unit: Unit | null): string {
        if (!unit) {
          return 'No unit';
        }
        return unit.whoami();
      }

      const unit = TestUnit.create('test');
      expect(processUnit(unit)).toBe('TestUnit v1.0.0');
      expect(processUnit(null)).toBe('No unit');
    });
  });
});
