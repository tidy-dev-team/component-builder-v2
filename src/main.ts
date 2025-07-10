import { on, emit, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo } from "./figma_functions/utils";
import type { ComponentPropertyInfo } from "./types";
import { getElementsWithComponentProperty } from "./figma_functions/coreUtils";

let cachedComponentSet: ComponentSetNode | null = null;
let cachedComponentProps: ComponentPropertyInfo[] | null = null;

export default function () {
  on("GET_COMPONENT_SET_PROPERTIES", async (data) => {
    await getComponentSet(data.key);
    emit("COMPONENT_SET_PROPERTIES", cachedComponentProps);
  });
  on("BUILD", (buildData: Record<string, boolean>) => {
    const dataKeys = Object.keys(buildData);
    const propsToDisable = getDisabledProperties(buildData);
    const propKeys = Object.keys(propsToDisable);

    const clonedComponentSet = cachedComponentSet?.clone();

    if (clonedComponentSet) {
      for (const propKey of propKeys) {
        const propertyName = propKey.split("#")[0];
        const foundElements = getElementsWithComponentProperty(
          clonedComponentSet!,
          propKey
        );
        if (foundElements.length > 0) {
          clonedComponentSet!.deleteComponentProperty(propKey);
          for (const element of foundElements) {
            element.remove();
          }
        }
        const dependentProp = dataKeys.find((property) => {
          return (
            property.startsWith(`✏️ ${propertyName}#`) ||
            property.startsWith(`🔁 ${propertyName}#`)
          );
        });
        if (!!dependentProp)
          clonedComponentSet.deleteComponentProperty(dependentProp);
      }
      figma.currentPage.appendChild(clonedComponentSet);
      figma.viewport.scrollAndZoomIntoView([clonedComponentSet]);
    }
  });
  showUI({
    height: 500,
    width: 320,
  });
}

async function getComponentSet(key: string) {
  cachedComponentSet = await figma.importComponentSetByKeyAsync(key);
  cachedComponentProps = getComponentPropertyInfo(cachedComponentSet!);
}

function getDisabledProperties(
  properties: Record<string, boolean>
): Record<string, boolean> {
  const clonedProps = { ...properties };
  for (const key in clonedProps) {
    if (clonedProps[key] == true) {
      delete clonedProps[key];
    }
  }
  return clonedProps;
}
