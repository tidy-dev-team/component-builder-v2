// Validation error types and utilities

export enum ValidationErrorCode {
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_RANGE = 'INVALID_RANGE',
  INVALID_ENUM_VALUE = 'INVALID_ENUM_VALUE',
  INVALID_COMPONENT_KEY = 'INVALID_COMPONENT_KEY',
  INVALID_PROPERTY_NAME = 'INVALID_PROPERTY_NAME',
  INVALID_BOOLEAN_VALUE = 'INVALID_BOOLEAN_VALUE',
  MALICIOUS_INPUT = 'MALICIOUS_INPUT',
  CUSTOM_VALIDATION = 'CUSTOM_VALIDATION',
}

export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  field: string;
  value?: unknown;
  context?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export class ValidationException extends Error {
  public readonly validationErrors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = `Validation failed: ${errors.map(e => e.message).join(', ')}`;
    super(message);
    this.name = 'ValidationException';
    this.validationErrors = errors;
  }
}

export function createValidationError(
  code: ValidationErrorCode,
  message: string,
  field: string,
  value?: unknown,
  context?: Record<string, unknown>
): ValidationError {
  return {
    code,
    message,
    field,
    value,
    context,
  };
}

export function createValidationResult(
  valid: boolean,
  errors: ValidationError[] = [],
  warnings: ValidationError[] = []
): ValidationResult {
  return {
    valid,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings || []);
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
  };
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No validation errors';
  }

  if (errors.length === 1) {
    return errors[0].message;
  }

  return `Multiple validation errors:\n${errors.map(e => `• ${e.message}`).join('\n')}`;
}

export function getValidationSummary(result: ValidationResult): string {
  const { valid, errors, warnings } = result;
  
  if (valid && (!warnings || warnings.length === 0)) {
    return 'All inputs are valid';
  }
  
  const parts = [];
  
  if (!valid) {
    parts.push(`${errors.length} error${errors.length !== 1 ? 's' : ''}`);
  }
  
  if (warnings && warnings.length > 0) {
    parts.push(`${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}