/**
 * Self-Validating Units Demo
 * 
 * Shows how units handle validation without Result dependency
 * and enable safe composition through created/error checking.
 */

import { Hash, HttpUnit } from './src/units-born/self-validating-unit';
import type { Unit } from './src/unit';

async function demoSelfValidatingUnits() {
  console.log('🛡️ Self-Validating Units Demo\\n');

  // Successful creation
  console.log('✅ Successful Unit Creation:');
  const goodHash = Hash.create('sha256');
  console.log(`Hash created: ${goodHash.created}`);
  console.log(`Can hash: ${goodHash.capableOf('hash')}`);
  goodHash.help();
  console.log(`Explanation: ${goodHash.explain()}\\n`);

  // Failed creation - invalid algorithm
  console.log('❌ Failed Unit Creation:');
  const badHash = Hash.create('invalid-algo');
  console.log(`Hash created: ${badHash.created}`);
  console.log(`Can hash: ${badHash.capableOf('hash')}`);
  console.log(`Error: ${badHash.error}`);
  console.log(`Stack: ${badHash.stack?.join(' | ')}`);
  badHash.help();
  console.log(`Explanation: ${badHash.explain()}\\n`);

  // Complex validation with warnings
  console.log('⚠️ Creation with Warnings:');
  const httpWithWarnings = HttpUnit.create({
    baseUrl: 'https://api.example.com',
    timeout: 500, // Too low - warning
    headers: {} // Missing User-Agent - warning
  });
  console.log(`HTTP created: ${httpWithWarnings.created}`);
  console.log(`Warnings: ${httpWithWarnings.stack?.join(' | ')}`);
  httpWithWarnings.help();
  console.log();

  // Failed HTTP creation
  console.log('❌ Failed HTTP Creation:');
  const badHttp = HttpUnit.create({
    baseUrl: 'not-a-url', // Invalid URL
    timeout: 100
  });
  console.log(`HTTP created: ${badHttp.created}`);
  console.log(`Error: ${badHttp.error}`);
  badHttp.help();
  console.log();

  // Safe composition - type checking with created
  console.log('🔗 Safe Unit Composition:');
  
  function composeUnits(unitA: Unit, unitB: Unit) {
    console.log(`Composing ${unitA.whoami()} + ${unitB.whoami()}`);
    
    if (!unitA.created) {
      console.log(`❌ Cannot compose: ${unitA.whoami()} failed - ${unitA.error}`);
      return;
    }
    
    if (!unitB.created) {
      console.log(`❌ Cannot compose: ${unitB.whoami()} failed - ${unitB.error}`);
      return;
    }
    
    // Safe to compose - both units are valid
    console.log('✅ Both units valid - composition safe');
    
    const unitACapabilities = unitA.teach?.() || {};
    const unitBCapabilities = unitB.teach?.() || {};
    
    console.log(`Unit A teaches: ${Object.keys(unitACapabilities).join(', ')}`);
    console.log(`Unit B teaches: ${Object.keys(unitBCapabilities).join(', ')}`);
  }

  // Test safe composition
  composeUnits(goodHash, httpWithWarnings);
  console.log();
  composeUnits(badHash, httpWithWarnings);
  console.log();
  composeUnits(goodHash, badHttp);
  console.log();

  // Working with valid units
  console.log('⚡ Using Valid Units:');
  if (goodHash.created) {
    const hashResult = goodHash.hash('test-data');
    console.log(`Hash result: ${hashResult}`);
    
    const isValid = goodHash.verify('test-data', hashResult);
    console.log(`Verification: ${isValid}`);
  }

  if (httpWithWarnings.created) {
    const httpCapabilities = httpWithWarnings.teach();
    if (httpCapabilities.get) {
      const response = httpCapabilities.get('/users');
      console.log(`HTTP response: ${response}`);
    }
  }
  console.log();

  // Universal unit processing with validation
  console.log('🌍 Universal Unit Processing:');
  
  function processAnyUnit(unit: Unit) {
    console.log(`Processing: ${unit.whoami()}`);
    
    if (!unit.created) {
      console.log(`❌ Skipping - creation failed: ${unit.error}`);
      return;
    }
    
    console.log('✅ Unit is valid');
    console.log(`Commands: ${unit.dna.commands.join(', ')}`);
    
    // Try to get capabilities
    const capabilities = unit.teach?.();
    if (capabilities) {
      console.log(`Teaches: ${Object.keys(capabilities).join(', ')}`);
    }
  }

  [goodHash, badHash, httpWithWarnings, badHttp].forEach(processAnyUnit);
  console.log();

  console.log('✨ Key Benefits:');
  console.log('• No Result dependency - zero external deps');
  console.log('• Self-documenting errors with stack traces');
  console.log('• Type-safe composition through created checking');
  console.log('• Units carry their creation story');
  console.log('• Natural error handling without try/catch');
  console.log('• Detailed explanations with explain() method');
}

// Run the demo
demoSelfValidatingUnits().catch(console.error);
