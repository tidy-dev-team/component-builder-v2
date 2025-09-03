import { errorService } from "../errors";

export interface CanvasRenderOptions {
  componentSet?: ComponentSetNode;
  component?: ComponentNode;
  focusViewport?: boolean;
}

export interface CanvasRenderResult {
  success: boolean;
  componentSet?: ComponentSetNode;
  component?: ComponentNode;
  error?: string;
}

export function renderToCanvas(options: CanvasRenderOptions): CanvasRenderResult {
  const { componentSet, component, focusViewport = true } = options;

  if (!componentSet && !component) {
    throw errorService.createBuildError(
      "Either componentSet or component must be provided",
      { operation: 'RENDER_TO_CANVAS' }
    );
  }

  try {
    const nodeToRender = componentSet || component!;
    const nodeName = nodeToRender.name;

    // Add component to current page
    figma.currentPage.appendChild(nodeToRender);

    // Calculate and set the position based on the new logic
    const canvasInfo = getCanvasInfo();
    const position = calculateComponentPosition(nodeToRender, canvasInfo.viewportCenter);
    setComponentPosition(nodeToRender, position);

    // Focus viewport on the new component
    if (focusViewport) {
      figma.viewport.scrollAndZoomIntoView([nodeToRender]);
    }

    return {
      success: true,
      componentSet,
      component,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const nodeName = componentSet?.name || component?.name || 'Unknown';

    errorService.handleError(error, {
      operation: 'RENDER_TO_CANVAS',
      componentName: nodeName,
      focusViewport,
    });

    throw errorService.createBuildError(
      "Failed to add component to canvas",
      {
        operation: 'ADD_TO_CANVAS',
        componentName: nodeName,
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
  component: ComponentSetNode | ComponentNode,
  viewportCenter: { x: number; y: number }
): { x: number; y: number } {
  // Position the component near the viewport center
  const padding = 100;
  return {
    x: viewportCenter.x - component.width / 2,
    y: viewportCenter.y - component.height / 2 - padding,
  };
}

export function setComponentPosition(
  component: ComponentSetNode | ComponentNode,
  position: { x: number; y: number }
): void {
  try {
    component.x = position.x;
    component.y = position.y;
  } catch (error) {
    errorService.handleError(error, {
      operation: 'SET_COMPONENT_POSITION',
      componentSetName: component.name,
      position,
    });
  }
}