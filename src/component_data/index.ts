import { ComponentData } from "../types";

// Simple component registry - just keys and basic info
// Properties are discovered dynamically by the generic generator
export const componentRegistry: ComponentData = {
  Avatar: {
    name: "Avatar",
    key: "e978573d54b4b61133aaa9fb1287eef36df0e1ed",
    type: "componentSet",
  },
  IconButton: {
    name: "IconButton",
    key: "37a61a1f231653e5fe0d8fb5afeb561f1dfe3807",
    type: "componentSet",
  },
  Badge: {
    name: "Badge",
    key: "383eda2f42660613057a870cde686c7e8b076904",
    type: "componentSet",
  },
  CheckboxTest: {
    name: "Checkbox for test",
    key: "d921cc1b6daeca95638113d222cca11a2f117273",
    type: "componentSet",
  },
  RadioButtonsTest: {
    name: "Radio ButtonsTest",
    key: "32ae1243ca038828b08e5c78f5fb332af3386134",
    type: "componentSet",
  },
};

/**
 * Register a new component dynamically.
 * Just provide the name, key, and type - properties are auto-discovered.
 */
export function registerComponent(
  componentName: string,
  componentData: ComponentData[string]
): void {
  componentRegistry[componentName] = componentData;
}

/**
 * Get component data by name, with fallback for unknown components.
 * Properties are always discovered dynamically from Figma.
 */
export function getComponentData(
  componentName: string,
  fallbackKey?: string
): ComponentData[string] | null {
  // Return existing component data if available
  if (componentRegistry[componentName]) {
    return componentRegistry[componentName];
  }

  // Create fallback component data for any component
  if (fallbackKey) {
    return {
      name: componentName,
      key: fallbackKey,
      type: "componentSet",
    };
  }

  return null;
}

/**
 * Check if a component is predefined in the registry
 */
export function isKnownComponent(componentName: string): boolean {
  return componentName in componentRegistry;
}
