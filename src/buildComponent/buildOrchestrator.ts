import { BuildEventData } from "../types";
import { getEnabledProperties } from "../ui_utils";
import { validateAndRefreshComponent, cloneComponentSet } from "./componentValidator";
import { processVariantProperties } from "./variantProcessor";
import { processNonVariantProperties } from "./propertyProcessor";
import { renderToCanvas, validateCanvasAccess, getCanvasInfo } from "./canvasRenderer";
import { errorService, ErrorCode } from "../errors";
import { InputValidator, InputSanitizer, formatValidationErrors } from "../validation";

export interface BuildResult {
  success: boolean;
  componentSet?: ComponentSetNode;
  stats: {
    variantsProcessed: number;
    variantsSkipped: number;
    propertiesProcessed: number;
    propertiesSkipped: number;
    elementsDeleted: number;
    errorsCount: number;
    wasComponentRefreshed: boolean;
  };
  errors: string[];
}

export async function orchestrateBuild(buildData: BuildEventData): Promise<BuildResult> {
  const result: BuildResult = {
    success: false,
    stats: {
      variantsProcessed: 0,
      variantsSkipped: 0,
      propertiesProcessed: 0,
      propertiesSkipped: 0,
      elementsDeleted: 0,
      errorsCount: 0,
      wasComponentRefreshed: false,
    },
    errors: [],
  };

  try {
    // Step 0: Validate and sanitize build data
    const inputValidationResult = InputValidator.validateBuildEventData(buildData);
    if (!inputValidationResult.valid) {
      const errorMessage = formatValidationErrors(inputValidationResult.errors);
      throw errorService.createValidationError(
        ErrorCode.INVALID_INPUT,
        errorMessage,
        { buildData, validationErrors: inputValidationResult.errors }
      );
    }

    // Sanitize build data properties
    const sanitizedBuildData: BuildEventData = {};
    for (const [key, value] of Object.entries(buildData)) {
      const sanitizedKey = InputSanitizer.ensureValidPropertyName(key);
      const sanitizedValue = InputSanitizer.normalizeBoolean(value);
      if (sanitizedKey) {
        sanitizedBuildData[sanitizedKey] = sanitizedValue;
      }
    }

    // Use sanitized data for the rest of the process
    buildData = sanitizedBuildData;
    
    // Step 1: Validate canvas access
    validateCanvasAccess();
    const canvasInfo = getCanvasInfo();
    
    // Step 2: Validate and refresh component if needed
    const componentValidationResult = await validateAndRefreshComponent();
    result.stats.wasComponentRefreshed = componentValidationResult.wasRefreshed;
    
    // Step 3: Clone the component set
    const clonedComponentSet = cloneComponentSet(componentValidationResult.componentSet);
    
    // Step 4: Process variant properties
    const variantResult = processVariantProperties({
      buildData,
      componentSet: clonedComponentSet,
    });
    
    result.stats.variantsProcessed = variantResult.processedVariants.length;
    result.stats.variantsSkipped = variantResult.skippedVariants.length;
    result.errors.push(...variantResult.errors);
    
    // Step 5: Process non-variant properties
    const propsToDisable = getEnabledProperties(buildData);
    const propertyResult = processNonVariantProperties({
      buildData,
      componentSet: clonedComponentSet,
      disabledProperties: propsToDisable,
    });
    
    result.stats.propertiesProcessed = propertyResult.processedProperties.length;
    result.stats.propertiesSkipped = propertyResult.skippedProperties.length;
    result.stats.elementsDeleted = propertyResult.deletedElements;
    result.errors.push(...propertyResult.errors);
    
    // Step 6: Render to canvas
    const renderResult = renderToCanvas({
      componentSet: clonedComponentSet,
      focusViewport: true,
    });
    
    result.componentSet = renderResult.componentSet;
    result.stats.errorsCount = result.errors.length;
    result.success = true;
    
    // Log success with statistics
    console.log('Build completed successfully:', {
      stats: result.stats,
      canvasInfo,
      componentName: clonedComponentSet.name,
    });
    
    // Show success notification
    const successMessage = createSuccessMessage(result.stats);
    figma.notify(successMessage);
    
    return result;
    
  } catch (error) {
    // Handle any errors that occurred during the build process
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Build failed: ${errorMessage}`);
    result.stats.errorsCount = result.errors.length;
    
    errorService.handleError(error, {
      operation: 'ORCHESTRATE_BUILD',
      buildDataKeys: Object.keys(buildData).length,
      stats: result.stats,
    });
    
    // Show error notification
    const errorNotification = `Build failed: ${errorMessage}`;
    figma.notify(errorNotification, { error: true });
    
    throw error;
  }
}

function createSuccessMessage(stats: BuildResult['stats']): string {
  const parts = [];
  
  if (stats.variantsProcessed > 0) {
    parts.push(`${stats.variantsProcessed} variant${stats.variantsProcessed !== 1 ? 's' : ''} processed`);
  }
  
  if (stats.propertiesProcessed > 0) {
    parts.push(`${stats.propertiesProcessed} propert${stats.propertiesProcessed !== 1 ? 'ies' : 'y'} processed`);
  }
  
  if (stats.elementsDeleted > 0) {
    parts.push(`${stats.elementsDeleted} element${stats.elementsDeleted !== 1 ? 's' : ''} removed`);
  }
  
  if (stats.wasComponentRefreshed) {
    parts.push('component refreshed');
  }
  
  const baseMessage = '✓ Component built successfully';
  
  if (parts.length === 0) {
    return baseMessage;
  }
  
  return `${baseMessage} (${parts.join(', ')})`;
}

export function validateBuildData(buildData: BuildEventData): void {
  if (!buildData || typeof buildData !== 'object') {
    throw errorService.createValidationError(
      ErrorCode.INVALID_INPUT,
      'Build data must be a valid object',
      { buildData: typeof buildData }
    );
  }
  
  const keys = Object.keys(buildData);
  if (keys.length === 0) {
    throw errorService.createValidationError(
      ErrorCode.INVALID_INPUT,
      'Build data cannot be empty',
      { buildData }
    );
  }
  
  // Validate that all values are boolean
  for (const [key, value] of Object.entries(buildData)) {
    if (typeof value !== 'boolean') {
      throw errorService.createValidationError(
        ErrorCode.INVALID_INPUT,
        `Build data property "${key}" must be a boolean, got ${typeof value}`,
        { key, value, buildData }
      );
    }
  }
}

export function getBuildSummary(buildData: BuildEventData): {
  totalProperties: number;
  enabledProperties: number;
  disabledProperties: number;
  variantProperties: number;
  nonVariantProperties: number;
} {
  const keys = Object.keys(buildData);
  const enabled = keys.filter(key => buildData[key]);
  const disabled = keys.filter(key => !buildData[key]);
  const variants = keys.filter(key => key.includes('#'));
  const nonVariants = keys.filter(key => !key.includes('#'));
  
  return {
    totalProperties: keys.length,
    enabledProperties: enabled.length,
    disabledProperties: disabled.length,
    variantProperties: variants.length,
    nonVariantProperties: nonVariants.length,
  };
}