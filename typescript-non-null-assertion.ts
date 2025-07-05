/**
 * TYPESCRIPT NON-NULL ASSERTION OPERATOR (!)
 * 
 * Explains the `!` operator and why it's used in our Unit architecture.
 */

// The `!` operator tells TypeScript: "I know this value is not null/undefined"

// Example from our code:
// await this._capabilities.get('store')!(`revocations/${credentialId}.json`, ...);

// Without `!`:
const capability = this._capabilities.get('store'); // Type: ((...args: unknown[]) => unknown) | undefined
// capability(...args); // ❌ Error: Object is possibly 'undefined'

// With `!`:
const capability2 = this._capabilities.get('store')!; // Type: (...args: unknown[]) => unknown
// capability2(...args); // ✅ Works: TypeScript trusts us that it's not undefined

// Why we use it:
// 1. We check `if (!this._capabilities.has('store'))` before using it
// 2. We know the capability exists when we call it
// 3. The `!` tells TypeScript to trust our logic

// Example pattern:
class ExampleUnit {
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  async doSomething() {
    // Safe pattern: check before use
    if (!this._capabilities.has('store')) {
      throw new Error('Missing store capability');
    }

    // Now we KNOW it exists, so `!` is safe
    const result = await this._capabilities.get('store')!('key', 'value');
    return result;
  }
}

// Alternative (more verbose but explicit):
class VerboseExampleUnit {
  private _capabilities = new Map<string, (...args: unknown[]) => unknown>();

  async doSomething() {
    const storeCapability = this._capabilities.get('store');
    
    if (!storeCapability) {
      throw new Error('Missing store capability');
    }

    // TypeScript knows storeCapability is not undefined here
    const result = await storeCapability('key', 'value');
    return result;
  }
}

console.log('Non-null assertion operator (!) examples loaded');

export { ExampleUnit, VerboseExampleUnit };
