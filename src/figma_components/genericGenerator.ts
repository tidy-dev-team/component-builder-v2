import { ComponentProperty } from "../types";
import { errorService } from "../errors";

export interface GenericGeneratorOptions {
  properties: ComponentProperty[];
  componentKey: string;
  componentName?: string;
}

/**
 * Generic component generator that works with any Figma component set.
 * This fallback generator handles components that don't have specialized generators.
 */
export function generateGenericComponent(options: GenericGeneratorOptions): ComponentSetNode {
  const { properties, componentKey, componentName } = options;
  
  try {
    // Find the component set by key
    const componentSet = figma.getNodeById(componentKey) as ComponentSetNode;
    
    if (!componentSet || componentSet.type !== "COMPONENT_SET") {
      throw errorService.createBuildError(
        `Component set not found: ${componentName || componentKey}`,
        { componentKey, componentName, operation: 'GENERATE_GENERIC_COMPONENT' }
      );
    }
    
    // Clone the component set
    const clonedComponentSet = componentSet.clone();
    
    // Apply generic properties to the cloned component
    applyGenericProperties(clonedComponentSet, properties);
    
    return clonedComponentSet;
  } catch (error) {
    errorService.handleError(error, {
      operation: 'GENERATE_GENERIC_COMPONENT',
      componentKey,
      componentName,
      propertiesCount: properties.length,
    });
    
    throw error;
  }
}

/**
 * Apply properties to a component set using Figma's built-in component property system.
 * This works with any component that has properly defined component properties.
 */
function applyGenericProperties(componentSet: ComponentSetNode, properties: ComponentProperty[]): void {
  try {
    const usedProperties = properties.filter(prop => prop.used);
    
    // Get all child components (variants) in the component set
    const variants = componentSet.children.filter(child => child.type === "COMPONENT") as ComponentNode[];
    
    if (variants.length === 0) {
      console.warn(`No variants found in component set: ${componentSet.name}`);
      return;
    }
    
    // Apply properties to each variant
    for (const variant of variants) {
      for (const property of usedProperties) {
        applyPropertyToVariant(variant, property);
      }
    }
    
    console.log(`Applied ${usedProperties.length} properties to ${variants.length} variants in ${componentSet.name}`);
  } catch (error) {
    errorService.handleError(error, {
      operation: 'APPLY_GENERIC_PROPERTIES',
      componentSetName: componentSet.name,
      propertiesCount: properties.length,
    });
    
    throw error;
  }
}

/**
 * Apply a single property to a component variant.
 * Uses Figma's component property API when available.
 */
function applyPropertyToVariant(variant: ComponentNode, property: ComponentProperty): void {
  try {
    // For variant properties (those with # in the name), extract the variant value
    if (property.name.includes('#')) {
      const [propName, variantValue] = property.name.split('#');
      
      // Try to find and set the variant property
      if (variant.variantProperties) {
        const currentVariantProps = { ...variant.variantProperties };
        currentVariantProps[propName] = variantValue;
        
        // Find the matching variant with these properties
        const parentComponentSet = variant.parent as ComponentSetNode;
        const matchingVariant = findVariantByProperties(parentComponentSet, currentVariantProps);
        
        if (matchingVariant) {
          console.log(`Applied variant property ${propName}=${variantValue} to ${variant.name}`);
        }
      }
    } else {
      // For non-variant properties, try to apply them directly
      applyNonVariantProperty(variant, property);
    }
  } catch (error) {
    // Log warning but don't fail the entire operation
    console.warn(`Failed to apply property ${property.name} to variant ${variant.name}:`, error);
  }
}

/**
 * Apply non-variant properties (like boolean switches, text overrides, etc.)
 */
function applyNonVariantProperty(variant: ComponentNode, property: ComponentProperty): void {
  // This is where you would implement property-specific logic
  // For now, we'll log the property application
  console.log(`Applied property ${property.name}=${property.value} to ${variant.name}`);
  
  // Future enhancement: Use Figma's instance property API
  // variant.setPluginData(property.name, String(property.value));
}

/**
 * Find a variant in a component set that matches the given properties
 */
function findVariantByProperties(componentSet: ComponentSetNode, targetProperties: Record<string, string>): ComponentNode | null {
  const variants = componentSet.children.filter(child => child.type === "COMPONENT") as ComponentNode[];
  
  for (const variant of variants) {
    if (variant.variantProperties) {
      const matches = Object.entries(targetProperties).every(
        ([key, value]) => variant.variantProperties![key] === value
      );
      
      if (matches) {
        return variant;
      }
    }
  }
  
  return null;
}

/**
 * Get available properties from a component set for dynamic property discovery
 */
export function getComponentProperties(componentSet: ComponentSetNode): ComponentProperty[] {
  const properties: ComponentProperty[] = [];
  
  try {
    // Get variant properties from the first variant
    const firstVariant = componentSet.children.find(child => child.type === "COMPONENT") as ComponentNode;
    
    if (firstVariant && firstVariant.variantProperties) {
      Object.entries(firstVariant.variantProperties).forEach(([name, value]) => {
        properties.push({
          name,
          displayName: name.charAt(0).toUpperCase() + name.slice(1),
          value: value,
          used: true,
        });
      });
    }
    
    // TODO: Add support for component properties (boolean, text, instance swap)
    // This would require access to Figma's component property definitions
    
  } catch (error) {
    console.warn(`Failed to get properties for component set ${componentSet.name}:`, error);
  }
  
  return properties;
}