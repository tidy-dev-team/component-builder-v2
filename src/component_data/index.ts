import { ComponentData } from "../types";

// Simple component registry - just keys and basic info
// Properties are discovered dynamically by the generic generator
export const componentRegistry: ComponentData = {
  Avatar: {
    key: "e978573d54b4b61133aaa9fb1287eef36df0e1ed",
  },
  Username: {
    key: "06dd30dbb923f224be343051b7b12028a58f7c2a",
  },
  "Avatar Number": {
    key: "02be470b66ff4d2c85ada06efbe67317f8cc64f7",
  },
  "Avatar Group": {
    key: "e5496c2a096678c5554623ba200b676372433be7",
  },
  Badge: {
    key: "383eda2f42660613057a870cde686c7e8b076904",
  },
  "Asset Badge": {
    key: "16a4808ca941ac44a9b7cf20c9305578e8b1501a",
  },
  "Text Badge": {
    key: "0d1e3c485d118955784334f1cd0bdf004b16b155",
  },
  "Pill Badge": {
    key: "36a77f2b4ad268f7821d3976f21398c1a1900a98",
  },
  Breadcrumbs: {
    key: "8563670cf1d3591bd4f3af9d0156cc0a7d99dd0b",
  },
  Buttons: {
    key: "1a45acec266bbb1bd1338744453eb9e33aa2af53",
  },
  "Button Icon": {
    key: "37a61a1f231653e5fe0d8fb5afeb561f1dfe3807",
  },
  "Button Text": {
    key: "1484a29ce5e8cd702dc12913d2b79a464d269227",
  },
  "Checkbox Icon": {
    key: "0e360b2a80465d5bcbe6c218222fb5896351ed97",
  },
  "Checkbox Item Icon": {
    key: "0a0e2be0f6ece4620ef8d28b39ee6995656393b2",
  },
  CheckboxVector: {
    key: "43e9aef5432cf48a3cf2b727a815872f717ba211",
  },
  "Checkbox Item Vector": {
    key: "b07ff3f8009f606c7537098bfa932d1e916206ac",
  },
  Chips: {
    key: "d785439063b42d9fbe449f3d19223cfa825a47bf",
  },
  "Text Input Outlined": {
    key: "3fa0112d53708a35080dfd22530ebf3dbbbcdf4d",
  },
  "Text Input Contained": {
    key: "46e44149a998ceae1bdbff378c85818e4ecd89e6",
  },
  "Text Input Underlined": {
    key: "2ef5964e087304eaecb3887bb3b2441834450f21",
  },
  "Select Input Outlined": {
    key: "bb1ce670f2e5eb30645a8381232c4ab166a56834",
  },
  "Select Input Contained": {
    key: "0aeeec1c853b6245284581b97e9f7c04f63e1f60",
  },
  "Select Input Underlined": {
    key: "cbba2e72a7ad213bef170e4856c5cc6d25f61025",
  },
  "Text Area Outlined": {
    key: "cd98d2840dfb806c6d4565cf350241e5154b77e6",
  },
  "Text Area Contained": {
    key: "db19df1e8d74d68586027a3adedd40c52b242c26",
  },
  "Text Area Underlined": {
    key: "da1e71702ca3f2fa022054c190c88dfa36cb4d7e",
  },
  "Numeric Input (Arrows) Outlined": {
    key: "f6875ee813fd19313ff01f17878ae1bfdf26f188",
  },
  "Numeric Input (Arrows) Contained": {
    key: "707fc9732016ef5453e1f2bb6c80a484570ebf5e",
  },
  "Numeric Input (Arrows) Underlined": {
    key: "253d85ed1a71e4becb01a1678160ebc0f6480b47",
  },
  "Numeric Input (Buttons) Outlined": {
    key: "edafba6ef44ce824e754975cec86f294bc52c665",
  },
  "Numeric Input (Buttons) Contained": {
    key: "f09ecd4fa12ca25558f7ee9fc62e78a7c2aeb163",
  },
  "Numeric Input (Buttons) Underlined": {
    key: "c16a73a74fc69dcbd69b8207f268f998a7ff69af",
  },
  "Numeric Input (Stepper 1)": {
    key: "0c7481e296b1aa2fd6a9ee723e862b1fb1bb0879",
  },
  "Numeric Input (Stepper 2)": {
    key: "920d6e95c1ffe44c033a66901f5328e088b31f36",
  },
  "Radio Button (Icon)": {
    key: "d03856624a6be9ba50ce2bd04fc6df292ba35426",
  },
  "Radio Button Item (Icon)": {
    key: "67b1272ac6d5fedbf7cba7f4e99224e463abe392",
  },
  "Radio Button (Vector)": {
    key: "217f967a6f658672c005979c9bc388811c3eeeb4",
  },
  "Radio Button Item (Vector)": {
    key: "7f58a9fa0837ad52cf63ae52b08ed7de88c359bd",
  },
  Link: {
    key: "7c987b097108e85d6b25ab2037f58013b41648da",
  },
  Slider: {
    key: "634edb92fa517ba797c48d12666af58dd4f72b1c",
  },
  "Search (simple) Outlined": {
    key: "d1cbee420e90c775a15a3eee0e9e61bd32db4850",
  },
  "Search (simple) Contained": {
    key: "76fee6a0f51aa738a7463096bc84059c1ea9dd1b",
  },
  "Search (simple) Underlined": {
    key: "6555c6b1e3c06e769073ca627dc9259540b1c36e",
  },
  "Search (with label and helper text) Outlined": {
    key: "d17ab929f45a9a7fc16af3445762aa4b1ae0a995",
  },
  "Search (with label and helper text) Contained": {
    key: "c1cacd1f947a8218f0d3339ef2211861f712d2a8",
  },
  "Search (with label and helper text) Underlined": {
    key: "c03b44ca74712283b95b30126a6512b2bb6e060a",
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
