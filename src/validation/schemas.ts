// Validation schemas for different input types

import { ValidationErrorCode } from "./validationErrors";

export interface ValidationRule {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "object" | "array";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: unknown[];
  custom?: (value: unknown) => boolean | string;
  sanitize?: (value: unknown) => unknown;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

// Component validation schemas
export const componentKeySchema: ValidationRule = {
  required: true,
  type: "string",
  minLength: 1,
  maxLength: 100,
  pattern: /^[a-zA-Z0-9_-]+$/,
  custom: (value) => {
    if (typeof value !== "string") return false;
    // Figma component keys are typically 40-character hex strings
    const figmaKeyPattern = /^[a-f0-9]{40}$/i;
    return figmaKeyPattern.test(value) || "Invalid Figma component key format";
  },
};

export const componentNameSchema: ValidationRule = {
  required: true,
  type: "string",
  minLength: 1,
  maxLength: 255,
  pattern: /^[\w\s\-_().]+$/,
  sanitize: (value) => {
    if (typeof value !== "string") return value;
    // Remove potentially harmful characters
    return value.replace(/[<>'"&]/g, "").trim();
  },
};

export const componentSelectionSchema: ValidationRule = {
  required: true,
  type: "string",
  minLength: 1,
  enum: [], // Will be populated with available component names
};

// Property validation schemas
export const propertyNameSchema: ValidationRule = {
  required: true,
  type: "string",
  minLength: 1,
  maxLength: 100,
  pattern: /^[\w\s\-_#]+$/,
  sanitize: (value) => {
    if (typeof value !== "string") return value;
    // Remove potentially harmful characters while preserving # for variants
    return value.replace(/[<>'"&]/g, "").trim();
  },
};

export const propertyValueSchema: ValidationRule = {
  required: true,
  type: "boolean",
  custom: (value) => {
    return typeof value === "boolean" || "Property value must be a boolean";
  },
};

// Build data validation schema
export const buildDataSchema: ValidationSchema = {
  // Dynamic schema - will be validated based on available properties
};

// Component data validation schema
export const componentDataSchema: ValidationSchema = {
  name: componentNameSchema,
  key: componentKeySchema,
  type: {
    required: true,
    type: "string",
    enum: ["component", "componentSet"],
  },
};

// Event data validation schemas
export const componentSetEventSchema: ValidationSchema = {
  key: componentKeySchema,
};

export const buildEventSchema: ValidationSchema = {
  // Will be dynamically validated based on property names
};

// UI validation schemas
export const dropdownValueSchema: ValidationRule = {
  required: false,
  type: "string",
  custom: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value !== "string") return false;
    return value.length > 0 || "Please select a valid option";
  },
};

export const checkboxStateSchema: ValidationRule = {
  required: true,
  type: "boolean",
};

// Security validation rules
export const securityRules = {
  // Check for potential XSS patterns (script tags and event handlers)
  xssPattern:
    /(<script[^>]*>.*?<\/script>|<[^>]*\bon\w+\s*=|javascript:|<script|<\/script>)/i,

  // Check for SQL injection patterns - more specific to avoid false positives with UI component names
  sqlInjectionPattern:
    /((\b(SELECT)\s+(.*\s+)?(FROM|WHERE|ORDER|GROUP)\b)|(\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\s+(INTO|SET|TABLE|DATABASE|SCHEMA|FROM)\b)|(;|--|\|\|)|(\/\*|\*\/))/i,

  // Check for path traversal
  pathTraversalPattern: /(\.\.[\/\\])+/,

  // Check for null bytes
  nullBytePattern: /\x00/,

  // Maximum input length to prevent DoS
  maxInputLength: 10000,
};

export function validateAgainstSecurity(input: string): boolean {
  const {
    xssPattern,
    sqlInjectionPattern,
    pathTraversalPattern,
    nullBytePattern,
    maxInputLength,
  } = securityRules;

  // Check input length
  if (input.length > maxInputLength) {
    return false;
  }

  // Check for malicious patterns
  if (
    xssPattern.test(input) ||
    sqlInjectionPattern.test(input) ||
    pathTraversalPattern.test(input) ||
    nullBytePattern.test(input)
  ) {
    return false;
  }

  return true;
}

// Custom validation rules for Figma-specific data
export const figmaValidationRules = {
  isValidComponentKey: (key: string): boolean => {
    return /^[a-f0-9]{40}$/.test(key);
  },

  isValidPropertyName: (name: string): boolean => {
    // Allow alphanumeric, spaces, hyphens, underscores, and # for variants
    return /^[\w\s\-_#]+$/.test(name) && name.length > 0 && name.length <= 100;
  },

  isValidVariantOption: (option: string): boolean => {
    // Variant options should not contain special characters except those allowed in Figma
    return (
      /^[\w\s\-_]+$/.test(option) && option.length > 0 && option.length <= 50
    );
  },

  isValidComponentName: (name: string): boolean => {
    // Component names should be reasonable and not contain harmful characters
    return (
      /^[\w\s\-_().]+$/.test(name) && name.length > 0 && name.length <= 255
    );
  },
};
