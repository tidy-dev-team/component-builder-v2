import { on, emit, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo } from "./figma_functions/utils";
import type { ComponentPropertyInfo } from "./types";
import {
  getElementsWithComponentProperty,
  getComponentPropertyType,
  deleteVariantsExcept,
} from "./figma_functions/coreUtils";
import { getEnabledProperties, isDependentProperty } from "./ui_utils";
import { UI_DIMENSIONS } from "./constants";

let cachedComponentSet: ComponentSetNode | null = null;
let cachedComponentProps: ComponentPropertyInfo[] | null = null;

export default function () {
  on("GET_COMPONENT_SET_PROPERTIES", async (data) => {
    try {
      await getComponentSet(data.key);
      emit("COMPONENT_SET_PROPERTIES", cachedComponentProps);
    } catch (error) {
      console.error("Failed to get component set properties:", error);
      emit("COMPONENT_SET_PROPERTIES", []);
    }
  });

  on("BUILD", (buildData: Record<string, boolean>) => {
    try {
      buildComponent(buildData);
    } catch (error) {
      console.error("Failed to build component:", error);
    }
  });

  showUI({
    height: UI_DIMENSIONS.HEIGHT,
    width: UI_DIMENSIONS.WIDTH,
  });
}

async function getComponentSet(key: string): Promise<void> {
  cachedComponentSet = await figma.importComponentSetByKeyAsync(key);
  cachedComponentProps = getComponentPropertyInfo(cachedComponentSet);
}

function buildComponent(buildData: Record<string, boolean>): void {
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

      if (dependentProp && clonedComponentSet.componentPropertyDefinitions[dependentProp]) {
        clonedComponentSet.deleteComponentProperty(dependentProp);
      }
    }
  }

  figma.currentPage.appendChild(clonedComponentSet);
  figma.viewport.scrollAndZoomIntoView([clonedComponentSet]);
}
