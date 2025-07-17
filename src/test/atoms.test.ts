import { describe, it, expect } from 'vitest';
import { atom } from 'jotai';
import { selectedComponentAtom, selectedComponentPropertiesAtom, propertyUsedStatesAtom } from '../state/atoms';

describe('atoms', () => {
  describe('selectedComponentAtom', () => {
    it('should have initial value of null', () => {
      const initialValue = selectedComponentAtom.init;
      expect(initialValue).toBe(null);
    });
  });

  describe('selectedComponentPropertiesAtom', () => {
    it('should have initial value of empty array', () => {
      const initialValue = selectedComponentPropertiesAtom.init;
      expect(initialValue).toEqual([]);
    });
  });

  describe('propertyUsedStatesAtom', () => {
    it('should have initial value of empty object', () => {
      const initialValue = propertyUsedStatesAtom.init;
      expect(initialValue).toEqual({});
    });
  });
});