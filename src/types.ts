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
  path?: number[];
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
