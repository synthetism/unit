/**
 * Unit Architecture Tests
 * 
 * Tests for the minimal Unit interface and Key unit implementation
 */

import { describe, it, expect } from 'vitest';
import { Key } from '../src/units-born/key-minimal';

describe('Minimal Unit Architecture', () => {
  describe('Key Unit', () => {
    it('should create a key unit with proper DNA', async () => {
      const key = await Key.generate();
      
      expect(key.dna.name).toBe('Key');
      expect(key.dna.version).toBe('1.0.0');
      expect(key.dna.commands).toContain('sign');
      expect(key.dna.commands).toContain('verify');
      expect(key.dna.commands).toContain('canSign');
    });

    it('should check capabilities correctly', async () => {
      const key = await Key.generate();
      
      expect(key.capableOf('sign')).toBe(true);
      expect(key.capableOf('verify')).toBe(true);
      expect(key.capableOf('invalidCommand')).toBe(false);
    });

    it('should return proper whoami string', async () => {
      const key = await Key.generate();
      
      const identity = key.whoami();
      expect(identity).toBe('Key v1.0.0');
    });

    it('should execute commands successfully', async () => {
      const key = await Key.generate();
      
      // Test canSign command (sync internally)
      const canSign = await key.execute('canSign');
      expect(canSign).toBe(true);
      
      // Test sign command (async internally)
      const signature = await key.execute('sign', 'hello world');
      expect(typeof signature).toBe('string');
      
      // Test verify command (async internally)
      const isValid = await key.execute('verify', 'hello world', signature);
      expect(isValid).toBe(true);
    });

    it('should handle sync commands with Promise.resolve pattern', async () => {
      const key = await Key.generate();
      
      // These are internally sync but return Promise
      const results = await Promise.all([
        key.execute('canSign'),
        key.execute('getPublicKey'),
        key.execute('toJSON'),
      ]);
      
      expect(results[0]).toBe(true);
      expect(typeof results[1]).toBe('string');
      expect(typeof results[2]).toBe('object');
    });

    it('should handle invalid commands gracefully', async () => {
      const key = await Key.generate();
      
      await expect(key.execute('invalidCommand')).rejects.toThrow(
        'Unit \'Key\' cannot execute \'invalidCommand\''
      );
    });

    it('should provide flexible help system', async () => {
      const key = await Key.generate();
      
      // help() should not throw and should be flexible
      expect(() => key.help()).not.toThrow();
    });

    it('should handle complete signing workflow', async () => {
      const key = await Key.generate();
      
      // Check if key can sign
      const canSign = await key.execute('canSign');
      expect(canSign).toBe(true);
      
      // Sign some data
      const data = 'test message';
      const signature = await key.execute('sign', data);
      expect(typeof signature).toBe('string');
      
      // Verify the signature
      const isValid = await key.execute('verify', data, signature);
      expect(isValid).toBe(true);
      
      // Verify with wrong data should fail
      const wrongIsValid = await key.execute('verify', 'wrong data', signature);
      expect(wrongIsValid).toBe(false);
    });

    it('should export to JSON without private key', async () => {
      const key = await Key.generate();
      
      const json = await key.execute('toJSON') as Record<string, unknown>;
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('publicKeyHex');
      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('canSign');
      expect(json).not.toHaveProperty('privateKeyHex');
    });
  });

  describe('Unit Interface Benefits', () => {
    it('should demonstrate uniform async interface', async () => {
      const key = await Key.generate();
      
      // All operations go through the same execute interface
      // Mix of sync and async operations - all handled uniformly
      const results = await Promise.all([
        key.execute('canSign'),      // Sync internally
        key.execute('getPublicKey'), // Sync internally
        key.execute('sign', 'test'), // Async internally
        key.execute('toJSON'),       // Sync internally
      ]);
      
      expect(results).toHaveLength(4);
      for (const result of results) {
        expect(result).toBeDefined();
      }
    });

    it('should be discoverable and self-documenting', async () => {
      const key = await Key.generate();
      
      // Units are self-documenting
      expect(key.dna.description).toBeDefined();
      expect(key.dna.commands).toBeDefined();
      
      // Units are discoverable
      expect(key.dna.commands.length).toBeGreaterThan(0);
      
      // Units provide identity
      expect(key.whoami()).toBeDefined();
    });
  });
});
