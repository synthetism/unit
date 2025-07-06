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
  type Unit,
  type UnitSchema,
  
  // Base classes
  ValueObject,
  BaseUnit,
  
  // Utility functions
  createUnitSchema,
  validateUnitSchema,
} from './unit';
