import {
  getComponentPropertyType,
  deleteVariantsExcept,
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

  for (const propKey of propKeys) {
    const propertyType = getComponentPropertyType(clonedComponentSet, propKey);
    if (propertyType === "VARIANT") {
      deleteVariantsExcept(clonedComponentSet, propKey);
      if (clonedComponentSet.componentPropertyDefinitions[propKey]) {
        clonedComponentSet.deleteComponentProperty(propKey);
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
