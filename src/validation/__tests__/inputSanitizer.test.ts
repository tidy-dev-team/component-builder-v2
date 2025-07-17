import { describe, it, expect } from 'vitest';
import { InputSanitizer } from '../inputSanitizer';

describe('InputSanitizer', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace by default', () => {
      const result = InputSanitizer.sanitizeString('  test  ');
      expect(result).toBe('test');
    });

    it('should remove HTML tags when requested', () => {
      const result = InputSanitizer.sanitizeString('<div>test</div>', { removeHtml: true });
      expect(result).toBe('test');
    });

    it('should remove special characters when requested', () => {
      const result = InputSanitizer.sanitizeString('test<>&"\'', { removeSpecialChars: true });
      expect(result).toBe('test');
    });

    it('should apply allowed characters filter', () => {
      const result = InputSanitizer.sanitizeString('test123!@#', { allowedChars: /[^a-z]/g });
      expect(result).toBe('test');
    });

    it('should truncate to maximum length', () => {
      const result = InputSanitizer.sanitizeString('this is a long string', { maxLength: 10 });
      expect(result).toBe('this is a ');
    });

    it('should handle non-string input', () => {
      const result = InputSanitizer.sanitizeString(123 as any);
      expect(result).toBe('123');
    });

    it('should preserve text when no options provided', () => {
      const result = InputSanitizer.sanitizeString('test');
      expect(result).toBe('test');
    });
  });

  describe('sanitizeComponentName', () => {
    it('should sanitize valid component name', () => {
      const result = InputSanitizer.sanitizeComponentName('Button Component');
      expect(result).toBe('Button Component');
    });

    it('should remove HTML and special characters', () => {
      const result = InputSanitizer.sanitizeComponentName('Button<script>alert(1)</script>');
      expect(result).toBe('Buttonalert(1)');
    });

    it('should handle underscores and hyphens', () => {
      const result = InputSanitizer.sanitizeComponentName('Button_Component-v2');
      expect(result).toBe('Button_Component-v2');
    });

    it('should truncate long names', () => {
      const longName = 'a'.repeat(300);
      const result = InputSanitizer.sanitizeComponentName(longName);
      expect(result.length).toBe(255);
    });
  });

  describe('sanitizePropertyName', () => {
    it('should sanitize valid property name', () => {
      const result = InputSanitizer.sanitizePropertyName('buttonType');
      expect(result).toBe('buttonType');
    });

    it('should preserve variant syntax', () => {
      const result = InputSanitizer.sanitizePropertyName('buttonType#primary');
      expect(result).toBe('buttonType#primary');
    });

    it('should remove HTML and special characters', () => {
      const result = InputSanitizer.sanitizePropertyName('prop<script>');
      expect(result).toBe('propscript');
    });

    it('should truncate long names', () => {
      const longName = 'a'.repeat(150);
      const result = InputSanitizer.sanitizePropertyName(longName);
      expect(result.length).toBe(100);
    });
  });

  describe('sanitizeComponentKey', () => {
    it('should sanitize valid component key', () => {
      const validKey = 'abcdef1234567890'.repeat(2) + 'abcdef12';
      const result = InputSanitizer.sanitizeComponentKey(validKey);
      expect(result).toBe(validKey.toLowerCase());
    });

    it('should remove non-hex characters', () => {
      const invalidKey = 'abcdef1234567890abcdef1234567890abcdef12xyz';
      const result = InputSanitizer.sanitizeComponentKey(invalidKey);
      expect(result).toBe('abcdef1234567890abcdef1234567890abcdef12');
    });

    it('should handle mixed case', () => {
      const mixedKey = 'ABCDEF1234567890abcdef1234567890ABCDEF12';
      const result = InputSanitizer.sanitizeComponentKey(mixedKey);
      expect(result).toBe(mixedKey.toLowerCase());
    });

    it('should return empty for non-string input', () => {
      const result = InputSanitizer.sanitizeComponentKey(123 as any);
      expect(result).toBe('');
    });

    it('should return partial key if not exactly 40 chars', () => {
      const shortKey = 'abcdef1234567890abcdef12';
      const result = InputSanitizer.sanitizeComponentKey(shortKey);
      expect(result).toBe(shortKey);
    });
  });

  describe('sanitizeUserInput', () => {
    it('should sanitize clean user input', () => {
      const result = InputSanitizer.sanitizeUserInput('Clean input text');
      expect(result).toBe('Clean input text');
    });

    it('should return empty string for malicious input', () => {
      const result = InputSanitizer.sanitizeUserInput('<script>alert("xss")</script>');
      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      const result = InputSanitizer.sanitizeUserInput(123 as any);
      expect(result).toBe('123');
    });

    it('should truncate long input', () => {
      const longInput = 'a'.repeat(1500);
      const result = InputSanitizer.sanitizeUserInput(longInput);
      expect(result.length).toBe(1000);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize object keys and values', () => {
      const input = {
        'key<script>': 'value<script>',
        'normalKey': 'normalValue',
      };
      const result = InputSanitizer.sanitizeObject(input);
      expect(result).toEqual({
        'keyscript': 'normalValue',
        'normalKey': 'normalValue',
      });
    });

    it('should handle nested objects', () => {
      const input = {
        'parentKey': {
          'childKey<script>': 'childValue',
        },
      };
      const result = InputSanitizer.sanitizeObject(input);
      expect(result).toEqual({
        'parentKey': {
          'childKeyscript': 'childValue',
        },
      });
    });

    it('should preserve non-string values', () => {
      const input = {
        'stringKey': 'stringValue',
        'numberKey': 123,
        'booleanKey': true,
        'nullKey': null,
      };
      const result = InputSanitizer.sanitizeObject(input);
      expect(result).toEqual({
        'stringKey': 'stringValue',
        'numberKey': 123,
        'booleanKey': true,
        'nullKey': null,
      });
    });
  });

  describe('sanitizeStringArray', () => {
    it('should sanitize array of strings', () => {
      const input = ['clean', '<script>malicious</script>', 'another clean'];
      const result = InputSanitizer.sanitizeStringArray(input);
      expect(result).toEqual(['clean', 'another clean']);
    });

    it('should filter out non-string items', () => {
      const input = ['string', 123, true, null, 'another string'] as any;
      const result = InputSanitizer.sanitizeStringArray(input);
      expect(result).toEqual(['string', 'another string']);
    });

    it('should return empty array for non-array input', () => {
      const result = InputSanitizer.sanitizeStringArray('not an array' as any);
      expect(result).toEqual([]);
    });

    it('should filter out empty strings after sanitization', () => {
      const input = ['valid', '', '<script></script>', 'also valid'];
      const result = InputSanitizer.sanitizeStringArray(input);
      expect(result).toEqual(['valid', 'also valid']);
    });
  });

  describe('deepSanitize', () => {
    it('should sanitize strings', () => {
      const result = InputSanitizer.deepSanitize('test<script>');
      expect(result).toBe('test');
    });

    it('should sanitize arrays', () => {
      const input = ['clean', '<script>malicious</script>', 123];
      const result = InputSanitizer.deepSanitize(input);
      expect(result).toEqual(['clean', '', 123]);
    });

    it('should sanitize objects', () => {
      const input = {
        'key<script>': 'value<script>',
        'number': 123,
        'nested': {
          'innerKey<script>': 'innerValue',
        },
      };
      const result = InputSanitizer.deepSanitize(input);
      expect(result).toEqual({
        'keyscript': 'value',
        'number': 123,
        'nested': {
          'innerKeyscript': 'innerValue',
        },
      });
    });

    it('should handle primitive values', () => {
      expect(InputSanitizer.deepSanitize(123)).toBe(123);
      expect(InputSanitizer.deepSanitize(true)).toBe(true);
      expect(InputSanitizer.deepSanitize(null)).toBe(null);
    });
  });

  describe('normalizeBoolean', () => {
    it('should preserve actual booleans', () => {
      expect(InputSanitizer.normalizeBoolean(true)).toBe(true);
      expect(InputSanitizer.normalizeBoolean(false)).toBe(false);
    });

    it('should normalize string booleans', () => {
      expect(InputSanitizer.normalizeBoolean('true')).toBe(true);
      expect(InputSanitizer.normalizeBoolean('TRUE')).toBe(true);
      expect(InputSanitizer.normalizeBoolean('1')).toBe(true);
      expect(InputSanitizer.normalizeBoolean('yes')).toBe(true);
      expect(InputSanitizer.normalizeBoolean('YES')).toBe(true);
      
      expect(InputSanitizer.normalizeBoolean('false')).toBe(false);
      expect(InputSanitizer.normalizeBoolean('FALSE')).toBe(false);
      expect(InputSanitizer.normalizeBoolean('0')).toBe(false);
      expect(InputSanitizer.normalizeBoolean('no')).toBe(false);
      expect(InputSanitizer.normalizeBoolean('random')).toBe(false);
    });

    it('should normalize numbers', () => {
      expect(InputSanitizer.normalizeBoolean(1)).toBe(true);
      expect(InputSanitizer.normalizeBoolean(42)).toBe(true);
      expect(InputSanitizer.normalizeBoolean(0)).toBe(false);
      expect(InputSanitizer.normalizeBoolean(-1)).toBe(true);
    });

    it('should handle other types', () => {
      expect(InputSanitizer.normalizeBoolean(null)).toBe(false);
      expect(InputSanitizer.normalizeBoolean(undefined)).toBe(false);
      expect(InputSanitizer.normalizeBoolean({})).toBe(false);
      expect(InputSanitizer.normalizeBoolean([])).toBe(false);
    });
  });

  describe('ensureValidPropertyName', () => {
    it('should return valid property name', () => {
      const result = InputSanitizer.ensureValidPropertyName('buttonType');
      expect(result).toBe('buttonType');
    });

    it('should return empty string for non-string input', () => {
      const result = InputSanitizer.ensureValidPropertyName(123);
      expect(result).toBe('');
    });

    it('should normalize spaces', () => {
      const result = InputSanitizer.ensureValidPropertyName('  button   type  ');
      expect(result).toBe('button type');
    });

    it('should return empty string for empty input', () => {
      const result = InputSanitizer.ensureValidPropertyName('');
      expect(result).toBe('');
    });
  });

  describe('ensureValidComponentKey', () => {
    it('should return valid component key', () => {
      const validKey = 'abcdef1234567890abcdef1234567890abcdef12';
      const result = InputSanitizer.ensureValidComponentKey(validKey);
      expect(result).toBe(validKey);
    });

    it('should return empty string for non-string input', () => {
      const result = InputSanitizer.ensureValidComponentKey(123);
      expect(result).toBe('');
    });

    it('should return empty string for invalid format', () => {
      const result = InputSanitizer.ensureValidComponentKey('invalid-key');
      expect(result).toBe('');
    });

    it('should return empty string for wrong length', () => {
      const result = InputSanitizer.ensureValidComponentKey('abcdef1234567890abcdef12');
      expect(result).toBe('');
    });
  });
});