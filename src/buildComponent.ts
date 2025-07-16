import {
  getComponentPropertyType,
  deleteVariantsExcept,
  deleteVariantsWithValues,
  getElementsWithComponentProperty,
  getPathToDefaultVariant,
} from "./figma_functions/coreUtils";
import { cachedComponentSet } from "./main";
import { getEnabledProperties, isDependentProperty } from "./ui_utils";

export function buildUpdatedComponent(
  buildData: Record<string, boolean>
): void {
  const dataKeys = Object.keys(buildData);
  const propsToDisable = getEnabledProperties(buildData);
  const propKeys = Object.keys(propsToDisable);

  const clonedComponentSet = cachedComponentSet?.clone();
  if (!clonedComponentSet) {
    console.error("No component set available to build");
    return;
  }

  // Group variant options by their parent property
  const variantOptionsToKeep: Record<string, string[]> = {};
  const variantPropsToRemove: Set<string> = new Set();

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
  const componentProperties = clonedComponentSet.componentPropertyDefinitions;
  const allVariantProps = Object.keys(componentProperties).filter(
    propName => componentProperties[propName].type === "VARIANT"
  );

  // Handle variant properties
  for (const variantProp of allVariantProps) {
    try {
      const isVariantPropDisabled = !buildData[variantProp];
      
      if (isVariantPropDisabled) {
        // Variant property is disabled, keep only default
        deleteVariantsExcept(clonedComponentSet, variantProp);
        if (clonedComponentSet.componentPropertyDefinitions[variantProp]) {
          try {
            clonedComponentSet.deleteComponentProperty(variantProp);
          } catch (deleteError) {
            console.error(`Failed to delete component property "${variantProp}":`, deleteError);
          }
        }
      } else if (variantOptionsToKeep[variantProp] && variantOptionsToKeep[variantProp].length > 0) {
        // Variant property is enabled, but some options might be disabled
        // Check if we have all options or just some
        const allOptions = componentProperties[variantProp].variantOptions || [];
        const enabledOptions = variantOptionsToKeep[variantProp];
        
        if (enabledOptions.length < allOptions.length) {
          // Some options are disabled, remove variants for disabled options
          if (enabledOptions.length === 1) {
            // Only one variant option remains, delete all other variants and remove the property
            deleteVariantsExcept(clonedComponentSet, variantProp, enabledOptions[0]);
            if (clonedComponentSet.componentPropertyDefinitions[variantProp]) {
              try {
                clonedComponentSet.deleteComponentProperty(variantProp);
              } catch (deleteError) {
                console.error(`Failed to delete component property "${variantProp}":`, deleteError);
              }
            }
          } else {
            // Multiple variants remain, just remove the unwanted ones
            deleteVariantsWithValues(clonedComponentSet, variantProp, enabledOptions);
          }
        }
        // If all options are enabled, do nothing (keep all variants)
      }
    } catch (error) {
      console.error(`Failed to process variant property "${variantProp}":`, error);
      figma.notify(`Warning: Could not process variant property "${variantProp}"`);
    }
  }

  // Handle non-variant properties
  for (const propKey of propKeys) {
    const propertyType = getComponentPropertyType(clonedComponentSet, propKey);
    if (propertyType !== "VARIANT") {
      const propertyName = propKey.split("#")[0];
      const foundElements = getElementsWithComponentProperty(
        clonedComponentSet,
        propKey
      );

      if (foundElements.length > 0) {
        if (clonedComponentSet.componentPropertyDefinitions[propKey]) {
          clonedComponentSet.deleteComponentProperty(propKey);
        }
        foundElements.forEach((element) => element.remove());
      }

      const dependentProp = dataKeys.find((property) =>
        isDependentProperty(property, propertyName)
      );

      if (
        dependentProp &&
        clonedComponentSet.componentPropertyDefinitions[dependentProp]
      ) {
        clonedComponentSet.deleteComponentProperty(dependentProp);
      }
    }
  }

  figma.currentPage.appendChild(clonedComponentSet);
  figma.viewport.scrollAndZoomIntoView([clonedComponentSet]);
}
