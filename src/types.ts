import { EventHandler } from "@create-figma-plugin/utilities";

export interface BuildHandler extends EventHandler {
  name: "BUILD";
  handler: (data: string[]) => void;
}

export interface CloseHandler extends EventHandler {
  name: "CLOSE";
  handler: () => void;
}

export interface GetComponentSetPropertiesHandler extends EventHandler {
  name: "GET_COMPONENT_SET_PROPERTIES";
  handler: (data: { key: string }) => void;
}

export interface ComponentSetPropertiesHandler extends EventHandler {
  name: "COMPONENT_SET_PROPERTIES";
  handler: (data: ComponentPropertyInfo[]) => void;
}

export interface ComponentData {
  [componentName: string]: {
    name: string;
    key: string;
    type: "componentSet" | "component";
  };
}

export interface ComponentPropertyInfo {
  name: string;
  type: ComponentPropertyType;
  defaultValue: string | boolean;
  preferredValues?: InstanceSwapPreferredValue[];
  variantOptions?: string[];
  boundVariables?: {
    [field in "value"]?: VariableAlias;
  };
}

export interface DependentProperty {
  kind: "text" | "instance swap";
  name: string;
  value: string;
}

export interface ComponentProperty {
  name: string;
  displayName: string;
  value: string | boolean;
  used: boolean;
  dependentProperty?: DependentProperty;
  variants?: string[];
}

export interface ComponentProperties {
  [key: string]: ComponentProperty;
}

// export interface ComponentDataMap {
//   [componentName: string]: ComponentProperties;
// }
