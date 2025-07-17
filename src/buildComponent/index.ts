// Main entry point for the refactored build component system
export { orchestrateBuild, validateBuildData, getBuildSummary } from './buildOrchestrator';
export { validateAndRefreshComponent, cloneComponentSet } from './componentValidator';
export { processVariantProperties, getVariantOptionsToKeep } from './variantProcessor';
export { processNonVariantProperties, getDisabledPropertyKeys } from './propertyProcessor';
export { renderToCanvas, validateCanvasAccess, getCanvasInfo } from './canvasRenderer';

export type { BuildResult } from './buildOrchestrator';
export type { ComponentValidationResult } from './componentValidator';
export type { VariantProcessingResult } from './variantProcessor';
export type { PropertyProcessingResult } from './propertyProcessor';
export type { CanvasRenderResult } from './canvasRenderer';

// Re-export the main build function for backward compatibility
import { orchestrateBuild, validateBuildData } from './buildOrchestrator';
import { BuildEventData } from '../types';

export async function buildUpdatedComponent(buildData: BuildEventData): Promise<void> {
  // Validate input data
  validateBuildData(buildData);
  
  // Orchestrate the build process
  await orchestrateBuild(buildData);
}