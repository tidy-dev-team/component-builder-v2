// Generic component generator - works with all component types
export { generateGenericComponent, getComponentProperties } from "./genericGenerator";

// Re-export canvas renderer from buildComponent
export { 
  renderToCanvas, 
  validateCanvasAccess, 
  getCanvasInfo,
  calculateComponentPosition,
  setComponentPosition
} from "../buildComponent/canvasRenderer";

// Component generator registry
import { generateGenericComponent } from "./genericGenerator";
import { ComponentProperty } from "../types";

export interface ComponentGeneratorOptions {
  properties: ComponentProperty[];
  componentKey: string;
  componentName?: string;
}

export type ComponentGenerator = (options: ComponentGeneratorOptions) => ComponentSetNode;

/**
 * Get a component generator for the given component name.
 * Always returns the generic generator since all components use the same property types.
 */
export function getComponentGenerator(componentName: string): ComponentGenerator {
  // Always use generic generator - all components have same kinds of properties
  return generateGenericComponent;
}

/**
 * Check if a component has a specialized generator (always false now)
 */
export function hasSpecializedGenerator(componentName: string): boolean {
  return false; // We only use generic generator
}