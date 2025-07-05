/**
 * Web of Capabilities Demo
 * 
 * Shows how units can teach, learn, and evolve into intelligent composites
 * without tight coupling - the holy grail of Unit Architecture!
 */

import { Key, Vault } from './src/units-born/key-evolving';
import type { Unit } from './src/unit';

async function demoWebOfCapabilities() {
  console.log('🌐 Web of Capabilities Demo\\n');

  // Create individual units
  console.log('📦 Creating Individual Units...');
  const key = Key.generate();
  const vault = Vault.create();
  
  console.log(`✅ Created: ${key.whoami()}`);
  console.log(`✅ Created: ${vault.whoami()}\\n`);

  // Show initial capabilities
  console.log('🔍 Initial Capabilities:');
  console.log(`Key capabilities: ${key.dna.commands.join(', ')}`);
  console.log(`Vault capabilities: ${vault.dna.commands.join(', ')}\\n`);

  // Key teaches its capabilities
  console.log('🎓 Teaching Phase...');
  const keyCapabilities = key.teach();
  console.log(`Key teaches: ${Object.keys(keyCapabilities).join(', ')}`);

  // Vault learns from key
  console.log('🧠 Learning Phase...');
  vault.learn([keyCapabilities]);
  console.log('Vault learned key capabilities!\\n');

  // Show evolved capabilities
  console.log('🔍 Post-Learning Capabilities:');
  vault.help();
  console.log();

  // Test vault using learned capabilities
  console.log('⚡ Testing Learned Capabilities:');
  
  // Vault can now sign (learned from key)
  const vaultCapabilities = vault.teach();
  if (vaultCapabilities.sign && vaultCapabilities.canSign) {
    const canSign = await vaultCapabilities.canSign();
    console.log(`Vault can sign: ${canSign}`);
    
    if (canSign) {
      const signature = await vaultCapabilities.sign('vault-data');
      console.log(`Vault signed data: ${typeof signature === 'string' ? '[signature]' : signature}`);
      
      const isValid = await vaultCapabilities.verify('vault-data', signature);
      console.log(`Signature valid: ${isValid}`);
    }
  }

  // Vault can still do its native operations
  const stored = vaultCapabilities.store('secret-data');
  console.log(`Vault stored: ${stored}`);
  console.log();

  // Evolution phase - create intelligent composite
  console.log('🔮 Evolution Phase...');
  const intelligentVault = vault.evolve('IntelligentVault', {
    'ai-analyze': (...args: unknown[]) => `AI analysis of ${args[0]}`,
    'secure-sign': (...args: unknown[]) => `Securely signed ${args[0]}`,
  });

  console.log(`✨ Evolved: ${intelligentVault.whoami()}`);
  intelligentVault.help();
  console.log();

  // Test evolved unit
  console.log('⚡ Testing Evolved Unit:');
  if (intelligentVault.execute) {
    const aiAnalysis = await intelligentVault.execute('ai-analyze', 'sensitive-data');
    console.log(`AI Analysis: ${aiAnalysis}`);
    
    const secureSigning = await intelligentVault.execute('secure-sign', 'document');
    console.log(`Secure Signing: ${secureSigning}`);
    
    // Evolved unit still has original capabilities
    const evolvedSign = await intelligentVault.execute('sign', 'evolved-data');
    console.log(`Evolved Sign: ${typeof evolvedSign === 'string' ? '[signature]' : evolvedSign}`);
  }
  console.log();

  // Demonstrate universal Unit interface
  console.log('🌍 Universal Unit Interface Demo:');
  
  function processAnyUnit(unit: Unit, capability: string) {
    if (unit.capableOf(capability)) {
      console.log(`✅ ${unit.whoami()} can ${capability}`);
      return true;
    }
    console.log(`❌ ${unit.whoami()} cannot ${capability}`);
    return false;
  }

  // Test different units with same interface
  processAnyUnit(key, 'sign');
  processAnyUnit(vault, 'sign');     // Learned capability
  processAnyUnit(intelligentVault, 'ai-analyze'); // Evolved capability
  processAnyUnit(key, 'store');      // Key cannot store
  console.log();

  // Show web of capabilities
  console.log('🕸️ Web of Capabilities Created:');
  console.log('• Key taught signing to Vault');
  console.log('• Vault learned and can now sign');
  console.log('• IntelligentVault evolved with AI + all previous capabilities');
  console.log('• All units use same Unit interface');
  console.log('• No tight coupling between implementations');
  console.log('• Pure capability-based composition');
  console.log();

  console.log('✨ Holy Grail Achieved! 🏆');
  console.log('Units can teach, learn, and evolve capabilities');
  console.log('without knowing about each other implementations!');
}

// Run the demo
demoWebOfCapabilities().catch(console.error);
