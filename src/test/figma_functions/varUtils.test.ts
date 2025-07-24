import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as varUtils from '../../figma_functions/varUtils';

// Mock the getVariablesFromFigma function within the module
const mockGetVariablesFromFigma = vi.spyOn(varUtils, 'getVariablesFromFigma');

describe('applySemanticBorderRadiusVariables', () => {
  // Mock Figma API
  const mockVariable = {
    id: 'var-id-1',
    name: 'radius/semantic/sharp',
  };

  const mockGetVariableByIdAsync = vi.fn().mockResolvedValue(mockVariable);
  const mockSetBoundVariable = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock figma.variables
    global.figma = {
      ...global.figma,
      variables: {
        ...global.figma?.variables,
        getVariableByIdAsync: mockGetVariableByIdAsync,
        getLocalVariableCollectionsAsync: vi.fn().mockResolvedValue([]),
      },
    } as any;
  });

  it('should apply semantic variables to component with matching cornerRadius', async () => {
    // Mock variables data
    const mockVariablesData = {
      global: [
        {
          id: 'global-1',
          name: 'radius/global/none',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: 0, isAlias: false, referencedVariableId: null }],
        },
        {
          id: 'global-2', 
          name: 'radius/global/4',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: 4, isAlias: false, referencedVariableId: null }],
        },
      ],
      semantic: [
        {
          id: 'semantic-1',
          name: 'radius/semantic/sharp',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: { type: 'VARIABLE_ALIAS', id: 'global-1' }, isAlias: true, referencedVariableId: 'global-1' }],
        },
        {
          id: 'semantic-2',
          name: 'radius/semantic/small-elements',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: { type: 'VARIABLE_ALIAS', id: 'global-2' }, isAlias: true, referencedVariableId: 'global-2' }],
        },
      ],
    };

    mockGetVariablesFromFigma.mockResolvedValue(mockVariablesData);

    // Mock component node with cornerRadius = 0
    const mockChild = {
      type: 'RECTANGLE',
      name: 'child-rect',
      cornerRadius: 0,
      setBoundVariable: mockSetBoundVariable,
      children: [],
    } as any;

    const mockComponent = {
      type: 'COMPONENT',
      name: 'test-component',
      cornerRadius: 4,
      setBoundVariable: mockSetBoundVariable,
      children: [mockChild],
    } as any;

    const mockComponentSet = {
      type: 'COMPONENT_SET',
      name: 'test-component-set',
      children: [mockComponent],
    } as any;

    await varUtils.applySemanticBorderRadiusVariables(mockComponentSet);

    // Verify getVariablesFromFigma was called with "radius"
    expect(mockGetVariablesFromFigma).toHaveBeenCalledWith('radius');

    // Verify Figma variable was fetched for both matching radii
    expect(mockGetVariableByIdAsync).toHaveBeenCalledWith('semantic-2'); // For radius 4
    expect(mockGetVariableByIdAsync).toHaveBeenCalledWith('semantic-1'); // For radius 0

    // Verify setBoundVariable was called on both nodes
    expect(mockSetBoundVariable).toHaveBeenCalledWith('cornerRadius', mockVariable);
  });

  it('should handle individual corner radii', async () => {
    const mockVariablesData = {
      global: [
        {
          id: 'global-1',
          name: 'radius/global/8',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: 8, isAlias: false, referencedVariableId: null }],
        },
      ],
      semantic: [
        {
          id: 'semantic-1',
          name: 'radius/semantic/large-controls',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: { type: 'VARIABLE_ALIAS', id: 'global-1' }, isAlias: true, referencedVariableId: 'global-1' }],
        },
      ],
    };

    mockGetVariablesFromFigma.mockResolvedValue(mockVariablesData);

    const mockNode = {
      type: 'RECTANGLE',
      name: 'test-rect',
      cornerRadius: { topLeftRadius: 8, topRightRadius: 8, bottomLeftRadius: 8, bottomRightRadius: 8 },
      topLeftRadius: 8,
      topRightRadius: 8,
      bottomLeftRadius: 8,
      bottomRightRadius: 8,
      setBoundVariable: mockSetBoundVariable,
      children: [],
    } as any;

    const mockComponent = {
      type: 'COMPONENT',
      name: 'test-component',
      children: [mockNode],
    } as any;

    await varUtils.applySemanticBorderRadiusVariables(mockComponent);

    // Should call setBoundVariable for each corner
    expect(mockSetBoundVariable).toHaveBeenCalledWith('topLeftRadius', mockVariable);
    expect(mockSetBoundVariable).toHaveBeenCalledWith('topRightRadius', mockVariable);
    expect(mockSetBoundVariable).toHaveBeenCalledWith('bottomLeftRadius', mockVariable);
    expect(mockSetBoundVariable).toHaveBeenCalledWith('bottomRightRadius', mockVariable);
  });

  it('should handle nodes without cornerRadius property', async () => {
    const mockVariablesData = {
      global: [],
      semantic: [],
    };

    mockGetVariablesFromFigma.mockResolvedValue(mockVariablesData);

    const mockNode = {
      type: 'TEXT',
      name: 'test-text',
      children: [],
    } as any;

    const mockComponent = {
      type: 'COMPONENT',
      name: 'test-component',
      children: [mockNode],
    } as any;

    // This should handle empty variables gracefully
    await varUtils.applySemanticBorderRadiusVariables(mockComponent);

    // Should not call setBoundVariable
    expect(mockSetBoundVariable).not.toHaveBeenCalled();
  });

  it('should handle missing variables gracefully', async () => {
    mockGetVariablesFromFigma.mockResolvedValue(null);

    const mockComponent = {
      type: 'COMPONENT',
      name: 'test-component',
      cornerRadius: 4,
      setBoundVariable: mockSetBoundVariable,
      children: [],
    } as any;

    // Should not throw error
    await expect(varUtils.applySemanticBorderRadiusVariables(mockComponent)).resolves.toBeUndefined();

    expect(mockSetBoundVariable).not.toHaveBeenCalled();
  });

  it('should handle empty semantic variables', async () => {
    const mockVariablesData = {
      global: [
        {
          id: 'global-1',
          name: 'radius/global/4',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: 4, isAlias: false, referencedVariableId: null }],
        },
      ],
      semantic: [],
    };

    mockGetVariablesFromFigma.mockResolvedValue(mockVariablesData);

    const mockComponent = {
      type: 'COMPONENT',
      name: 'test-component',
      cornerRadius: 4,
      setBoundVariable: mockSetBoundVariable,
      children: [],
    } as any;

    await varUtils.applySemanticBorderRadiusVariables(mockComponent);

    expect(mockSetBoundVariable).not.toHaveBeenCalled();
  });

  it('should skip nodes with non-matching radius values', async () => {
    const mockVariablesData = {
      global: [
        {
          id: 'global-1',
          name: 'radius/global/4',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: 4, isAlias: false, referencedVariableId: null }],
        },
      ],
      semantic: [
        {
          id: 'semantic-1',
          name: 'radius/semantic/small-elements',
          type: 'FLOAT' as VariableResolvedDataType,
          values: [{ mode: '1', value: { type: 'VARIABLE_ALIAS', id: 'global-1' }, isAlias: true, referencedVariableId: 'global-1' }],
        },
      ],
    };

    mockGetVariablesFromFigma.mockResolvedValue(mockVariablesData);

    const mockComponent = {
      type: 'COMPONENT',
      name: 'test-component',
      cornerRadius: 10, // This value doesn't match any defined variable
      setBoundVariable: mockSetBoundVariable,
      children: [],
    } as any;

    await varUtils.applySemanticBorderRadiusVariables(mockComponent);

    // Should not call setBoundVariable for non-matching values
    expect(mockSetBoundVariable).not.toHaveBeenCalled();
  });
});