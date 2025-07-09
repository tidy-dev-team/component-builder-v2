import { on, emit, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo } from "./figma_functions/utils";
import type { ComponentPropertyInfo } from "./types";

let cachedComponentSet: ComponentSetNode | null = null;
let cachedComponentProps: ComponentPropertyInfo[] | null = null;

export default function () {
  on("GET_COMPONENT_SET_PROPERTIES", async (data) => {
    await getComponentSet(data.key);
    emit("COMPONENT_SET_PROPERTIES", cachedComponentProps);
  });
  on("BUILD", (buildData: Record<string, boolean>) => {
    const propsToDisable = getDisabledProperties(buildData);
    console.log("props to disable  ", propsToDisable);
    // const clonedComponentSet = cachedComponentSet?.clone();
    // if (clonedComponentSet) {
    //   figma.currentPage.appendChild(clonedComponentSet);
    //   figma.viewport.scrollAndZoomIntoView([clonedComponentSet]);
    // }
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
