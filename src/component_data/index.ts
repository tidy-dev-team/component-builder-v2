import { ComponentData } from "../types";
import { componentRegistry } from "./componentRegistry";

export function registerComponent(
  componentName: string,
  componentData: ComponentData[string]
): void {
  componentRegistry[componentName] = componentData;
}

export function getComponentData(
  componentName: string,
  fallbackKey?: string
): ComponentData[string] | null {
  if (componentRegistry[componentName]) {
    return componentRegistry[componentName];
  }

  if (fallbackKey) {
    return {
      name: componentName,
      key: fallbackKey,
      type: "componentSet",
    };
  }

  return null;
}

export function isKnownComponent(componentName: string): boolean {
  return componentName in componentRegistry;
}
