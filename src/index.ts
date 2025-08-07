/**
 * @synet/unit - Unit Architecture Foundation
 *
 * The foundational package for Unit Architecture in the Synet ecosystem.
 * This package provides the core interfaces and base classes that all units
 * should implement.
 *
 * @author 0en, SYNET ALPHA
 */

export {
  // Core interfaces
  type IUnit,
  type UnitSchema,
  type TeachingContract,
  type UnitProps,
  type ToolSchema,
  type UnitCore,
  // Base classes
  ValueObject,
  Unit,
  // Utility functions
  createUnitSchema,
  validateUnitSchema,
} from "./unit";

export {
  Capabilities,
} from "./capabilities";

export {
  Schema,
} from "./schema";

export {
  Validator,
} from "./validator";