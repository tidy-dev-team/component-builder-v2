import { describe, it, expect } from 'vitest';
import { getEnabledProperties, isDependentProperty } from '../ui_utils';

describe('ui_utils', () => {
  describe('getEnabledProperties', () => {
    it('should return properties that are disabled', () => {
      const buildData = {
        prop1: true,
        prop2: false,
        prop3: true,
        prop4: false,
      };

      const result = getEnabledProperties(buildData);
      
      expect(result).toEqual({
        prop2: false,
        prop4: false,
      });
    });

    it('should return empty object when all properties are enabled', () => {
      const buildData = {
        prop1: true,
        prop2: true,
        prop3: true,
      };

      const result = getEnabledProperties(buildData);
      
      expect(result).toEqual({});
    });
  });

  describe('isDependentProperty', () => {
    it('should return true for text dependency properties', () => {
      const result = isDependentProperty('✏️ parentProp#value', 'parentProp');
      expect(result).toBe(true);
    });

    it('should return true for instance swap dependency properties', () => {
      const result = isDependentProperty('🔁 parentProp#value', 'parentProp');
      expect(result).toBe(true);
    });

    it('should return false for non-dependent properties', () => {
      const result = isDependentProperty('prop1', 'prop2');
      expect(result).toBe(false);
    });
  });
});