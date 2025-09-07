import { atom } from "jotai";
import { ComponentPropertyInfo, PropertyUsedStates } from "../types";

export const selectedComponentAtom = atom<string>("");

export const selectedComponentPropertiesAtom = atom<ComponentPropertyInfo[]>(
  []
);

export const propertyUsedStatesAtom = atom<PropertyUsedStates>({});

export const isLoadingComponentAtom = atom<boolean>(false);

export const componentDescriptionAtom = atom<string>("");
