import { ComponentPropertyInfo } from "./types";
import { PROPERTY_PREFIXES, HIDDEN_PROPERTIES } from "./constants";

export function getCleanName(prop: ComponentPropertyInfo): string {
  if (prop.name.includes("#")) {
    if (prop.type === "VARIANT") {
      // For variant options, show the option value (after #)
      const [, optionValue] = prop.name.split("#");
      return optionValue;
    } else {
      // For regular properties with #, show the part before # (clean name)
      const [cleanName] = prop.name.split("#");
      return cleanName;
    }
  }
  // For properties without #, show the property name
  return prop.name;
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

export function findChildProperties(
  parentProperty: ComponentPropertyInfo,
  allProperties: ComponentPropertyInfo[]
): ComponentPropertyInfo[] {
  const parentPath = parentProperty.path || [];
  
  return allProperties.filter(prop => {
    const childPath = prop.path || [];
    
    // A property is a child if:
    // 1. It has a longer path than the parent
    // 2. Its path starts with the parent's path
    if (childPath.length <= parentPath.length) {
      return false;
    }
    
    // Check if child path starts with parent path
    for (let i = 0; i < parentPath.length; i++) {
      if (childPath[i] !== parentPath[i]) {
        return false;
      }
    }
    
    return true;
  });
}

export function isChildDisabledByParent(
  property: ComponentPropertyInfo,
  allProperties: ComponentPropertyInfo[],
  usedStates: Record<string, boolean>
): boolean {
  const propertyPath = property.path || [];
  
  // Check each potential parent level
  for (let i = propertyPath.length - 1; i > 0; i--) {
    const parentPath = propertyPath.slice(0, i);
    
    // Find the parent property with this path
    const parentProperty = allProperties.find(prop => {
      const path = prop.path || [];
      return path.length === parentPath.length && 
             path.every((val, idx) => val === parentPath[idx]);
    });
    
    // If parent exists and is unchecked, this child should be disabled
    if (parentProperty && !usedStates[parentProperty.name]) {
      return true;
    }
  }
  
  return false;
}
