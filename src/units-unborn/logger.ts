import { Result } from "@synet/patterns";

/**
 * Log levels in order of verbosity
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info", 
  WARN = "warn",
  ERROR = "error"
}

/**
 * Log output interface
 */
export interface LogOutput {
  write(level: LogLevel, message: string, context?: string): void;
}

/**
 * Console log output implementation
 */
export class ConsoleLogOutput implements LogOutput {
  write(level: LogLevel, message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${timestamp}] [${level.toUpperCase()}] [${context}]` : `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message);
        break;
      case LogLevel.INFO:
        console.info(prefix, message);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message);
        break;
    }
  }
}

/**
 * Logger unit configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  context?: string;
  output: LogOutput;
}

/**
 * Logger unit state
 */
export interface LoggerState {
  readonly config: LoggerConfig;
  readonly started: boolean;
}

/**
 * Logger unit implementation
 * 
 * A pure, composable logger that follows the Unit Architecture pattern.
 * Provides structured logging with configurable levels and outputs.
 */
export class LoggerUnit {
  private constructor(private readonly state: LoggerState) {}

  /**
   * Create a new logger unit
   */
  static create(config: LoggerConfig): Result<LoggerUnit> {
    try {
      const state: LoggerState = {
        config,
        started: false
      };

      return Result.success(new LoggerUnit(state));
    } catch (error) {
      return Result.fail(`Failed to create logger unit: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get unit help information
   */
  static help(): string {
    return `LoggerUnit - Pure, composable logging

USAGE:
  const logger = LoggerUnit.create({
    level: LogLevel.INFO,
    context: "MyApp",
    output: new ConsoleLogOutput()
  });
  
  logger.info("Hello world");
  logger.error("Something went wrong");

METHODS:
  - create(config): Create logger with configuration
  - debug(message): Log debug message
  - info(message): Log info message  
  - warn(message): Log warning message
  - error(message): Log error message
  - child(context): Create child logger with context
  - capabilities(): Get logger capabilities
  - help(): Get this help text

PURE FUNCTIONS:
  - log(level, message, config): Pure logging function
  - shouldLog(level, minLevel): Check if level should be logged
  - formatMessage(message, context): Format message with context

CONFIGURATION:
  - level: Minimum log level to output
  - context: Optional context string
  - output: LogOutput implementation for message writing

FEATURES:
  - Zero dependencies
  - Type-safe configuration
  - Composable with other units
  - Multiple output formats
  - Contextual logging
  - Pure functional API`;
  }

  /**
   * Get logger capabilities
   */
  static capabilities(): string[] {
    return [
      "structured-logging",
      "configurable-levels", 
      "contextual-logging",
      "multiple-outputs",
      "pure-functions",
      "type-safe",
      "zero-dependencies"
    ];
  }

  /**
   * Get logger configuration
   */
  getConfig(): LoggerConfig {
    return this.state.config;
  }

  /**
   * Log a debug message
   */
  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Log an info message
   */
  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Log a warning message
   */
  warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  /**
   * Log an error message
   */
  error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Result<LoggerUnit> {
    const newContext = this.state.config.context 
      ? `${this.state.config.context}:${context}`
      : context;

    return LoggerUnit.create({
      ...this.state.config,
      context: newContext
    });
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string): void {
    if (shouldLog(level, this.state.config.level)) {
      this.state.config.output.write(level, message, this.state.config.context);
    }
  }

  /**
   * Get unit help
   */
  help(): string {
    return LoggerUnit.help();
  }

  /**
   * Get unit capabilities
   */
  capabilities(): string[] {
    return LoggerUnit.capabilities();
  }
}

// Pure functions for functional programming style

/**
 * Pure logging function
 */
export function log(level: LogLevel, message: string, config: LoggerConfig): void {
  if (shouldLog(level, config.level)) {
    config.output.write(level, message, config.context);
  }
}

/**
 * Check if a log level should be logged
 */
export function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  return levels.indexOf(level) >= levels.indexOf(minLevel);
}

/**
 * Format a message with context
 */
export function formatMessage(message: string, context?: string): string {
  const timestamp = new Date().toISOString();
  return context 
    ? `[${timestamp}] [${context}] ${message}`
    : `[${timestamp}] ${message}`;
}

/**
 * Create a console logger config
 */
export function createConsoleLogger(level: LogLevel = LogLevel.INFO, context?: string): LoggerConfig {
  return {
    level,
    context,
    output: new ConsoleLogOutput()
  };
}

/**
 * Default logger unit for quick usage
 */
export const defaultLogger = LoggerUnit.create(createConsoleLogger());
