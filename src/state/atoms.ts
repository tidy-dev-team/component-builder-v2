import { atom } from "jotai";
import { ComponentPropertyInfo } from "../types";

export const selectedComponentAtom = atom<string | null>(null);

export const selectedComponentPropertiesAtom = atom<ComponentPropertyInfo[]>(
  []
);

export const propertyUsedStatesAtom = atom<Record<string, boolean>>({});
