import { errorService } from "../errors";

export interface CanvasRenderOptions {
  componentSet: ComponentSetNode;
  focusViewport?: boolean;
}

export interface CanvasRenderResult {
  success: boolean;
  componentSet: ComponentSetNode;
  error?: string;
}

export function renderToCanvas(options: CanvasRenderOptions): CanvasRenderResult {
  const { componentSet, focusViewport = true } = options;
  
  try {
    // Add component to current page
    figma.currentPage.appendChild(componentSet);
    
    // Focus viewport on the new component
    if (focusViewport) {
      figma.viewport.scrollAndZoomIntoView([componentSet]);
    }
    
    return {
      success: true,
      componentSet,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    errorService.handleError(error, {
      operation: 'RENDER_TO_CANVAS',
      componentSetName: componentSet.name,
      focusViewport,
    });
    
    throw errorService.createBuildError(
      "Failed to add component to canvas",
      { 
        operation: 'ADD_TO_CANVAS',
        componentSetName: componentSet.name,
        focusViewport,
      },
      error instanceof Error ? error : undefined
    );
  }
}

export function validateCanvasAccess(): void {
  if (!figma.currentPage) {
    throw errorService.createBuildError(
      "No current page available for canvas rendering",
      { operation: 'VALIDATE_CANVAS_ACCESS' }
    );
  }
  
  if (!figma.viewport) {
    throw errorService.createBuildError(
      "No viewport available for canvas rendering",
      { operation: 'VALIDATE_CANVAS_ACCESS' }
    );
  }
}

export function getCanvasInfo(): {
  pageName: string;
  pageId: string;
  viewportCenter: { x: number; y: number };
  viewportZoom: number;
} {
  try {
    return {
      pageName: figma.currentPage.name,
      pageId: figma.currentPage.id,
      viewportCenter: figma.viewport.center,
      viewportZoom: figma.viewport.zoom,
    };
  } catch (error) {
    errorService.handleError(error, {
      operation: 'GET_CANVAS_INFO',
    });
    
    // Return default values if unable to get canvas info
    return {
      pageName: 'Unknown',
      pageId: 'unknown',
      viewportCenter: { x: 0, y: 0 },
      viewportZoom: 1,
    };
  }
}

export function calculateComponentPosition(
  componentSet: ComponentSetNode,
  viewportCenter: { x: number; y: number }
): { x: number; y: number } {
  // Position the component near the viewport center
  const padding = 100;
  return {
    x: viewportCenter.x - componentSet.width / 2,
    y: viewportCenter.y - componentSet.height / 2 - padding,
  };
}

export function setComponentPosition(
  componentSet: ComponentSetNode,
  position: { x: number; y: number }
): void {
  try {
    componentSet.x = position.x;
    componentSet.y = position.y;
  } catch (error) {
    errorService.handleError(error, {
      operation: 'SET_COMPONENT_POSITION',
      componentSetName: componentSet.name,
      position,
    });
  }
}