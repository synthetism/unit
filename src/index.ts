/**
 * @synet/unit - Unit Architecture Foundation
 *
 * The foundational package for Unit Architecture in the Synet ecosystem.
 * This package provides the core interfaces and base classes that all units
 * should implement.
 *
 * @author Synet Team
 */

export {
  // Core interfaces
  type IUnit,
  type UnitSchema,
  type TeachingContract,
  // Base classes
  ValueObject,
  Unit,
  // Utility functions
  createUnitSchema,
  validateUnitSchema,
} from "./unit";
