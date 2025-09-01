import { ComponentData } from "../types";

// Helper function to create separator entries
const createSeparator = () => ({ key: "", type: "separator" as const });

// Component groups with separators
const componentGroups = [
  // Avatar group
  [
    ["Avatar", "e978573d54b4b61133aaa9fb1287eef36df0e1ed"],
    ["Username", "06dd30dbb923f224be343051b7b12028a58f7c2a"],
    ["Avatar Number", "02be470b66ff4d2c85ada06efbe67317f8cc64f7"],
    ["Avatar Group", "e5496c2a096678c5554623ba200b676372433be7"],
  ],

  // Badge group
  [
    ["Badge", "383eda2f42660613057a870cde686c7e8b076904"],
    ["Asset Badge", "16a4808ca941ac44a9b7cf20c9305578e8b1501a"],
    ["Text Badge", "0d1e3c485d118955784334f1cd0bdf004b16b155"],
    ["Pill Badge", "36a77f2b4ad268f7821d3976f21398c1a1900a98"],
  ],

  // Navigation & Buttons
  [
    ["Breadcrumbs", "8563670cf1d3591bd4f3af9d0156cc0a7d99dd0b"],
    ["Buttons", "1a45acec266bbb1bd1338744453eb9e33aa2af53"],
    ["Button Icon", "37a61a1f231653e5fe0d8fb5afeb561f1dfe3807"],
    ["Button Text", "1484a29ce5e8cd702dc12913d2b79a464d269227"],
  ],

  // Form Controls
  [
    ["Checkbox Icon", "0e360b2a80465d5bcbe6c218222fb5896351ed97"],
    ["Checkbox Item Icon", "0a0e2be0f6ece4620ef8d28b39ee6995656393b2"],
    ["CheckboxVector", "43e9aef5432cf48a3cf2b727a815872f717ba211"],
    ["Checkbox Item Vector", "b07ff3f8009f606c7537098bfa932d1e916206ac"],
    ["Chips", "d785439063b42d9fbe449f3d19223cfa825a47bf"],
  ],

  // Inputs
  [
    ["Text Input Outlined", "3fa0112d53708a35080dfd22530ebf3dbbbcdf4d"],
    ["Text Input Contained", "46e44149a998ceae1bdbff378c85818e4ecd89e6"],
    ["Text Input Underlined", "2ef5964e087304eaecb3887bb3b2441834450f21"],
    ["Select Input Outlined", "bb1ce670f2e5eb30645a8381232c4ab166a56834"],
    ["Select Input Contained", "0aeeec1c853b6245284581b97e9f7c04f63e1f60"],
    ["Select Input Underlined", "cbba2e72a7ad213bef170e4856c5cc6d25f61025"],
    ["Text Area Outlined", "cd98d2840dfb806c6d4565cf350241e5154b77e6"],
    ["Text Area Contained", "db19df1e8d74d68586027a3adedd40c52b242c26"],
    ["Text Area Underlined", "da1e71702ca3f2fa022054c190c88dfa36cb4d7e"],
    [
      "Numeric Input (Arrows) Outlined",
      "f6875ee813fd19313ff01f17878ae1bfdf26f188",
    ],
    [
      "Numeric Input (Arrows) Contained",
      "707fc9732016ef5453e1f2bb6c80a484570ebf5e",
    ],
    [
      "Numeric Input (Arrows) Underlined",
      "253d85ed1a71e4becb01a1678160ebc0f6480b47",
    ],
    [
      "Numeric Input (Buttons) Outlined",
      "edafba6ef44ce824e754975cec86f294bc52c665",
    ],
    [
      "Numeric Input (Buttons) Contained",
      "f09ecd4fa12ca25558f7ee9fc62e78a7c2aeb163",
    ],
    [
      "Numeric Input (Buttons) Underlined",
      "c16a73a74fc69dcbd69b8207f268f998a7ff69af",
    ],
    ["Numeric Input / Stepper 1", "0c7481e296b1aa2fd6a9ee723e862b1fb1bb0879"],
    ["Numeric Input / Stepper 2", "920d6e95c1ffe44c033a66901f5328e088b31f36"],
  ],

  // Radio & Other Controls
  [
    ["Radio Button / Icon", "d03856624a6be9ba50ce2bd04fc6df292ba35426"],
    ["Radio Button Item / Icon", "67b1272ac6d5fedbf7cba7f4e99224e463abe392"],
    ["Radio Button / Vector", "217f967a6f658672c005979c9bc388811c3eeeb4"],
    ["Radio Button Item / Vector", "7f58a9fa0837ad52cf63ae52b08ed7de88c359bd"],
  ],

  //Link
  [["Link", "7c987b097108e85d6b25ab2037f58013b41648da"]],

  //Slider
  [["Slider", "634edb92fa517ba797c48d12666af58dd4f72b1c"]],
  // Search
  [
    ["Search / Simple / Outlined", "d1cbee420e90c775a15a3eee0e9e61bd32db4850"],
    ["Search / Simple / Contained", "76fee6a0f51aa738a7463096bc84059c1ea9dd1b"],
    [
      "Search / Simple / Underlined",
      "6555c6b1e3c06e769073ca627dc9259540b1c36e",
    ],
    [
      "Search / Label and helper text / Outlined",
      "d17ab929f45a9a7fc16af3445762aa4b1ae0a995",
    ],
    [
      "Search / Label and helper text / Contained",
      "c1cacd1f947a8218f0d3339ef2211861f712d2a8",
    ],
    [
      "Search / Label and helper text / Underlined",
      "c03b44ca74712283b95b30126a6512b2bb6e060a",
    ],
  ],

  // Tabs
  [
    [
      "Tabs / Outline Tab Bar",
      "ad5a3f707653e91485fee7dea28e908ef701a8b9",
      "component",
    ],
    [
      "Tabs / Underlined Tab Bar 1",
      "37f62921ac921adc6f419a92b0080368e6e8f37e",
      "component",
    ],
    [
      "Tabs / Underlined Tab Bar 2",
      "65116e7221f23ed5e253ffc4b1c6ec03ab481ffd",
      "component",
    ],
    [
      "Tabs / Skeuomorphic tab Bar",
      "07b61cc201a0ccc2e8f2199b6baa24b20e692069",
      "component",
    ],
    [
      "Tabs / Raised tab Bar",
      "d12428eb3ea9017202790ad1fe14056e7e6465c3",
      "component",
    ],
    [
      "Tabs / Vertical tab Bar",
      "d620c1354238b843525344500fc6ec0f62d8d5b8",
      "component",
    ],
    [
      "Tabs / Anatomy / Outlined tabs",
      "8980d2beaaabc9c4afaca42bc99a00b8631bce20",
    ],
  ],

  // Tooltip
  [
    ["Tooltip", "f6ee011c5c55ec82079db4ae04cd80cb408daa05"],
    ["Tooltip / Outlined", "8dbe59d0fbd67af83c2f1eceb19b13e0e53e8acb"],
  ],

  //Toggle
  [
    ["Toggle / Icon on knob", "bbe9c3a1d79cbcb7c35b2471d9bc10ca0a42d10e"],
    ["Toggle / Icon on body", "35e62944ba32040d4f3e90dd9639801da1e105c8"],
    ["Toggle / Text on body", "5d5898062c6a69ee15036293dfc731fedf5b3da5"],
    ["Toggle / Larger knob", "6a7c4232f96ecd7dc34a2a1248ecaed9d06d39e2"],
    ["Toggle / Toggle item", "83bc1f0e7c89e5499a5ea80b96713bc64691ea87"],
  ],

  //Molecules

  //Banner
  [["Banner / Contained", "4051ed5436e3160aa971fb070c97a0cd59d688d4"]],
];

// Build the registry with automatic separators
export const componentRegistry: ComponentData = componentGroups.reduce(
  (registry, group, groupIndex) => {
    // Add separator before each group (except the first one)
    if (groupIndex > 0) {
      registry[`---separator-${groupIndex}---`] = createSeparator();
    }

    // Add all components in the group
    group.forEach(([name, key, type]) => {
      registry[name] = {
        key,
        ...(type && { type: type as "component" }),
      };
    });

    return registry;
  },
  {} as ComponentData
);
