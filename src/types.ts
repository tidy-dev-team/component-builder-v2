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
