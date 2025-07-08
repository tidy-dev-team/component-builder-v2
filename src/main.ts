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
  on("BUILD", (buildData: string[]) => {
    console.log("buildData :>> ", buildData);
    const clonedComponentSet = cachedComponentSet?.clone();
    if (clonedComponentSet) {
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
