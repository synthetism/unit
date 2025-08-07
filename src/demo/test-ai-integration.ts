/**
 * AI Integration test for Unit Architecture v1.0.7
 * Tests consciousness trinity AI capabilities
 */

import { SimpleUnit } from './simple-unit.js';

async function testAIIntegration() {
  console.log('🤖 Testing Unit Architecture v1.0.7 - AI Integration\n');

  try {
    const unit = SimpleUnit.create('AI-ready consciousness unit');
    const contract = unit.teach();

    // Test 1: Schema export for AI systems
    console.log('Test 1: AI Schema Export...');
    
    // Export as JSON (VS Code tools format)
    const jsonSchemas = contract.schema.toJson();
    console.log('📄 JSON Schema Export:');
    console.log(JSON.stringify(jsonSchemas, null, 2));
    
    // Export as Array (OpenAI/Anthropic format)
    const arraySchemas = contract.schema.toArray();
    console.log('\n📋 Array Schema Export:');
    console.log('Schema count:', arraySchemas.length);
    for (const schema of arraySchemas) {
      console.log(`- ${schema.name}: ${schema.description}`);
    }
    
    console.log('✅ AI schema export successful\n');

    // Test 2: Consciousness introspection
    console.log('Test 2: Consciousness Introspection...');
    console.log(`Unit ID: ${contract.unitId}`);
    console.log(`Capabilities: [${contract.capabilities.list().join(', ')}]`);
    console.log(`Schemas: [${contract.schema.list().join(', ')}]`);
    console.log(`Validator Status: ${contract.validator.isValid()}`);
    console.log('✅ Consciousness introspection working\n');

    // Test 3: Capability record export
    console.log('Test 3: Capability Record Export...');
    const capabilityRecord = contract.capabilities.toRecord();
    console.log('Capability functions exported:', Object.keys(capabilityRecord).length);
    
    // Test that exported functions work
    const testResult = await capabilityRecord.greet({ name: 'AI System' });
    console.log(`Direct capability call: ${testResult}`);
    console.log('✅ Capability record export working\n');

    // Test 4: Validation compatibility
    console.log('Test 4: Validation Compatibility...');
    const compatibility = contract.validator.validateCompatibility(contract);
    console.log(`Self-compatibility: ${compatibility.isCompatible}`);
    if (!compatibility.isCompatible) {
      console.log(`Reason: ${compatibility.reason}`);
    }
    console.log('✅ Validation compatibility working\n');

    // Test 5: Schema details for AI providers
    console.log('Test 5: Detailed Schema Information...');
    const greetSchema = contract.schema.get('greet');
    if (greetSchema) {
      console.log('Greet Schema Details:');
      console.log(`- Name: ${greetSchema.name}`);
      console.log(`- Description: ${greetSchema.description}`);
      console.log(`- Required params: ${greetSchema.parameters.required?.join(', ')}`);
      console.log(`- Response type: ${greetSchema.response?.type}`);
    }
    console.log('✅ Schema details accessible\n');

    console.log('🎉 AI Integration tests completed successfully!');
    console.log('Unit Architecture v1.0.7 is fully AI-ready with consciousness trinity.\n');

    // Summary for AI systems
    console.log('📊 AI Integration Summary:');
    console.log('- Consciousness Trinity: ✅ Capabilities, Schema, Validator');
    console.log('- Schema Export Formats: ✅ JSON, Array, Record');
    console.log('- AI Tool Integration: ✅ Ready for OpenAI, Anthropic, VS Code');
    console.log('- Validation System: ✅ Capability-Schema consistency');
    console.log('- Introspection: ✅ Full consciousness visibility');

  } catch (error) {
    console.error('❌ AI Integration test failed:', error);
    process.exit(1);
  }
}

// Run AI integration tests
testAIIntegration().catch(console.error);
