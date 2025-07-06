import { atom } from "jotai";
import { ComponentProperties } from "../types";

export const selectedComponentAtom = atom<string | null>(null);

export const selectedComponentPropertiesAtom = atom<ComponentProperties>({});

export const propertyUsedStatesAtom = atom<Record<string, boolean>>({});
