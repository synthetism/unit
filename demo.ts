/**
 * Unit Architecture Demo
 * 
 * This demo shows how the Unit interface works with command-based execution,
 * capability discovery, and self-documentation.
 */

import { Key } from './src/units-born/key';

async function demoUnitArchitecture() {
  console.log('🚀 Unit Architecture Demo\n');

  // Create a key unit
  console.log('📦 Creating a Key unit...');
  const key = await Key.generate();
  console.log('✅ Key unit created\n');

  // Show unit identity
  console.log('👤 Unit Identity:');
  const identity = key.whoami();
  console.log(`   Name: ${identity.name}`);
  console.log(`   Version: ${identity.version}`);
  console.log(`   Type: ${identity.type}`);
  console.log(`   Capabilities: ${identity.capabilities.join(', ')}`);
  console.log(`   ID: ${identity.id}\n`);

  // Show DNA
  console.log('🧬 Unit DNA:');
  console.log(`   Description: ${key.dna.description}`);
  console.log(`   Author: ${key.dna.author}`);
  console.log(`   Dependencies: ${key.dna.dependencies?.join(', ')}\n`);

  // Demonstrate capability discovery
  console.log('🔍 Capability Discovery:');
  const capabilities = ['sign', 'verify', 'canSign', 'getPublicKey', 'invalidCapability'];
  for (const cap of capabilities) {
    const capable = key.capableOf(cap);
    console.log(`   ${cap}: ${capable ? '✅' : '❌'}`);
  }
  console.log();

  // Demonstrate command-based execution
  console.log('⚡ Command-Based Execution:');
  
  // Check if key can sign
  const canSignResult = await key.command('canSign');
  console.log(`   canSign: ${canSignResult.success ? '✅' : '❌'} - ${canSignResult.data}`);
  
  // Get public key
  const publicKeyResult = await key.command('getPublicKey');
  console.log(`   getPublicKey: ${publicKeyResult.success ? '✅' : '❌'}`);
  
  // Sign some data
  const data = 'Hello, Unit Architecture!';
  const signResult = await key.command('sign', data);
  console.log(`   sign: ${signResult.success ? '✅' : '❌'} - ${typeof signResult.data}`);
  
  // Verify the signature
  const verifyResult = await key.command('verify', data, signResult.data);
  console.log(`   verify: ${verifyResult.success ? '✅' : '❌'} - ${verifyResult.data}`);
  
  // Try to verify with wrong data
  const wrongVerifyResult = await key.command('verify', 'wrong data', signResult.data);
  console.log(`   verify (wrong): ${wrongVerifyResult.success ? '✅' : '❌'} - ${wrongVerifyResult.data}`);
  
  // Export to JSON
  const jsonResult = await key.command('toJSON');
  console.log(`   toJSON: ${jsonResult.success ? '✅' : '❌'} - ${typeof jsonResult.data}`);
  console.log();

  // Show error handling
  console.log('🚨 Error Handling:');
  const invalidResult = await key.command('invalidCommand');
  console.log(`   Invalid command: ${invalidResult.success ? '✅' : '❌'}`);
  console.log(`   Error: ${invalidResult.error}\n`);

  // Show help system
  console.log('📚 Help System:');
  const help = key.help();
  console.log(`   Overview: ${help.overview}`);
  console.log('   Available Commands:');
  for (const [cmd, desc] of Object.entries(help.commands)) {
    console.log(`     - ${cmd}: ${desc}`);
  }
  console.log('   Examples:');
  for (const example of help.examples) {
    console.log(`     ${example}`);
  }
  console.log();

  console.log('✨ Unit Architecture Demo Complete!\n');
  console.log('Key Benefits:');
  console.log('• Command-based execution (no direct method calls)');
  console.log('• Capability discovery and validation');
  console.log('• Self-documenting units with help and examples');
  console.log('• Consistent error handling');
  console.log('• Composable and discoverable architecture');
  console.log('• Future-proof for AI integration and cloud deployment');
}

// Run the demo
demoUnitArchitecture().catch(console.error);
