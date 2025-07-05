/**
 * Tests for Self-Validating Units
 * 
 * Validates that units can handle their own validation without
 * external Result types while maintaining type safety.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hash, HttpUnit } from '../src/units-born/self-validating-unit';
import type { Unit } from '../src/unit';

describe('Self-Validating Units', () => {
  describe('Hash Unit', () => {
    it('should create successfully with valid algorithm', () => {
      const hash = Hash.create('sha256');
      
      expect(hash.created).toBe(true);
      expect(hash.error).toBeUndefined();
      expect(hash.stack).toBeUndefined();
      expect(hash.whoami()).toBe('Hash v1.0.0');
      expect(hash.capableOf('hash')).toBe(true);
      expect(hash.capableOf('verify')).toBe(true);
      expect(hash.capableOf('unknown')).toBe(false);
    });

    it('should fail creation with invalid algorithm', () => {
      const hash = Hash.create('invalid');
      
      expect(hash.created).toBe(false);
      expect(hash.error).toBe('Unsupported algorithm: invalid');
      expect(hash.stack).toEqual([
        'Unsupported algorithm: invalid',
        'Supported: sha256, sha512, md5, blake2'
      ]);
      expect(hash.capableOf('hash')).toBe(false);
    });

    it('should fail creation with empty algorithm', () => {
      const hash = Hash.create('');
      
      expect(hash.created).toBe(false);
      expect(hash.error).toBe('Algorithm is required');
      expect(hash.stack).toContain('Algorithm is required');
    });

    it('should provide proper explanations', () => {
      const good = Hash.create('sha256');
      const bad = Hash.create('invalid');
      
      expect(good.explain()).toBe('Hash unit successfully created with sha256 algorithm');
      expect(bad.explain()).toBe('Hash unit creation failed: Unsupported algorithm: invalid, Supported: sha256, sha512, md5, blake2');
    });

    it('should work only when created successfully', () => {
      const good = Hash.create('sha256');
      const bad = Hash.create('invalid');
      
      // Good unit should work
      expect(good.hash('test')).toBe('sha256-hash-of-test');
      expect(good.verify('test', 'sha256-hash-of-test')).toBe(true);
      
      // Bad unit should throw
      expect(() => bad.hash('test')).toThrow('Cannot hash: Unsupported algorithm: invalid');
      expect(() => bad.verify('test', 'hash')).toThrow('Cannot verify: Unsupported algorithm: invalid');
    });

    it('should teach capabilities only when created', () => {
      const good = Hash.create('sha256');
      const bad = Hash.create('invalid');
      
      const goodCapabilities = good.teach();
      const badCapabilities = bad.teach();
      
      expect(Object.keys(goodCapabilities)).toEqual(['hash', 'verify']);
      expect(Object.keys(badCapabilities)).toEqual([]);
      
      // Test taught capabilities
      expect(goodCapabilities.hash('test')).toBe('sha256-hash-of-test');
      expect(goodCapabilities.verify('test', 'sha256-hash-of-test')).toBe(true);
    });
  });

  describe('HttpUnit', () => {
    it('should create successfully with valid config', () => {
      const http = HttpUnit.create({
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        headers: { 'User-Agent': 'Test' }
      });
      
      expect(http.created).toBe(true);
      expect(http.error).toBeUndefined();
      expect(http.stack).toBeUndefined();
      expect(http.capableOf('get')).toBe(true);
    });

    it('should create with warnings for suboptimal config', () => {
      const http = HttpUnit.create({
        baseUrl: 'https://api.example.com',
        timeout: 500, // Too low
        headers: {} // Missing User-Agent
      });
      
      expect(http.created).toBe(true);
      expect(http.error).toBeUndefined();
      expect(http.stack).toEqual([
        'Timeout below 1000ms may cause issues',
        'User-Agent header recommended'
      ]);
    });

    it('should fail creation with invalid URL', () => {
      const http = HttpUnit.create({
        baseUrl: 'not-a-url'
      });
      
      expect(http.created).toBe(false);
      expect(http.error).toBe('Base URL must start with http:// or https://');
      expect(http.capableOf('get')).toBe(false);
    });

    it('should fail creation with missing URL', () => {
      const http = HttpUnit.create({});
      
      expect(http.created).toBe(false);
      expect(http.error).toBe('Base URL is required');
    });

    it('should provide proper explanations', () => {
      const good = HttpUnit.create({ 
        baseUrl: 'https://api.example.com',
        headers: { 'User-Agent': 'Test' }
      });
      const withWarnings = HttpUnit.create({
        baseUrl: 'https://api.example.com',
        timeout: 500
      });
      const bad = HttpUnit.create({ baseUrl: 'invalid' });
      
      expect(good.explain()).toBe('HTTP unit created successfully');
      expect(withWarnings.explain()).toBe('HTTP unit created successfully (warnings: Timeout below 1000ms may cause issues, User-Agent header recommended)');
      expect(bad.explain()).toContain('HTTP unit creation failed');
    });

    it('should teach capabilities only when created', () => {
      const good = HttpUnit.create({ baseUrl: 'https://api.example.com' });
      const bad = HttpUnit.create({ baseUrl: 'invalid' });
      
      const goodCapabilities = good.teach();
      const badCapabilities = bad.teach();
      
      expect(Object.keys(goodCapabilities)).toEqual(['get', 'post', 'configure']);
      expect(Object.keys(badCapabilities)).toEqual([]);
      
      // Test taught capabilities
      expect(goodCapabilities.get('/users')).toBe('GET /users from https://api.example.com');
      expect(goodCapabilities.post('/users')).toBe('POST /users to https://api.example.com');
    });
  });

  describe('Unit Composition', () => {
    it('should enable safe composition checking', () => {
      const goodHash = Hash.create('sha256');
      const badHash = Hash.create('invalid');
      const goodHttp = HttpUnit.create({ baseUrl: 'https://api.example.com' });
      const badHttp = HttpUnit.create({ baseUrl: 'invalid' });
      
      // Function to check if composition is safe
      function canCompose(unitA: Unit, unitB: Unit): boolean {
        return unitA.created && unitB.created;
      }
      
      expect(canCompose(goodHash, goodHttp)).toBe(true);
      expect(canCompose(goodHash, badHttp)).toBe(false);
      expect(canCompose(badHash, goodHttp)).toBe(false);
      expect(canCompose(badHash, badHttp)).toBe(false);
    });

    it('should allow type-safe capability sharing', () => {
      const hash = Hash.create('sha256');
      const http = HttpUnit.create({ baseUrl: 'https://api.example.com' });
      
      if (hash.created && http.created) {
        const hashCapabilities = hash.teach();
        const httpCapabilities = http.teach();
        
        // Safe to use capabilities
        expect(hashCapabilities.hash).toBeDefined();
        expect(httpCapabilities.get).toBeDefined();
        
        // Create composite functionality
        const compositeCapabilities = {
          ...hashCapabilities,
          ...httpCapabilities
        };
        
        expect(Object.keys(compositeCapabilities)).toEqual([
          'hash', 'verify', 'get', 'post', 'configure'
        ]);
      }
    });
  });

  describe('Universal Unit Processing', () => {
    it('should handle any unit type uniformly', () => {
      const units: Unit[] = [
        Hash.create('sha256'),
        Hash.create('invalid'),
        HttpUnit.create({ baseUrl: 'https://api.example.com' }),
        HttpUnit.create({ baseUrl: 'invalid' })
      ];
      
      const validUnits = units.filter(unit => unit.created);
      const invalidUnits = units.filter(unit => !unit.created);
      
      expect(validUnits).toHaveLength(2);
      expect(invalidUnits).toHaveLength(2);
      
      // All units should have the same interface
      units.forEach(unit => {
        expect(unit.dna).toBeDefined();
        expect(unit.whoami()).toBeTruthy();
        expect(typeof unit.created).toBe('boolean');
        expect(typeof unit.capableOf).toBe('function');
        expect(typeof unit.help).toBe('function');
        expect(typeof unit.explain).toBe('function');
      });
    });

    it('should provide consistent error information', () => {
      const badHash = Hash.create('invalid');
      const badHttp = HttpUnit.create({ baseUrl: 'invalid' });
      
      // Both should have consistent error structure
      expect(badHash.created).toBe(false);
      expect(badHash.error).toBeTruthy();
      expect(Array.isArray(badHash.stack)).toBe(true);
      expect(badHash.explain()).toBeTruthy();
      
      expect(badHttp.created).toBe(false);
      expect(badHttp.error).toBeTruthy();
      expect(Array.isArray(badHttp.stack)).toBe(true);
      expect(badHttp.explain()).toBeTruthy();
    });
  });

  describe('Zero Dependencies', () => {
    it('should work without external Result types', () => {
      // This test ensures we don't accidentally import Result types
      const hash = Hash.create('sha256');
      
      // Should be able to check validation without Result.isOk() etc.
      expect(hash.created).toBe(true);
      
      // Should be able to get error without Result.error()
      const badHash = Hash.create('invalid');
      expect(badHash.error).toBeTruthy();
      
      // Should be able to safely use without unwrapping
      if (hash.created) {
        expect(hash.hash('test')).toBeTruthy();
      }
      
      if (!badHash.created) {
        expect(badHash.error).toBeTruthy();
      }
    });
  });
});
