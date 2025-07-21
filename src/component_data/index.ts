import { ComponentData } from "../types";

// Simple component registry - just keys and basic info
// Properties are discovered dynamically by the generic generator
export const componentRegistry: ComponentData = {
  Avatar: {
    name: "Avatar",
    key: "e978573d54b4b61133aaa9fb1287eef36df0e1ed",
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
  CheckboxIcon: {
    name: "Checkbox (icon)",
    key: "0e360b2a80465d5bcbe6c218222fb5896351ed97",
    type: "componentSet",
  },
  CheckboxItemIcon: {
    name: "Checkbox item (icon)",
    key: "0a0e2be0f6ece4620ef8d28b39ee6995656393b2",
    type: "componentSet",
  },
  CheckboxVector: {
    name: "Checkbox (customizable vector)",
    key: "43e9aef5432cf48a3cf2b727a815872f717ba211",
    type: "componentSet",
  },
  CheckboxItemVector: {
    name: "Checkbox item (customizable vector)",
    key: "b07ff3f8009f606c7537098bfa932d1e916206ac",
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
