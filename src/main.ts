import { on, emit, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo } from "./figma_functions/coreUtils";
import type { ComponentPropertyInfo } from "./types";
import { UI_DIMENSIONS } from "./constants";
import { buildUpdatedComponent } from "./buildComponent";

export let cachedComponentSet: ComponentSetNode | null = null;
let cachedComponentProps: ComponentPropertyInfo[] | null = null;

export default function () {
  on("GET_COMPONENT_SET_PROPERTIES", async (componentSetData) => {
    try {
      await getComponentSet(componentSetData.key);
      emit("COMPONENT_SET_PROPERTIES", cachedComponentProps);
    } catch (error) {
      console.error("Failed to get component set properties:", error);
      emit("COMPONENT_SET_PROPERTIES", []);
    }
  });

  on("BUILD", (buildData: Record<string, boolean>) => {
    console.log("buildData :>> ", buildData);
    try {
      buildUpdatedComponent(buildData);
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
