import { on, emit, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo } from "./figma_functions/coreUtils";
import type { ComponentPropertyInfo, ComponentSetEventData, BuildEventData } from "./types";
import { UI_DIMENSIONS } from "./constants";
import { buildUpdatedComponent } from "./buildComponent";

export let cachedComponentSet: ComponentSetNode | null = null;
let cachedComponentProps: ComponentPropertyInfo[] | null = null;
let lastComponentKey: string | null = null;

export default function () {
  on("GET_COMPONENT_SET_PROPERTIES", async (componentSetData: ComponentSetEventData) => {
    try {
      await getComponentSet(componentSetData.key);
      lastComponentKey = componentSetData.key;
      emit("COMPONENT_SET_PROPERTIES", cachedComponentProps);
    } catch (error) {
      console.error("Failed to get component set properties:", error);
      emit("COMPONENT_SET_PROPERTIES", []);
    }
  });

  on("REFRESH_COMPONENT_SET", async () => {
    try {
      if (lastComponentKey) {
        await getComponentSet(lastComponentKey);
        emit("COMPONENT_SET_REFRESHED", true);
      } else {
        emit("COMPONENT_SET_REFRESHED", false);
      }
    } catch (error) {
      console.error("Failed to refresh component set:", error);
      emit("COMPONENT_SET_REFRESHED", false);
    }
  });

  on("BUILD", async (buildData: BuildEventData) => {
    console.log("buildData :>> ", buildData);
    try {
      await buildUpdatedComponent(buildData);
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
