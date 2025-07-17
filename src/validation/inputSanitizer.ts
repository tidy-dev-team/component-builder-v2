// Input sanitization utilities

import { validateAgainstSecurity } from './schemas';

export interface SanitizationOptions {
  trim?: boolean;
  removeHtml?: boolean;
  removeSpecialChars?: boolean;
  maxLength?: number;
  allowedChars?: RegExp;
}

export class InputSanitizer {
  /**
   * Sanitize a string input by removing/cleaning potentially harmful content
   */
  static sanitizeString(
    input: string,
    options: SanitizationOptions = {}
  ): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    let sanitized = input;

    // Trim whitespace
    if (options.trim !== false) {
      sanitized = sanitized.trim();
    }

    // Remove HTML tags
    if (options.removeHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove special characters that could be harmful
    if (options.removeSpecialChars) {
      sanitized = sanitized.replace(/[<>'"&]/g, '');
    }

    // Apply allowed characters filter
    if (options.allowedChars) {
      sanitized = sanitized.replace(options.allowedChars, '');
    }

    // Truncate to maximum length
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize component name for safe usage
   */
  static sanitizeComponentName(name: string): string {
    return this.sanitizeString(name, {
      trim: true,
      removeHtml: true,
      removeSpecialChars: true,
      maxLength: 255,
      allowedChars: /[^\w\s\-_().]/g,
    });
  }

  /**
   * Sanitize property name for safe usage
   */
  static sanitizePropertyName(name: string): string {
    return this.sanitizeString(name, {
      trim: true,
      removeHtml: true,
      removeSpecialChars: true,
      maxLength: 100,
      allowedChars: /[^\w\s\-_#]/g, // Allow # for variant options
    });
  }

  /**
   * Sanitize component key (should be hex string)
   */
  static sanitizeComponentKey(key: string): string {
    if (typeof key !== 'string') {
      return '';
    }

    // Remove all non-hex characters
    const sanitized = key.replace(/[^a-f0-9]/gi, '');
    
    // Ensure it's the right length for a Figma component key
    if (sanitized.length === 40) {
      return sanitized.toLowerCase();
    }
    
    return sanitized;
  }

  /**
   * Sanitize user input for general use
   */
  static sanitizeUserInput(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    // Check against security rules first
    if (!validateAgainstSecurity(input)) {
      // If input fails security validation, return empty string
      return '';
    }

    return this.sanitizeString(input, {
      trim: true,
      removeHtml: true,
      removeSpecialChars: true,
      maxLength: 1000,
    });
  }

  /**
   * Sanitize object keys and values recursively
   */
  static sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeString(key, {
        trim: true,
        removeSpecialChars: true,
        maxLength: 100,
      });

      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeUserInput(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[sanitizedKey] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize array of strings
   */
  static sanitizeStringArray(arr: string[]): string[] {
    if (!Array.isArray(arr)) {
      return [];
    }

    return arr
      .filter(item => typeof item === 'string')
      .map(item => this.sanitizeUserInput(item))
      .filter(item => item.length > 0);
  }

  /**
   * Deep sanitize any value
   */
  static deepSanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.sanitizeUserInput(value);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.deepSanitize(item));
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        const sanitizedKey = this.sanitizeString(key, {
          trim: true,
          removeSpecialChars: true,
          maxLength: 100,
        });
        sanitized[sanitizedKey] = this.deepSanitize(val);
      }
      return sanitized;
    }

    return value;
  }

  /**
   * Normalize boolean values from various input types
   */
  static normalizeBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    return false;
  }

  /**
   * Ensure a value is a valid property name
   */
  static ensureValidPropertyName(name: unknown): string {
    if (typeof name !== 'string') {
      return '';
    }

    const sanitized = this.sanitizePropertyName(name);
    
    // Ensure it's not empty and follows basic rules
    if (sanitized.length === 0) {
      return '';
    }

    // Remove any duplicate spaces and normalize
    return sanitized.replace(/\s+/g, ' ').trim();
  }

  /**
   * Ensure a value is a valid component key
   */
  static ensureValidComponentKey(key: unknown): string {
    if (typeof key !== 'string') {
      return '';
    }

    const sanitized = this.sanitizeComponentKey(key);
    
    // Validate format
    if (!/^[a-f0-9]{40}$/i.test(sanitized)) {
      return '';
    }

    return sanitized;
  }
}