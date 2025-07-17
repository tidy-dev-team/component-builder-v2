import { describe, it, expect } from 'vitest';
import { validateAgainstSecurity, figmaValidationRules, securityRules } from '../schemas';

describe('Security Validation', () => {
  describe('validateAgainstSecurity', () => {
    it('should pass clean input', () => {
      const result = validateAgainstSecurity('This is clean input');
      expect(result).toBe(true);
    });

    it('should reject XSS attempts', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        '<SCRIPT>alert("xss")</SCRIPT>',
        '<script src="malicious.js"></script>',
        '<img src="x" onerror="alert(1)">',
      ];
      
      xssInputs.forEach(input => {
        const result = validateAgainstSecurity(input);
        expect(result).toBe(false);
      });
    });

    it('should reject SQL injection attempts', () => {
      const sqlInputs = [
        "'; DROP TABLE users; --",
        "SELECT * FROM users WHERE id = 1",
        "INSERT INTO users VALUES ('test')",
        "UPDATE users SET name = 'test'",
        "DELETE FROM users WHERE id = 1",
        "UNION SELECT * FROM passwords",
      ];
      
      sqlInputs.forEach(input => {
        const result = validateAgainstSecurity(input);
        expect(result).toBe(false);
      });
    });

    it('should reject path traversal attempts', () => {
      const pathInputs = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '....//....//....//etc/passwd',
      ];
      
      pathInputs.forEach(input => {
        const result = validateAgainstSecurity(input);
        expect(result).toBe(false);
      });
    });

    it('should reject null byte attacks', () => {
      const nullByteInput = 'test\x00malicious';
      const result = validateAgainstSecurity(nullByteInput);
      expect(result).toBe(false);
    });

    it('should reject input that exceeds maximum length', () => {
      const longInput = 'a'.repeat(securityRules.maxInputLength + 1);
      const result = validateAgainstSecurity(longInput);
      expect(result).toBe(false);
    });

    it('should accept input at maximum length', () => {
      const maxInput = 'a'.repeat(securityRules.maxInputLength);
      const result = validateAgainstSecurity(maxInput);
      expect(result).toBe(true);
    });
  });

  describe('Security Rules', () => {
    it('should have correct XSS pattern', () => {
      const { xssPattern } = securityRules;
      expect(xssPattern.test('<script>alert(1)</script>')).toBe(true);
      expect(xssPattern.test('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
      expect(xssPattern.test('normal text')).toBe(false);
    });

    it('should have correct SQL injection pattern', () => {
      const { sqlInjectionPattern } = securityRules;
      expect(sqlInjectionPattern.test('SELECT * FROM users')).toBe(true);
      expect(sqlInjectionPattern.test('DROP TABLE users')).toBe(true);
      expect(sqlInjectionPattern.test("'; DROP TABLE users; --")).toBe(true);
      expect(sqlInjectionPattern.test('normal text')).toBe(false);
    });

    it('should have correct path traversal pattern', () => {
      const { pathTraversalPattern } = securityRules;
      expect(pathTraversalPattern.test('../../../etc/passwd')).toBe(true);
      expect(pathTraversalPattern.test('..\\..\\..\\windows\\system32')).toBe(true);
      expect(pathTraversalPattern.test('normal/path')).toBe(false);
    });

    it('should have correct null byte pattern', () => {
      const { nullBytePattern } = securityRules;
      expect(nullBytePattern.test('test\x00malicious')).toBe(true);
      expect(nullBytePattern.test('normal text')).toBe(false);
    });
  });
});

describe('Figma Validation Rules', () => {
  describe('isValidComponentKey', () => {
    it('should validate correct component key', () => {
      const validKey = 'abcdef1234567890abcdef1234567890abcdef12';
      const result = figmaValidationRules.isValidComponentKey(validKey);
      expect(result).toBe(true);
    });

    it('should reject invalid component key', () => {
      const invalidKeys = [
        'invalid-key',
        'abcdef1234567890abcdef1234567890abcdef1', // too short
        'abcdef1234567890abcdef1234567890abcdef123', // too long
        'ABCDEF1234567890ABCDEF1234567890ABCDEF12', // uppercase
        'abcdef1234567890abcdef1234567890abcdefxy', // invalid chars
      ];
      
      invalidKeys.forEach(key => {
        const result = figmaValidationRules.isValidComponentKey(key);
        expect(result).toBe(false);
      });
    });
  });

  describe('isValidPropertyName', () => {
    it('should validate correct property names', () => {
      const validNames = [
        'buttonType',
        'button_type',
        'button-type',
        'button type',
        'buttonType#primary',
        'size',
        'variant_name',
      ];
      
      validNames.forEach(name => {
        const result = figmaValidationRules.isValidPropertyName(name);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid property names', () => {
      const invalidNames = [
        '', // empty
        'a'.repeat(101), // too long
        'prop<script>', // invalid chars
        'prop&value', // invalid chars
        'prop"value', // invalid chars
      ];
      
      invalidNames.forEach(name => {
        const result = figmaValidationRules.isValidPropertyName(name);
        expect(result).toBe(false);
      });
    });
  });

  describe('isValidVariantOption', () => {
    it('should validate correct variant options', () => {
      const validOptions = [
        'primary',
        'secondary',
        'large',
        'small',
        'button_variant',
        'button-variant',
      ];
      
      validOptions.forEach(option => {
        const result = figmaValidationRules.isValidVariantOption(option);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid variant options', () => {
      const invalidOptions = [
        '', // empty
        'a'.repeat(51), // too long
        'option#value', // invalid chars
        'option<script>', // invalid chars
        'option&value', // invalid chars
      ];
      
      invalidOptions.forEach(option => {
        const result = figmaValidationRules.isValidVariantOption(option);
        expect(result).toBe(false);
      });
    });
  });

  describe('isValidComponentName', () => {
    it('should validate correct component names', () => {
      const validNames = [
        'Button',
        'Button Component',
        'Button_Component',
        'Button-Component',
        'Button.Component',
        'Button (v2)',
        'Button_Component-v2',
      ];
      
      validNames.forEach(name => {
        const result = figmaValidationRules.isValidComponentName(name);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid component names', () => {
      const invalidNames = [
        '', // empty
        'a'.repeat(256), // too long
        'Button<script>', // invalid chars
        'Button&Component', // invalid chars
        'Button"Component', // invalid chars
        'Button\'Component', // invalid chars
      ];
      
      invalidNames.forEach(name => {
        const result = figmaValidationRules.isValidComponentName(name);
        expect(result).toBe(false);
      });
    });
  });
});