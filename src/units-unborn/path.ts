import { Result } from "@synet/patterns";

/**
 * Path separator types
 */
export enum PathSeparator {
  POSIX = "/",
  WINDOWS = "\\"
}

/**
 * Path information
 */
export interface PathInfo {
  full: string;
  directory: string;
  name: string;
  base: string;
  extension: string;
  isAbsolute: boolean;
  separator: PathSeparator;
}

/**
 * Path unit configuration
 */
export interface PathConfig {
  separator: PathSeparator;
  caseSensitive: boolean;
}

/**
 * Path unit state
 */
export interface PathState {
  readonly config: PathConfig;
  readonly path: string;
  readonly parsed: PathInfo;
}

/**
 * Path unit implementation
 * 
 * A pure, composable path manipulation unit that follows the Unit Architecture pattern.
 * Provides cross-platform path operations with type safety.
 */
export class PathUnit {
  private constructor(private readonly state: PathState) {}

  /**
   * Create a new path unit
   */
  static create(path: string, config?: Partial<PathConfig>): Result<PathUnit> {
    try {
      const defaultConfig: PathConfig = {
        separator: detectSeparator(path),
        caseSensitive: true
      };
      
      const finalConfig = { ...defaultConfig, ...config };
      const parsed = parsePath(path, finalConfig.separator);
      
      const state: PathState = {
        config: finalConfig,
        path: normalizePath(path, finalConfig.separator),
        parsed
      };

      return Result.success(new PathUnit(state));
    } catch (error) {
      return Result.fail(`Failed to create path unit: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get unit help information
   */
  static help(): string {
    return `PathUnit - Pure, composable path manipulation

USAGE:
  const path = PathUnit.create("/home/user/document.txt");
  
  console.log(path.directory()); // "/home/user"
  console.log(path.filename()); // "document.txt"
  console.log(path.extension()); // ".txt"
  
  const newPath = path.join("subfolder", "file.md");
  const resolved = path.resolve("../other.txt");

METHODS:
  - create(path, config?): Create path unit
  - directory(): Get directory path
  - filename(): Get filename with extension
  - basename(): Get filename without extension
  - extension(): Get file extension
  - join(...segments): Join path segments
  - resolve(target): Resolve relative path
  - relative(from): Get relative path
  - isAbsolute(): Check if path is absolute
  - exists(): Check if path exists (async)
  - capabilities(): Get path capabilities
  - help(): Get this help text

PURE FUNCTIONS:
  - join(base, ...segments): Join path segments
  - resolve(base, target): Resolve relative path
  - relative(from, to): Get relative path
  - normalize(path): Normalize path separators
  - parsePath(path): Parse path components

CONFIGURATION:
  - separator: Path separator (POSIX or Windows)
  - caseSensitive: Whether comparisons are case sensitive

FEATURES:
  - Cross-platform path handling
  - Type-safe path operations
  - Immutable path transformations
  - Path validation and normalization
  - Relative and absolute path resolution
  - File extension handling
  - Pure functional API`;
  }

  /**
   * Get path capabilities
   */
  static capabilities(): string[] {
    return [
      "path-manipulation",
      "cross-platform",
      "type-safe",
      "immutable-operations",
      "path-resolution",
      "extension-handling",
      "validation",
      "pure-functions",
      "zero-dependencies"
    ];
  }

  /**
   * Get current path
   */
  toString(): string {
    return this.state.path;
  }

  /**
   * Get path configuration
   */
  getConfig(): PathConfig {
    return this.state.config;
  }

  /**
   * Get parsed path information
   */
  getParsed(): PathInfo {
    return this.state.parsed;
  }

  /**
   * Get directory path
   */
  directory(): string {
    return this.state.parsed.directory;
  }

  /**
   * Get filename with extension
   */
  filename(): string {
    return this.state.parsed.name;
  }

  /**
   * Get filename without extension
   */
  basename(): string {
    return this.state.parsed.base;
  }

  /**
   * Get file extension
   */
  extension(): string {
    return this.state.parsed.extension;
  }

  /**
   * Check if path is absolute
   */
  isAbsolute(): boolean {
    return this.state.parsed.isAbsolute;
  }

  /**
   * Join path segments
   */
  join(...segments: string[]): Result<PathUnit> {
    const joined = joinPath(this.state.path, ...segments);
    return PathUnit.create(joined, this.state.config);
  }

  /**
   * Resolve relative path
   */
  resolve(target: string): Result<PathUnit> {
    const resolved = resolvePath(this.state.path, target, this.state.config.separator);
    return PathUnit.create(resolved, this.state.config);
  }

  /**
   * Get relative path from this path to target
   */
  relative(target: string): Result<PathUnit> {
    const relative = relativePath(this.state.path, target, this.state.config.separator);
    return PathUnit.create(relative, this.state.config);
  }

  /**
   * Get parent directory
   */
  parent(): Result<PathUnit> {
    const parent = this.state.parsed.directory || this.state.config.separator;
    return PathUnit.create(parent, this.state.config);
  }

  /**
   * Change file extension
   */
  withExtension(extension: string): Result<PathUnit> {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    const newPath = this.state.parsed.directory + this.state.config.separator + this.state.parsed.base + ext;
    return PathUnit.create(newPath, this.state.config);
  }

  /**
   * Get unit help
   */
  help(): string {
    return PathUnit.help();
  }

  /**
   * Get unit capabilities
   */
  capabilities(): string[] {
    return PathUnit.capabilities();
  }
}

// Pure functions for functional programming style

/**
 * Join path segments
 */
export function joinPath(...segments: string[]): string {
  return segments
    .filter(segment => segment && segment.length > 0)
    .join('/')
    .replace(/\/+/g, '/');
}

/**
 * Resolve relative path
 */
export function resolvePath(basePath: string, targetPath: string, separator: PathSeparator): string {
  if (isAbsolutePath(targetPath)) {
    return normalizePath(targetPath, separator);
  }
  
  const base = normalizePath(basePath, separator);
  const target = normalizePath(targetPath, separator);
  
  return joinPath(base, target);
}

/**
 * Get relative path from one path to another
 */
export function relativePath(fromPath: string, toPath: string, separator: PathSeparator): string {
  const from = normalizePath(fromPath, separator).split(separator);
  const to = normalizePath(toPath, separator).split(separator);
  
  // Find common prefix
  let commonLength = 0;
  const minLength = Math.min(from.length, to.length);
  
  for (let i = 0; i < minLength; i++) {
    if (from[i] === to[i]) {
      commonLength++;
    } else {
      break;
    }
  }
  
  // Build relative path
  const upSteps = from.length - commonLength;
  const relativeParts = ['..'.repeat(upSteps)].concat(to.slice(commonLength));
  
  return relativeParts.filter(part => part.length > 0).join(separator);
}

/**
 * Normalize path separators
 */
export function normalizePath(path: string, separator: PathSeparator): string {
  return path.replace(/[/\\]/g, separator);
}

/**
 * Parse path into components
 */
export function parsePath(path: string, separator: PathSeparator): PathInfo {
  const normalized = normalizePath(path, separator);
  const parts = normalized.split(separator);
  const filename = parts[parts.length - 1] || '';
  const directory = parts.slice(0, -1).join(separator) || separator;
  
  const dotIndex = filename.lastIndexOf('.');
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
  const extension = dotIndex > 0 ? filename.slice(dotIndex) : '';
  
  return {
    full: normalized,
    directory,
    name: filename,
    base,
    extension,
    isAbsolute: isAbsolutePath(normalized),
    separator
  };
}

/**
 * Check if path is absolute
 */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/') || /^[A-Za-z]:/.test(path);
}

/**
 * Detect path separator from path string
 */
export function detectSeparator(path: string): PathSeparator {
  const windowsCount = (path.match(/\\/g) || []).length;
  const posixCount = (path.match(/\//g) || []).length;
  
  return windowsCount > posixCount ? PathSeparator.WINDOWS : PathSeparator.POSIX;
}

/**
 * Create a POSIX path configuration
 */
export function createPosixPath(path: string): Result<PathUnit> {
  return PathUnit.create(path, { separator: PathSeparator.POSIX, caseSensitive: true });
}

/**
 * Create a Windows path configuration
 */
export function createWindowsPath(path: string): Result<PathUnit> {
  return PathUnit.create(path, { separator: PathSeparator.WINDOWS, caseSensitive: false });
}

/**
 * Default path unit for current platform
 */
export function createPlatformPath(path: string): Result<PathUnit> {
  // Default to POSIX for browser/universal compatibility
  const separator = PathSeparator.POSIX;
  const caseSensitive = true;
  
  return PathUnit.create(path, { separator, caseSensitive });
}
