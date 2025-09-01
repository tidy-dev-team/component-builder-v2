export interface ComponentData {
  [componentName: string]: {
    key: string;
    type?: "componentSet" | "component" | "separator";
    name?: string;
    properties?: ComponentProperty[];
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
  path?: number[];
}

// Component property for UI
export interface ComponentProperty {
  name: string;
  displayName: string;
  value: string | boolean;
  used: boolean;
  dependentProperty?: DependentProperty;
}

export interface DependentProperty {
  kind: "text" | "instance swap";
  name: string;
  value: string;
}

// Event handler types
export interface BuildEventData {
  [propertyName: string]: boolean;
}

export interface ComponentSetEventData {
  key: string;
}

// State types
export interface PropertyUsedStates {
  [propertyName: string]: boolean;
}

// Component props types
export interface ButtonComponentProps {
  callback: () => void;
}

export interface DropdownComponentProps {
  components: ComponentData;
}

export interface CheckboxComponentProps extends ComponentPropertyInfo {
  disabled?: boolean;
  allProperties: ComponentPropertyInfo[];
}
