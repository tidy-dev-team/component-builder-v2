import { on, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo } from "./figma_functions/utils";

export default function () {
  on("GET_COMPONENT_PROPERTIES", (data) => {
    getComponentSet(data.key);
  });
  showUI({
    height: 360,
    width: 320,
  });
}

async function getComponentSet(key: string) {
  const componentSet = await figma.importComponentSetByKeyAsync(key);
  const props = getComponentPropertyInfo(componentSet);
  console.log(props);
}
