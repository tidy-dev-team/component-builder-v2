import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAndRefreshComponent, cloneComponentSet } from '../../buildComponent/componentValidator';
import { errorService } from '../../errors';

// Mock the main module with a mutable reference
const mockCachedComponentSet = { value: null as ComponentSetNode | null };
vi.mock('../../main', () => ({
  get cachedComponentSet() {
    return mockCachedComponentSet.value;
  },
}));

// Mock create-figma-plugin utilities
vi.mock('@create-figma-plugin/utilities', () => ({
  emit: vi.fn(),
  on: vi.fn(),
}));

describe('componentValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCachedComponentSet.value = null;
  });

  describe('validateAndRefreshComponent', () => {
    it('should return cached component set when valid', async () => {
      const mockComponentSet = {
        id: 'test-id',
        type: 'COMPONENT_SET',
        name: 'Test Component',
      } as ComponentSetNode;

      // Set the mock cached component set
      mockCachedComponentSet.value = mockComponentSet;

      const result = await validateAndRefreshComponent();

      expect(result.componentSet).toBe(mockComponentSet);
      expect(result.wasRefreshed).toBe(false);
    });

    it('should handle component refresh when cached component is invalid', async () => {
      // Mock invalid cached component
      mockCachedComponentSet.value = null;

      const { emit, on } = await import('@create-figma-plugin/utilities');
      const mockOn = on as any;
      
      // Mock successful refresh
      mockOn.mockImplementation((event: string, callback: Function) => {
        if (event === 'COMPONENT_SET_REFRESHED') {
          // Simulate refresh by setting the component
          setTimeout(() => {
            const mockComponentSet = {
              id: 'refreshed-id',
              type: 'COMPONENT_SET',
              name: 'Refreshed Component',
            } as ComponentSetNode;
            mockCachedComponentSet.value = mockComponentSet;
            callback(true);
          }, 0);
        }
        return vi.fn(); // unsubscribe function
      });

      const result = await validateAndRefreshComponent();

      expect(emit).toHaveBeenCalledWith('REFRESH_COMPONENT_SET');
      expect(result.wasRefreshed).toBe(true);
      expect(result.componentSet).toBeDefined();
    });

    it('should throw error when refresh fails', async () => {
      mockCachedComponentSet.value = null;

      const { on } = await import('@create-figma-plugin/utilities');
      const mockOn = on as any;
      
      // Mock failed refresh
      mockOn.mockImplementation((event: string, callback: Function) => {
        if (event === 'COMPONENT_SET_REFRESHED') {
          setTimeout(() => callback(false), 0);
        }
        return vi.fn();
      });

      await expect(validateAndRefreshComponent()).rejects.toThrow();
    });
  });

  describe('cloneComponentSet', () => {
    it('should successfully clone component set', () => {
      const mockClone = {
        id: 'cloned-id',
        type: 'COMPONENT_SET',
        name: 'Cloned Component',
      } as ComponentSetNode;

      const mockComponentSet = {
        id: 'original-id',
        type: 'COMPONENT_SET',
        name: 'Original Component',
        clone: vi.fn().mockReturnValue(mockClone),
      } as unknown as ComponentSetNode;

      const result = cloneComponentSet(mockComponentSet);

      expect(mockComponentSet.clone).toHaveBeenCalled();
      expect(result).toBe(mockClone);
    });

    it('should throw error when clone fails', () => {
      const mockComponentSet = {
        id: 'original-id',
        type: 'COMPONENT_SET',
        name: 'Original Component',
        clone: vi.fn().mockImplementation(() => {
          throw new Error('Clone failed');
        }),
      } as unknown as ComponentSetNode;

      expect(() => cloneComponentSet(mockComponentSet)).toThrow();
    });

    it('should throw error when clone returns null', () => {
      const mockComponentSet = {
        id: 'original-id',
        type: 'COMPONENT_SET',
        name: 'Original Component',
        clone: vi.fn().mockReturnValue(null),
      } as unknown as ComponentSetNode;

      expect(() => cloneComponentSet(mockComponentSet)).toThrow();
    });
  });
});