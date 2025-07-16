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

  for (const propKey of propKeys) {
    const propertyType = getComponentPropertyType(clonedComponentSet, propKey);
    if (propertyType === "VARIANT") {
      // This is a variant property itself being disabled
      variantPropsToRemove.add(propKey);
    }
  }

  // Process variant options from buildData
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

  // Handle variant properties
  for (const propKey of propKeys) {
    const propertyType = getComponentPropertyType(clonedComponentSet, propKey);
    if (propertyType === "VARIANT") {
      if (variantOptionsToKeep[propKey] && variantOptionsToKeep[propKey].length > 0) {
        // Some variant options are selected, keep only those
        deleteVariantsWithValues(clonedComponentSet, propKey, variantOptionsToKeep[propKey]);
      } else {
        // No variant options are selected or the whole property is disabled, keep only default
        deleteVariantsExcept(clonedComponentSet, propKey);
        if (clonedComponentSet.componentPropertyDefinitions[propKey]) {
          clonedComponentSet.deleteComponentProperty(propKey);
        }
      }
    } else {
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
