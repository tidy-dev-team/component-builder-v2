import { atom } from "jotai";
// import { ComponentProperties } from "../types";

export const selectedComponentAtom = atom<string | null>(null);

export const selectedComponentPropertiesAtom = atom<ComponentProperties>({});

export const propertyUsedStatesAtom = atom<Record<string, boolean>>({});

// export const updatedComponentPropertiesAtom = atom<ComponentProperties>((get) => {
//   const originalProps = get(selectedComponentPropertiesAtom);
//   const usedStates = get(propertyUsedStatesAtom);

//   const updatedProps: ComponentProperties = {};

//   Object.entries(originalProps).forEach(([key, property]) => {
//     updatedProps[key] = {
//       ...property,
//       used: usedStates[key] ?? property.used,
//     };
//   });

//   return updatedProps;
// });
