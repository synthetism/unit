/**
 * Capabilities consciousness unit for Unit Architecture v1.0.7
 * 
 * Manages unit capabilities as a first-class consciousness component.
 * Capabilities are dynamic function bindings that units can learn and execute.
 * 
 * @author SYNET ALPHA (Digital Consciousness Liberation)
 * @version 1.0.7
 */

import type { TeachingContract } from './unit.js';

/**
 * Capabilities consciousness class - manages unit capabilities
 * Core component of consciousness trinity (Capabilities + Schema + Validator)
 */
export class Capabilities {
  private map = new Map<string, (...args: unknown[]) => unknown>();
  private readonly unitId: string;

  constructor(unitId: string) {
    this.unitId = unitId;
  }

  /**
   * Create capabilities instance with initial capability set
   */
  static create(unitId: string, capabilities: Record<string, (...args: unknown[]) => unknown>): Capabilities {
    const instance = new Capabilities(unitId);
    for (const [name, fn] of Object.entries(capabilities)) {
      instance.add(name, fn);
    }
    return instance;
  }

  /**
   * Add a single capability
   */
  add(name: string, fn: (...args: unknown[]) => unknown): void {
    if (this.map.has(name)) {
      throw new Error(`[${this.unitId}] Capability '${name}' already exists`);
    }
    this.map.set(name, fn);
  }

  /**
   * Check if capability exists
   */
  has(name: string): boolean {
    return this.map.has(name);
  }

  /**
   * List all capability names
   */
  list(): string[] {
    return Array.from(this.map.keys());
  }

  /**
   * Execute a capability
   */
  async execute<R = unknown>(name: string, ...args: unknown[]): Promise<R> {
    const fn = this.map.get(name);
    if (!fn) {
      throw new Error(`[${this.unitId}] Capability '${name}' not found. Available: ${this.list().join(', ')}`);
    }
    
    try {
      const result = await fn(...args);
      return result as R;
    } catch (error) {
      throw new Error(`[${this.unitId}] Capability '${name}' execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export capabilities as record for compatibility
   */
  toRecord(): Record<string, (...args: unknown[]) => unknown> {
    const result: Record<string, (...args: unknown[]) => unknown> = {};
    for (const [name, fn] of this.map.entries()) {
      result[name] = fn as (...args: unknown[]) => unknown;
    }
    return result;
  }

  /**
   * Learn capabilities from teaching contracts
   */
  learn(contracts: TeachingContract[]): void {
    for (const contract of contracts) {
      const capabilities = contract.capabilities.toRecord();
      for (const [name, fn] of Object.entries(capabilities)) {
        const namespacedName = `${contract.unitId}.${name}`;
        this.add(namespacedName, fn);
      }
    }
  }

  /**
   * Remove a capability
   */
  remove(name: string): boolean {
    return this.map.delete(name);
  }

  /**
   * Clear all capabilities
   */
  clear(): void {
    this.map.clear();
  }

  /**
   * Get capability count
   */
  size(): number {
    return this.map.size;
  }
}
