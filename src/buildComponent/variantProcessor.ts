import { deleteVariantsExcept, deleteVariantsWithValues } from "../figma_functions/coreUtils";
import { errorService } from "../errors";
import { BuildEventData } from "../types";

export interface VariantProcessingOptions {
  buildData: BuildEventData;
  componentSet: ComponentSetNode;
}

export interface VariantProcessingResult {
  processedVariants: string[];
  skippedVariants: string[];
  errors: string[];
}

export function processVariantProperties(options: VariantProcessingOptions): VariantProcessingResult {
  const { buildData, componentSet } = options;
  const result: VariantProcessingResult = {
    processedVariants: [],
    skippedVariants: [],
    errors: [],
  };

  // Group variant options by their parent property
  const variantOptionsToKeep: Record<string, string[]> = {};
  
  // Process all variant options from buildData to see which ones are enabled
  for (const [key, enabled] of Object.entries(buildData)) {
    if (key.includes("#")) {
      // This is a variant option
      const [variantProp, variantValue] = key.split("#");
      if (enabled) {
        if (!variantOptionsToKeep[variantProp]) {
          variantOptionsToKeep[variantProp] = [];
        }
        variantOptionsToKeep[variantProp].push(variantValue);
      }
    }
  }

  // Find all variant properties that exist in the component set
  const componentProperties = componentSet.componentPropertyDefinitions;
  const allVariantProps = Object.keys(componentProperties).filter(
    propName => componentProperties[propName].type === "VARIANT"
  );

  // Handle variant properties
  for (const variantProp of allVariantProps) {
    try {
      const isVariantPropDisabled = !buildData[variantProp];
      
      if (isVariantPropDisabled) {
        // Variant property is disabled, keep only default
        processDisabledVariantProperty(componentSet, variantProp);
        result.processedVariants.push(variantProp);
      } else if (variantOptionsToKeep[variantProp] && variantOptionsToKeep[variantProp].length > 0) {
        // Variant property is enabled, but some options might be disabled
        const processResult = processEnabledVariantProperty(
          componentSet,
          variantProp,
          variantOptionsToKeep[variantProp],
          componentProperties[variantProp].variantOptions || []
        );
        
        if (processResult.success) {
          result.processedVariants.push(variantProp);
        } else {
          result.skippedVariants.push(variantProp);
          result.errors.push(processResult.error || `Failed to process ${variantProp}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to process variant property "${variantProp}": ${errorMessage}`);
      result.skippedVariants.push(variantProp);
      
      errorService.handleError(error, {
        operation: 'PROCESS_VARIANT_PROPERTY',
        variantProp,
      });
    }
  }

  return result;
}

function processDisabledVariantProperty(componentSet: ComponentSetNode, variantProp: string): void {
  try {
    deleteVariantsExcept(componentSet, variantProp);
    if (componentSet.componentPropertyDefinitions[variantProp]) {
      componentSet.deleteComponentProperty(variantProp);
    }
  } catch (deleteError) {
    errorService.handleError(deleteError, {
      operation: 'DELETE_VARIANT_PROPERTY',
      variantProp,
      context: 'disabled_variant_property',
    });
    throw deleteError;
  }
}

interface ProcessResult {
  success: boolean;
  error?: string;
}

function processEnabledVariantProperty(
  componentSet: ComponentSetNode,
  variantProp: string,
  enabledOptions: string[],
  allOptions: string[]
): ProcessResult {
  try {
    if (enabledOptions.length < allOptions.length) {
      // Some options are disabled, remove variants for disabled options
      if (enabledOptions.length === 1) {
        // Only one variant option remains, delete all other variants and remove the property
        deleteVariantsExcept(componentSet, variantProp, enabledOptions[0]);
        if (componentSet.componentPropertyDefinitions[variantProp]) {
          componentSet.deleteComponentProperty(variantProp);
        }
      } else {
        // Multiple variants remain, just remove the unwanted ones
        deleteVariantsWithValues(componentSet, variantProp, enabledOptions);
      }
    }
    // If all options are enabled, do nothing (keep all variants)
    
    return { success: true };
  } catch (deleteError) {
    errorService.handleError(deleteError, {
      operation: 'DELETE_VARIANT_VALUES',
      variantProp,
      enabledOptions,
      context: enabledOptions.length === 1 ? 'single_variant_option' : 'multiple_variant_options',
    });
    
    return { 
      success: false, 
      error: deleteError instanceof Error ? deleteError.message : 'Unknown error' 
    };
  }
}

export function getVariantOptionsToKeep(buildData: BuildEventData): Record<string, string[]> {
  const variantOptionsToKeep: Record<string, string[]> = {};
  
  for (const [key, enabled] of Object.entries(buildData)) {
    if (key.includes("#")) {
      const [variantProp, variantValue] = key.split("#");
      if (enabled) {
        if (!variantOptionsToKeep[variantProp]) {
          variantOptionsToKeep[variantProp] = [];
        }
        variantOptionsToKeep[variantProp].push(variantValue);
      }
    }
  }
  
  return variantOptionsToKeep;
}