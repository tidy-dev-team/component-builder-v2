import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orchestrateBuild, validateBuildData, getBuildSummary } from '../../buildComponent/buildOrchestrator';
import { BuildEventData } from '../../types';

// Mock all the sub-modules
vi.mock('../../buildComponent/componentValidator', () => ({
  validateAndRefreshComponent: vi.fn(),
  cloneComponentSet: vi.fn(),
}));

vi.mock('../../buildComponent/variantProcessor', () => ({
  processVariantProperties: vi.fn(),
}));

vi.mock('../../buildComponent/propertyProcessor', () => ({
  processNonVariantProperties: vi.fn(),
}));

vi.mock('../../buildComponent/canvasRenderer', () => ({
  renderToCanvas: vi.fn(),
  validateCanvasAccess: vi.fn(),
  getCanvasInfo: vi.fn(),
}));

vi.mock('../../ui_utils', () => ({
  getEnabledProperties: vi.fn(),
}));

describe('buildOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateBuildData', () => {
    it('should pass validation for valid build data', () => {
      const validData: BuildEventData = {
        property1: true,
        property2: false,
        'variant#option1': true,
        'variant#option2': false,
      };

      expect(() => validateBuildData(validData)).not.toThrow();
    });

    it('should throw error for invalid build data type', () => {
      expect(() => validateBuildData(null as any)).toThrow();
      expect(() => validateBuildData('invalid' as any)).toThrow();
      expect(() => validateBuildData(123 as any)).toThrow();
    });

    it('should throw error for empty build data', () => {
      expect(() => validateBuildData({})).toThrow();
    });

    it('should throw error for non-boolean values', () => {
      const invalidData = {
        property1: true,
        property2: 'not-boolean',
      } as any;

      expect(() => validateBuildData(invalidData)).toThrow();
    });
  });

  describe('getBuildSummary', () => {
    it('should return correct summary statistics', () => {
      const buildData: BuildEventData = {
        property1: true,
        property2: false,
        property3: true,
        'variant#option1': true,
        'variant#option2': false,
        'variant2#optionA': true,
      };

      const summary = getBuildSummary(buildData);

      expect(summary.totalProperties).toBe(6);
      expect(summary.enabledProperties).toBe(4);
      expect(summary.disabledProperties).toBe(2);
      expect(summary.variantProperties).toBe(3);
      expect(summary.nonVariantProperties).toBe(3);
    });

    it('should handle empty build data', () => {
      const summary = getBuildSummary({});

      expect(summary.totalProperties).toBe(0);
      expect(summary.enabledProperties).toBe(0);
      expect(summary.disabledProperties).toBe(0);
      expect(summary.variantProperties).toBe(0);
      expect(summary.nonVariantProperties).toBe(0);
    });
  });

  describe('orchestrateBuild', () => {
    it('should orchestrate build process successfully', async () => {
      const buildData: BuildEventData = {
        property1: true,
        property2: false,
      };

      // Mock all the dependencies
      const { validateAndRefreshComponent, cloneComponentSet } = await import('../../buildComponent/componentValidator');
      const { processVariantProperties } = await import('../../buildComponent/variantProcessor');
      const { processNonVariantProperties } = await import('../../buildComponent/propertyProcessor');
      const { renderToCanvas, validateCanvasAccess, getCanvasInfo } = await import('../../buildComponent/canvasRenderer');
      const { getEnabledProperties } = await import('../../ui_utils');

      const mockComponentSet = { id: 'test', name: 'Test Component' } as ComponentSetNode;
      const mockClonedComponentSet = { id: 'cloned', name: 'Cloned Component' } as ComponentSetNode;

      (validateAndRefreshComponent as any).mockResolvedValue({
        componentSet: mockComponentSet,
        wasRefreshed: false,
      });

      (cloneComponentSet as any).mockReturnValue(mockClonedComponentSet);

      (processVariantProperties as any).mockReturnValue({
        processedVariants: ['variant1'],
        skippedVariants: [],
        errors: [],
      });

      (processNonVariantProperties as any).mockReturnValue({
        processedProperties: ['property1'],
        skippedProperties: [],
        deletedElements: 2,
        errors: [],
      });

      (renderToCanvas as any).mockReturnValue({
        success: true,
        componentSet: mockClonedComponentSet,
      });

      (validateCanvasAccess as any).mockReturnValue(undefined);
      (getCanvasInfo as any).mockReturnValue({
        pageName: 'Page 1',
        pageId: 'page1',
        viewportCenter: { x: 0, y: 0 },
        viewportZoom: 1,
      });

      (getEnabledProperties as any).mockReturnValue({ property2: false });

      const result = await orchestrateBuild(buildData);

      expect(result.success).toBe(true);
      expect(result.componentSet).toBe(mockClonedComponentSet);
      expect(result.stats.variantsProcessed).toBe(1);
      expect(result.stats.propertiesProcessed).toBe(1);
      expect(result.stats.elementsDeleted).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle build errors gracefully', async () => {
      const buildData: BuildEventData = {
        property1: true,
      };

      const { validateAndRefreshComponent } = await import('../../buildComponent/componentValidator');
      const { validateCanvasAccess } = await import('../../buildComponent/canvasRenderer');

      (validateCanvasAccess as any).mockImplementation(() => {
        throw new Error('Canvas access failed');
      });

      await expect(orchestrateBuild(buildData)).rejects.toThrow('Canvas access failed');
    });
  });
});