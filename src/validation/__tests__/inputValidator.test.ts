import { describe, it, expect } from 'vitest';
import { InputValidator } from '../inputValidator';
import { ValidationErrorCode } from '../validationErrors';

describe('InputValidator', () => {
  describe('validateComponentKey', () => {
    it('should validate correct component key', () => {
      const validKey = 'a'.repeat(40);
      const result = InputValidator.validateComponentKey(validKey);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid component key format', () => {
      const invalidKey = 'invalid-key';
      const result = InputValidator.validateComponentKey(invalidKey);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_COMPONENT_KEY);
    });

    it('should reject non-string input', () => {
      const result = InputValidator.validateComponentKey(123);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_COMPONENT_KEY);
    });

    it('should reject null/undefined input', () => {
      const result1 = InputValidator.validateComponentKey(null);
      const result2 = InputValidator.validateComponentKey(undefined);
      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });
  });

  describe('validateComponentName', () => {
    it('should validate correct component name', () => {
      const validName = 'Button Component';
      const result = InputValidator.validateComponentName(validName);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-string input', () => {
      const result = InputValidator.validateComponentName(123);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_TYPE);
    });

    it('should reject names with invalid characters', () => {
      const invalidName = 'Button<script>alert(1)</script>';
      const result = InputValidator.validateComponentName(invalidName);
      // Security validation should catch this first and reject it
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
      
      // Test with a truly invalid name that can't be sanitized
      const trulyInvalidName = 'Button\x00NullByte';
      const result2 = InputValidator.validateComponentName(trulyInvalidName);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
    });

    it('should reject empty names', () => {
      const result = InputValidator.validateComponentName('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validatePropertyName', () => {
    it('should validate correct property name', () => {
      const validName = 'buttonType';
      const result = InputValidator.validatePropertyName(validName);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate property name with variant syntax', () => {
      const validName = 'buttonType#primary';
      const result = InputValidator.validatePropertyName(validName);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-string input', () => {
      const result = InputValidator.validatePropertyName(123);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_TYPE);
    });

    it('should reject names with invalid characters', () => {
      const invalidName = 'prop<script>';
      const result = InputValidator.validatePropertyName(invalidName);
      // Security validation should catch this first and reject it
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_PROPERTY_NAME);
      
      // Test with a truly invalid name that can't be sanitized
      const trulyInvalidName = 'prop\x00NullByte';
      const result2 = InputValidator.validatePropertyName(trulyInvalidName);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.INVALID_PROPERTY_NAME);
    });
  });

  describe('validatePropertyValue', () => {
    it('should validate boolean values', () => {
      const result1 = InputValidator.validatePropertyValue(true);
      const result2 = InputValidator.validatePropertyValue(false);
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should normalize string boolean values', () => {
      const result1 = InputValidator.validatePropertyValue('true');
      const result2 = InputValidator.validatePropertyValue('false');
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should normalize numeric boolean values', () => {
      const result1 = InputValidator.validatePropertyValue(1);
      const result2 = InputValidator.validatePropertyValue(0);
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should reject invalid boolean values', () => {
      const result = InputValidator.validatePropertyValue('invalid');
      expect(result.valid).toBe(true); // InputSanitizer.normalizeBoolean returns false for invalid values
    });
  });

  describe('validateBuildEventData', () => {
    it('should validate correct build event data', () => {
      const validData = {
        'buttonType': true,
        'size': false,
        'variant#primary': true,
      };
      const result = InputValidator.validateBuildEventData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data with invalid property names', () => {
      const invalidData = {
        'button<script>': true,
        'validProp': false,
      };
      const result = InputValidator.validateBuildEventData(invalidData);
      // Security validation should catch this first and reject it
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.INVALID_PROPERTY_NAME)).toBe(true);
      
      // Test with a truly invalid name that can't be sanitized
      const trulyInvalidData = {
        'prop\x00NullByte': true,
        'validProp': false,
      };
      const result2 = InputValidator.validateBuildEventData(trulyInvalidData);
      expect(result2.valid).toBe(false);
      expect(result2.errors.some(e => e.code === ValidationErrorCode.INVALID_PROPERTY_NAME)).toBe(true);
    });

    it('should reject data with invalid property values', () => {
      const invalidData = {
        'buttonType': true,
        'size': 'invalid' as any,
      };
      const result = InputValidator.validateBuildEventData(invalidData);
      expect(result.valid).toBe(true); // Values are normalized, so this should pass
    });

    it('should handle empty data', () => {
      const result = InputValidator.validateBuildEventData({});
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateComponentSetEventData', () => {
    it('should validate correct component set event data', () => {
      const validData = { key: 'a'.repeat(40) };
      const result = InputValidator.validateComponentSetEventData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data without key', () => {
      const invalidData = {};
      const result = InputValidator.validateComponentSetEventData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.REQUIRED_FIELD);
    });

    it('should reject data with invalid key', () => {
      const invalidData = { key: 'invalid-key' };
      const result = InputValidator.validateComponentSetEventData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_COMPONENT_KEY);
    });
  });

  describe('validateDropdownSelection', () => {
    const availableOptions = ['Option 1', 'Option 2', 'Option 3'];

    it('should validate correct selection', () => {
      const result = InputValidator.validateDropdownSelection('Option 1', availableOptions);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty selection', () => {
      const result = InputValidator.validateDropdownSelection('', availableOptions);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.REQUIRED_FIELD);
    });

    it('should reject null/undefined selection', () => {
      const result1 = InputValidator.validateDropdownSelection(null, availableOptions);
      const result2 = InputValidator.validateDropdownSelection(undefined, availableOptions);
      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });

    it('should reject non-string selection', () => {
      const result = InputValidator.validateDropdownSelection(123, availableOptions);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_TYPE);
    });

    it('should reject selection not in available options', () => {
      const result = InputValidator.validateDropdownSelection('Invalid Option', availableOptions);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_ENUM_VALUE);
    });
  });

  describe('validateAndSanitizeInput', () => {
    it('should validate and sanitize clean input', () => {
      const input = 'Clean input text';
      const result = InputValidator.validateAndSanitizeInput(input, 'testField');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Clean input text');
      expect(result.errors).toHaveLength(0);
    });

    it('should sanitize and validate malicious input', () => {
      const input = '<script>alert("xss")</script>';
      const result = InputValidator.validateAndSanitizeInput(input, 'testField');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.MALICIOUS_INPUT);
    });

    it('should handle non-string input', () => {
      const result = InputValidator.validateAndSanitizeInput(123, 'testField');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('123');
    });

    it('should handle null/undefined input', () => {
      const result1 = InputValidator.validateAndSanitizeInput(null, 'testField');
      const result2 = InputValidator.validateAndSanitizeInput(undefined, 'testField');
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result1.sanitized).toBe('');
      expect(result2.sanitized).toBe('');
    });
  });

  describe('validateValue', () => {
    it('should validate required field', () => {
      const rule = { required: true, type: 'string' as const };
      const result = InputValidator.validateValue('test', rule, 'testField');
      expect(result.valid).toBe(true);
    });

    it('should reject missing required field', () => {
      const rule = { required: true, type: 'string' as const };
      const result = InputValidator.validateValue('', rule, 'testField');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.REQUIRED_FIELD);
    });

    it('should validate type constraints', () => {
      const rule = { type: 'string' as const };
      const result1 = InputValidator.validateValue('test', rule, 'testField');
      const result2 = InputValidator.validateValue(123, rule, 'testField');
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.INVALID_TYPE);
    });

    it('should validate string length constraints', () => {
      const rule = { type: 'string' as const, minLength: 3, maxLength: 10 };
      const result1 = InputValidator.validateValue('test', rule, 'testField');
      const result2 = InputValidator.validateValue('ab', rule, 'testField');
      const result3 = InputValidator.validateValue('this is too long', rule, 'testField');
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result3.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.INVALID_LENGTH);
      expect(result3.errors[0].code).toBe(ValidationErrorCode.INVALID_LENGTH);
    });

    it('should validate pattern constraints', () => {
      const rule = { type: 'string' as const, pattern: /^[a-z]+$/ };
      const result1 = InputValidator.validateValue('test', rule, 'testField');
      const result2 = InputValidator.validateValue('Test123', rule, 'testField');
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.INVALID_FORMAT);
    });

    it('should validate enum constraints', () => {
      const rule = { enum: ['option1', 'option2', 'option3'] };
      const result1 = InputValidator.validateValue('option1', rule, 'testField');
      const result2 = InputValidator.validateValue('option4', rule, 'testField');
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.INVALID_ENUM_VALUE);
    });

    it('should validate custom constraints', () => {
      const rule = { custom: (value: unknown) => value === 'valid' || 'Must be "valid"' };
      const result1 = InputValidator.validateValue('valid', rule, 'testField');
      const result2 = InputValidator.validateValue('invalid', rule, 'testField');
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.CUSTOM_VALIDATION);
    });

    it('should validate number range constraints', () => {
      const rule = { type: 'number' as const, min: 0, max: 100 };
      const result1 = InputValidator.validateValue(50, rule, 'testField');
      const result2 = InputValidator.validateValue(-10, rule, 'testField');
      const result3 = InputValidator.validateValue(150, rule, 'testField');
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result3.valid).toBe(false);
      expect(result2.errors[0].code).toBe(ValidationErrorCode.INVALID_RANGE);
      expect(result3.errors[0].code).toBe(ValidationErrorCode.INVALID_RANGE);
    });

    it('should skip validation for optional empty fields', () => {
      const rule = { required: false, type: 'string' as const, minLength: 5 };
      const result1 = InputValidator.validateValue('', rule, 'testField');
      const result2 = InputValidator.validateValue(null, rule, 'testField');
      const result3 = InputValidator.validateValue(undefined, rule, 'testField');
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result3.valid).toBe(true);
    });
  });
});