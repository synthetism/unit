/**
 * Simple Units - Pure, Composable, Minimal Units
 * 
 * This module exports simple units that demonstrate the Unit pattern
 * and form the foundation of our dependency moat strategy.
 * 
 * Each unit follows the pattern:
 * - Static create() method
 * - Instance methods for functionality
 * - help() method for discoverability
 * - capabilities property for introspection
 * - consume() method for composition
 * - toJSON/fromJSON for serialization
 * - Pure function exports for simple use cases
 */

// Validator Unit
export { 
  Validator,
  validate,
  sanitize,
  transform,
  type ValidationResult,
  type ValidationRule
} from './validator.js';

// Hash Unit
export {
  Hash,
  createHash,
  sha256,
  sha1,
  md5,
  type HashAlgorithm
} from './hash.js';

// Encoder Unit
export {
  Encoder,
  encode,
  decode,
  base64Encode,
  base64Decode,
  hexEncode,
  hexDecode,
  type EncodingFormat
} from './encoder.js';

// Timer Unit
export {
  Timer,
  sleep,
  timeFunction,
  measure,
  type TimerResult
} from './timer.js';

// Config Unit
export {
  Config,
  createConfig,
  loadEnvConfig,
  loadJSONConfig,
  type ConfigSource,
  type ConfigSchema
} from './config.js';

// Logger Unit
export {
  LoggerUnit,
  log,
  shouldLog,
  formatMessage,
  LogLevel,
  type LogOutput,
  type LoggerConfig
} from './logger.js';

// HTTP Unit
export {
  HttpUnit,
  request,
  buildUrl,
  parseJsonResponse,
  isSuccess,
  HttpMethod,
  type HttpRequest,
  type HttpResponse,
  type HttpClient
} from './http.js';

// Path Unit
export {
  PathUnit,
  joinPath,
  resolvePath,
  relativePath,
  normalizePath,
  PathSeparator,
  type PathInfo,
  type PathConfig
} from './path.js';

// String Unit
export {
  StringUnit,
  join,
  concat,
  repeat,
  padStart,
  padEnd,
  normalize,
  slugify,
  isEmail,
  isUrl,
  escapeHtml,
  type StringConfig,
  type StringValidationRules
} from './string.js';

// UUID Unit
export {
  UuidUnit,
  generateV1,
  generateV4,
  generateV3,
  generateV5,
  validateUuid,
  compare,
  nil,
  isNil,
  UuidVersion,
  UUID_NAMESPACES,
  type UuidConfig,
  type UuidValidation
} from './uuid.js';

/**
 * Show help for all units
 */
export async function showAllHelp(): Promise<void> {
  console.log('\n=== Simple Units Collection ===\n');
  
  const { Validator } = await import('./validator.js');
  const { Hash } = await import('./hash.js');
  const { Encoder } = await import('./encoder.js');
  const { Timer } = await import('./timer.js');
  const { Config } = await import('./config.js');
  const { LoggerUnit } = await import('./logger.js');
  const { HttpUnit } = await import('./http.js');
  const { PathUnit } = await import('./path.js');
  const { StringUnit } = await import('./string.js');
  const { UuidUnit } = await import('./uuid.js');
  
  Validator.help();
  Hash.help();
  Encoder.help();
  Timer.help();
  Config.help();
  LoggerUnit.help();
  HttpUnit.help();
  PathUnit.help();
  StringUnit.help();
  UuidUnit.help();
  
  console.log('\n💡 Unit Pattern Benefits:');
  console.log('• Self-documenting with help()');
  console.log('• Composable with consume()');
  console.log('• Dual API: Units + Pure functions');
  console.log('• Perfect for dependency moat strategy');
  console.log('• 1 Package = 1 Complete Capability');
  console.log('• AI-agent friendly with instant help()');
  console.log('• Zero external dependencies');
  console.log();
}
