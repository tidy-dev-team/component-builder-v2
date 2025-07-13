import { ComponentPropertyInfo } from "./types";
import { PROPERTY_PREFIXES, HIDDEN_PROPERTIES } from "./constants";

export function getCleanName(prop: ComponentPropertyInfo): string {
  const [cleanName] = prop.name.split("#");
  return cleanName;
}

export function shouldBeHidden(prop: ComponentPropertyInfo): boolean {
  if (HIDDEN_PROPERTIES.includes(prop.name as any)) {
    return true;
  }

  const hiddenPrefixes = Object.values(PROPERTY_PREFIXES);
  return hiddenPrefixes.some((prefix) => prop.name.startsWith(prefix));
}

export function getEnabledProperties(
  properties: Record<string, boolean>
): Record<string, boolean> {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, isEnabled]) => !isEnabled)
  );
}

export function isDependentProperty(propertyName: string, baseName: string): boolean {
  return (
    propertyName.startsWith(`${PROPERTY_PREFIXES.TEXT_DEPENDENCY} ${baseName}#`) ||
    propertyName.startsWith(`${PROPERTY_PREFIXES.INSTANCE_SWAP_DEPENDENCY} ${baseName}#`)
  );
}
