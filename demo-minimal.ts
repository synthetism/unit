/**
 * Minimal Unit Architecture Demo
 * 
 * Shows how sync and async commands work together in practice
 */

import { Key } from './src/units-born/key-minimal';

async function demoMinimalUnit() {
  console.log('🚀 Minimal Unit Architecture Demo\\n');

  // Create a key unit
  const key = await Key.generate();
  console.log(`✅ Created: ${key.whoami()}`);

  // Show help
  key.help();

  console.log('\\n⚡ Command Execution (all async, some internally sync):');
  
  // Mix of sync and async commands - all handled uniformly
  const results = await Promise.all([
    key.execute('canSign'),      // Sync internally, Promise.resolve()
    key.execute('getPublicKey'), // Sync internally, Promise.resolve()
    key.execute('sign', 'hello world'), // Async internally
    key.execute('toJSON'),       // Sync internally, Promise.resolve()
  ]);

  console.log('  canSign:', results[0]);
  console.log('  getPublicKey: [string]');
  console.log('  sign: [signature]');
  console.log('  toJSON: [object]');

  // Verify the signature
  const signature = results[2] as string;
  const isValid = await key.execute('verify', 'hello world', signature);
  console.log('  verify:', isValid);

  // Show error handling
  try {
    await key.execute('invalidCommand');
  } catch (error) {
    console.log('  ❌ Error handling:', (error as Error).message);
  }

  console.log('\\n✨ Key Benefits:');
  console.log('• Uniform async interface - no confusion about sync/async');
  console.log('• Simple Promise.resolve() wrapping for sync operations');
  console.log('• Clean capability checking');
  console.log('• Flexible help system');
  console.log('• Minimal interface, maximum flexibility');
}

// Run the demo
demoMinimalUnit().catch(console.error);
