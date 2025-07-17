import { atom } from "jotai";
import { ComponentPropertyInfo, PropertyUsedStates } from "../types";

export const selectedComponentAtom = atom<string | null>(null);

export const selectedComponentPropertiesAtom = atom<ComponentPropertyInfo[]>(
  []
);

export const propertyUsedStatesAtom = atom<PropertyUsedStates>({});
