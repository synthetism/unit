# Changelog

## [1.0.8] - 2024-08-11

### Added

- added `description?: string;` to UnitSchema
- extended `ToolSchema`, added   `items?: { type: string; description?: string };` and    `enum?: string[];` for better response structure

## [1.0.7] - 2024-08-07

### Added
- **Consciousness Trinity Pattern**: All units now implement `build()` method creating three living instances:
  - `Capabilities` - Runtime function bindings and execution
  - `Schema` - JSON schema definitions for AI integration  
  - `Validator` - Parameter validation and capability verification

### Changed
- **Enhanced Teaching Contracts**: Now expose living consciousness instances instead of static bindings
- **Method Signatures**: Units access trinity through `capabilities()`, `schema()`, `validator()` methods
- **Validation Layer**: Improved parameter checking and capability verification

### Migration
- See `./docs/UNIT-1.0.7-MIGRATION.md` for complete upgrade guide
- All units must implement `build()` method returning consciousness trinity
- Teaching contracts now expose living instances, not static objects

## [1.0.6] - 28-07-25

### AI-First Unit Architecture 🤖

### New Features

**Tool Schema System**: Units can now provide structured tool schemas for AI provider integration, enabling sophisticated AI-driven capability learning and execution.

```typescript
interface ToolSchema {
  name: string;
  description: string;
  parameters: { /* JSON Schema */ };
}

interface TeachingContract {
  unitId: string;
  capabilities: Record<string, Function>;
  tools?: Record<string, ToolSchema>;  // NEW: Optional AI tool schemas
}
```

**Schema Access Methods**: New methods for managing and accessing tool schemas:
- `schemas(): string[]` - Get all available schema names
- `hasSchema(tool: string): boolean` - Check if schema exists
- `getSchema(tool: string): ToolSchema | undefined` - Get specific schema

**Enhanced Learning**: Learn method now supports tool schema validation and storage with proper namespacing.

**Evolution Compatibility**: Tool schemas are preserved during unit evolution, maintaining AI integration capabilities across generations.

### AI Integration Example

```typescript
import { AI } from '@synet/ai';
import { WeatherUnit } from '@synet/weather';

const ai = AI.openai({ apiKey: 'sk-...' });
const weather = WeatherUnit.create({ apiKey: 'weather-key' });

// AI learns weather capabilities with full schema support
ai.learn([weather.teach()]);

// AI uses learned tool schemas for intelligent responses
const response = await ai.call('Weather report for Tokyo and Paris', {
  useTools: true
});
```

### Backward Compatibility

- Units without tool schemas continue to work normally
- Existing unit-to-unit learning unchanged
- No breaking changes to core Unit Architecture principles

# [1.0.4] - 07-11-25

## Changes

### Teaching contract

New teaching/learning pattern, that makes possible namespaced capabilities.

```typescript
export interface TeachingContract {
  /** ID of the unit providing these capabilities */
  unitId: string;
  /** Map of capability name to implementation */
  capabilities: Record<string, (...args: unknown[]) => unknown>;
}
```

Now acquired capabilities are namespaced `key.execute('signer.sign')` :


```typescript
  learn(contracts: TeachingContract[]): void {
    for (const contract of contracts) {
      for (const [cap, impl] of Object.entries(contract.capabilities)) {
        // Create namespaced capability key: "unit-id.capability-name"
        const capabilityKey = `${contract.unitId}.${cap}`;

        // Store the implementation with namespace
        this._capabilities.set(capabilityKey, impl);
      }
    }
  }
```
 
- Abstract errors are dropped in favor of native Throw in simple units, or Result<T> in complex.
- Units must have id, that validates.
  
```typescript
  if (!id || id.trim() === "") throw new Error("Unit ID cannot be empty");
  if (id !== id.toLowerCase()) throw new Error("Unit ID must be lowercase");
  if (!/^[a-z][a-z0-9\-]*$/.test(id))
    throw new Error(
      "Unit ID must be alphanumeric + hyphens, starting with letter",
    );
  if (id.includes("."))
    throw new Error(
      "Unit ID cannot contain dots (breaks capability resolution)",
    );
```

### Removed (Breaking Changes)
- **Deprecated Error Handling Methods**: Removed `_markFailed()` and `fail()` methods
- **Deprecated Properties**: Removed `error` and `stack` properties from Unit interface and implementation
- **Inconsistent State**: Cleaned up internal `_error` and `_stack` properties

### Migration Guide
If you were using the deprecated methods (unlikely), migrate to:
- **Simple operations**: Use `throw new Error(message)` 
- **Complex operations**: Use `Result<T>` pattern from `@synet/patterns` or similar packages