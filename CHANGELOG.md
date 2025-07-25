# Changelog

All notable changes to this project will be documented in this file.

Most patterns are highly stable, no changes will be made to existing methods, only extended, but I will adhere to adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) just in case. You can safely upgrade, but as always, RTFM (read changelog for major releases).

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