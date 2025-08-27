import { ComponentData } from "../types";

// Simple component registry - just keys and basic info
// Properties are discovered dynamically by the generic generator
export const componentRegistry: ComponentData = {
  Avatar: {
    name: "Avatar",
    key: "e978573d54b4b61133aaa9fb1287eef36df0e1ed",
    type: "componentSet",
  },
  Username: {
    name: "Username",
    key: "06dd30dbb923f224be343051b7b12028a58f7c2a",
    type: "componentSet",
  },
  "Avatar Number": {
    name: "Avatar Number",
    key: "02be470b66ff4d2c85ada06efbe67317f8cc64f7",
    type: "componentSet",
  },
  "Avatar Group": {
    name: "Avatar Group",
    key: "e5496c2a096678c5554623ba200b676372433be7",
    type: "componentSet",
  },
  Badge: {
    name: "Badge",
    key: "383eda2f42660613057a870cde686c7e8b076904",
    type: "componentSet",
  },
  "Asset Badge": {
    name: "Asset Badge",
    key: "16a4808ca941ac44a9b7cf20c9305578e8b1501a",
    type: "componentSet",
  },
  "Text Badge": {
    name: "Text Badge",
    key: "0d1e3c485d118955784334f1cd0bdf004b16b155",
    type: "componentSet",
  },
  "Pill Badge": {
    name: "Pill Badge",
    key: "36a77f2b4ad268f7821d3976f21398c1a1900a98",
    type: "componentSet",
  },
  Breadcrumbs: {
    name: "Breadcrumbs",
    key: "8563670cf1d3591bd4f3af9d0156cc0a7d99dd0b",
    type: "componentSet",
  },
  Buttons: {
    name: "Buttons",
    key: "1a45acec266bbb1bd1338744453eb9e33aa2af53",
    type: "componentSet",
  },
  "Button Icon": {
    name: "Button Icon",
    key: "37a61a1f231653e5fe0d8fb5afeb561f1dfe3807",
    type: "componentSet",
  },
  "Button Text": {
    name: "Button Text",
    key: "1484a29ce5e8cd702dc12913d2b79a464d269227",
    type: "componentSet",
  },
  "Checkbox Icon": {
    name: "Checkbox (Icon)",
    key: "0e360b2a80465d5bcbe6c218222fb5896351ed97",
    type: "componentSet",
  },
  "Checkbox Item Icon": {
    name: "Checkbox Item (Icon)",
    key: "0a0e2be0f6ece4620ef8d28b39ee6995656393b2",
    type: "componentSet",
  },
  CheckboxVector: {
    name: "Checkbox (Vector)",
    key: "43e9aef5432cf48a3cf2b727a815872f717ba211",
    type: "componentSet"
  },
  "Checkbox Item Vector": {
    name: "Checkbox Item (Vector)",
    key: "b07ff3f8009f606c7537098bfa932d1e916206ac",
    type: "componentSet"
  },
  Chips: {
    name: "Chips",
    key: "d785439063b42d9fbe449f3d19223cfa825a47bf",
    type: "componentSet"
  },
  "Text Input Outlined": {
    name: "Text Input (Outlined)",
    key: "3fa0112d53708a35080dfd22530ebf3dbbbcdf4d",
    type: "componentSet"
  },
  "Text Input Contained": {
    name: "Text Input (Contained)",
    key: "46e44149a998ceae1bdbff378c85818e4ecd89e6",
    type: "componentSet"
  },
  "Text Input Underlined": {
    name: "Text Input (Underlined)",
    key: "2ef5964e087304eaecb3887bb3b2441834450f21",
    type: "componentSet"
  },
  "Select Input Outlined": {
    name: "Select Input (Outlined)",
    key: "bb1ce670f2e5eb30645a8381232c4ab166a56834",
    type: "componentSet"
  },
  'Select Input Contained': {
    name: "Select Input (Contained)",
    key: "0aeeec1c853b6245284581b97e9f7c04f63e1f60",
    type: "componentSet"
  },
  "Select Input Underlined": {
    name: "Select Input (Underlined)",
    key: "cbba2e72a7ad213bef170e4856c5cc6d25f61025",
    type: "componentSet"
  },
  "Text Area Outlined": {
    name: "Text Area (Outlined)",
    key: "cd98d2840dfb806c6d4565cf350241e5154b77e6",
    type: "componentSet"
  },
  'Text Area Contained': {
    name: "Text Area (Contained)",
    key: "db19df1e8d74d68586027a3adedd40c52b242c26",
    type: "componentSet"
  },
  "Text Area Underlined": {
    name: "Text Area (Underlined)",
    key: "da1e71702ca3f2fa022054c190c88dfa36cb4d7e",
    type: "componentSet"
  },
  "Numeric Input (Arrows) Outlined": {
    name: "Numeric Input (Arrows) (Outlined)",
    key: "",
    type: "componentSet"
  },
  'Numeric Input (Arrows) Contained': {
    name: "Numeric Input (Arrows) (Contained)",
    key: "",
    type: "componentSet"
  },
  "Numeric Input (Arrows) Underlined": {
    name: "Numeric Input (Arrows) (Underlined)",
    key: "",
    type: "componentSet"
  },
  "Numeric Input (Buttons) Outlined": {
    name: "Numeric Input (Buttons) (Outlined)",
    key: "",
    type: "componentSet"
  },
  'Numeric Input (Buttons) Contained': {
    name: "Numeric Input (Buttons) (Contained)",
    key: "",
    type: "componentSet"
  },
  "Numeric Input (Buttons) Underlined": {
    name: "Numeric Input (Buttons) (Underlined)",
    key: "",
    type: "componentSet"
  },
  "Numeric Input (Stepper)": {
    name: "Numeric Input (Stepper)",
    key: "",
    type: "componentSet"
  },
};

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
