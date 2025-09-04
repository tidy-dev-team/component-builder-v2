// Main input validation service
import {
  ValidationRule,
  ValidationSchema,
  figmaValidationRules,
  validateAgainstSecurity,
} from "./schemas";
import {
  ValidationError,
  ValidationResult,
  ValidationErrorCode,
  createValidationError,
  createValidationResult,
  combineValidationResults,
} from "./validationErrors";
import { InputSanitizer } from "./inputSanitizer";

export class InputValidator {
  /**
   * Validate a single value against a validation rule
   */
  static validateValue(
    value: unknown,
    rule: ValidationRule,
    fieldName: string
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Required field validation
    if (
      rule.required &&
      (value === null || value === undefined || value === "")
    ) {
      errors.push(
        createValidationError(
          ValidationErrorCode.REQUIRED_FIELD,
          `${fieldName} is required`,
          fieldName,
          value
        )
      );
      return createValidationResult(false, errors);
    }

    // Skip further validation if field is optional and empty
    if (
      !rule.required &&
      (value === null || value === undefined || value === "")
    ) {
      return createValidationResult(true);
    }

    // Type validation
    if (rule.type && typeof value !== rule.type) {
      errors.push(
        createValidationError(
          ValidationErrorCode.INVALID_TYPE,
          `${fieldName} must be of type ${rule.type}`,
          fieldName,
          value
        )
      );
    }

    // String-specific validations
    if (rule.type === "string" && typeof value === "string") {
      // Security validation first
      if (!validateAgainstSecurity(value)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.MALICIOUS_INPUT,
            `${fieldName} contains potentially harmful content`,
            fieldName,
            value
          )
        );
      }

      // Length validation
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_LENGTH,
            `${fieldName} must be at least ${rule.minLength} characters long`,
            fieldName,
            value
          )
        );
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_LENGTH,
            `${fieldName} must be at most ${rule.maxLength} characters long`,
            fieldName,
            value
          )
        );
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_FORMAT,
            `${fieldName} has invalid format`,
            fieldName,
            value
          )
        );
      }
    }

    // Number-specific validations
    if (rule.type === "number" && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_RANGE,
            `${fieldName} must be at least ${rule.min}`,
            fieldName,
            value
          )
        );
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_RANGE,
            `${fieldName} must be at most ${rule.max}`,
            fieldName,
            value
          )
        );
      }
    }

    // Enum validation
    if (rule.enum && rule.enum.length > 0) {
      if (!rule.enum.includes(value)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_ENUM_VALUE,
            `${fieldName} must be one of: ${rule.enum.join(", ")}`,
            fieldName,
            value
          )
        );
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        const message =
          typeof customResult === "string"
            ? customResult
            : `${fieldName} failed custom validation`;
        errors.push(
          createValidationError(
            ValidationErrorCode.CUSTOM_VALIDATION,
            message,
            fieldName,
            value
          )
        );
      }
    }

    return createValidationResult(errors.length === 0, errors);
  }

  /**
   * Validate an object against a schema
   */
  static validateObject(
    obj: Record<string, unknown>,
    schema: ValidationSchema
  ): ValidationResult {
    const results: ValidationResult[] = [];

    // Validate each field in the schema
    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = obj[fieldName];
      const result = this.validateValue(value, rule, fieldName);
      results.push(result);
    }

    return combineValidationResults(...results);
  }

  /**
   * Validate and sanitize component key
   */
  static validateComponentKey(key: unknown): ValidationResult {
    const sanitized = InputSanitizer.ensureValidComponentKey(key);

    if (!sanitized) {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_COMPONENT_KEY,
          "Invalid component key format",
          "componentKey",
          key
        ),
      ]);
    }

    return createValidationResult(true);
  }

  /**
   * Validate component name
   */
  static validateComponentName(name: unknown): ValidationResult {
    if (typeof name !== "string") {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_TYPE,
          "Component name must be a string",
          "componentName",
          name
        ),
      ]);
    }

    // Check for security issues first (before sanitization)
    if (!validateAgainstSecurity(name)) {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_FORMAT,
          "Component name contains invalid characters or is too long",
          "componentName",
          name
        ),
      ]);
    }

    const sanitized = InputSanitizer.sanitizeComponentName(name);

    if (!sanitized || !figmaValidationRules.isValidComponentName(sanitized)) {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_FORMAT,
          "Component name contains invalid characters or is too long",
          "componentName",
          name
        ),
      ]);
    }

    return createValidationResult(true);
  }

  /**
   * Validate property name
   */
  static validatePropertyName(name: unknown): ValidationResult {
    if (typeof name !== "string") {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_TYPE,
          "Property name must be a string",
          "propertyName",
          name
        ),
      ]);
    }

    // Check for security issues first (before sanitization)
    if (!validateAgainstSecurity(name)) {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_PROPERTY_NAME,
          "Property name contains invalid characters or is too long",
          "propertyName",
          name
        ),
      ]);
    }

    const sanitized = InputSanitizer.ensureValidPropertyName(name);

    if (!sanitized || !figmaValidationRules.isValidPropertyName(sanitized)) {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_PROPERTY_NAME,
          "Property name contains invalid characters or is too long",
          "propertyName",
          name
        ),
      ]);
    }

    return createValidationResult(true);
  }

  /**
   * Validate boolean property value
   */
  static validatePropertyValue(value: unknown): ValidationResult {
    const normalized = InputSanitizer.normalizeBoolean(value);

    if (typeof normalized !== "boolean") {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_BOOLEAN_VALUE,
          "Property value must be a boolean",
          "propertyValue",
          value
        ),
      ]);
    }

    return createValidationResult(true);
  }

  /**
   * Validate build event data
   */
  static validateBuildEventData(
    data: Record<string, unknown>
  ): ValidationResult {
    const results: ValidationResult[] = [];

    // Validate each property name and value
    for (const [propertyName, propertyValue] of Object.entries(data)) {
      // Validate property name
      const nameResult = this.validatePropertyName(propertyName);
      results.push(nameResult);

      // Validate property value
      const valueResult = this.validatePropertyValue(propertyValue);
      results.push(valueResult);
    }

    return combineValidationResults(...results);
  }

  /**
   * Validate component set event data
   */
  static validateComponentSetEventData(data: {
    key?: unknown;
  }): ValidationResult {
    if (!data.key) {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.REQUIRED_FIELD,
          "Component key is required",
          "key",
          data.key
        ),
      ]);
    }

    return this.validateComponentKey(data.key);
  }

  /**
   * Validate dropdown selection
   */
  static validateDropdownSelection(
    value: unknown,
    availableOptions: string[]
  ): ValidationResult {
    console.log("%cvalue", "color: red;", value);
    console.log("%cvalue", "color: green;", availableOptions);
    if (value === null || value === undefined || value === "") {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.REQUIRED_FIELD,
          "Please select an option",
          "selection",
          value
        ),
      ]);
    }

    if (typeof value !== "string") {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_TYPE,
          "Selection must be a string",
          "selection",
          value
        ),
      ]);
    }

    if (!availableOptions.includes(value)) {
      return createValidationResult(false, [
        createValidationError(
          ValidationErrorCode.INVALID_ENUM_VALUE,
          `Selection must be one of: ${availableOptions.join(", ")}`,
          "selection",
          value
        ),
      ]);
    }

    return createValidationResult(true);
  }

  /**
   * Validate and sanitize user input with comprehensive checks
   */
  static validateAndSanitizeInput(
    input: unknown,
    fieldName: string
  ): { valid: boolean; sanitized: string; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Convert to string if needed
    let stringInput = "";
    if (typeof input === "string") {
      stringInput = input;
    } else if (input !== null && input !== undefined) {
      stringInput = String(input);
    }

    // Security validation
    if (!validateAgainstSecurity(stringInput)) {
      errors.push(
        createValidationError(
          ValidationErrorCode.MALICIOUS_INPUT,
          `${fieldName} contains potentially harmful content`,
          fieldName,
          input
        )
      );
    }

    // Sanitize the input
    const sanitized = InputSanitizer.sanitizeUserInput(stringInput);

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
    };
  }
}
