// Central exports for validation system
export * from './validationErrors';
export * from './schemas';
export * from './inputSanitizer';
export * from './inputValidator';

// Re-export commonly used types and functions
export type { ValidationError, ValidationResult } from './validationErrors';
export type { ValidationRule, ValidationSchema } from './schemas';
export { InputValidator } from './inputValidator';
export { InputSanitizer } from './inputSanitizer';
export { 
  ValidationErrorCode, 
  createValidationError, 
  createValidationResult,
  formatValidationErrors,
  getValidationSummary 
} from './validationErrors';
export { 
  figmaValidationRules, 
  validateAgainstSecurity,
  securityRules 
} from './schemas';