import {
  getComponentPropertyType,
  getElementsWithComponentProperty,
  getElementsWithComponentPropertyFromComponent,
  hasPropertyInComponent,
} from "../figma_functions/coreUtils";
import { isDependentProperty } from "../ui_utils";
import { errorService } from "../errors";
import { BuildEventData, PropertyUsedStates } from "../types";

export interface PropertyProcessingOptions {
  buildData: BuildEventData;
  componentSet: ComponentSetNode;
  disabledProperties: PropertyUsedStates;
}

export interface PropertyProcessingResult {
  processedProperties: string[];
  skippedProperties: string[];
  deletedElements: number;
  errors: string[];
}

export function processNonVariantProperties(
  options: PropertyProcessingOptions
): PropertyProcessingResult {
  const { buildData, componentSet, disabledProperties } = options;
  const result: PropertyProcessingResult = {
    processedProperties: [],
    skippedProperties: [],
    deletedElements: 0,
    errors: [],
  };

  const dataKeys = Object.keys(buildData);
  const propKeys = Object.keys(disabledProperties);

  // Handle non-variant properties
  for (const propKey of propKeys) {
    try {
      const propertyType = getComponentPropertyType(componentSet, propKey);
      if (propertyType !== "VARIANT") {
        const processResult = processNonVariantProperty(
          componentSet,
          propKey,
          dataKeys
        );

        if (processResult.success) {
          result.processedProperties.push(propKey);
          result.deletedElements += processResult.deletedElements;
        } else {
          result.skippedProperties.push(propKey);
          result.errors.push(
            processResult.error || `Failed to process ${propKey}`
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(
        `Failed to process property "${propKey}": ${errorMessage}`
      );
      result.skippedProperties.push(propKey);

      errorService.handleError(error, {
        operation: "PROCESS_NON_VARIANT_PROPERTY",
        propertyName: propKey,
      });
    }
  }

  return result;
}

interface PropertyProcessResult {
  success: boolean;
  deletedElements: number;
  error?: string;
}

function processNonVariantProperty(
  componentSet: ComponentSetNode,
  propKey: string,
  dataKeys: string[]
): PropertyProcessResult {
  try {
    const propertyName = propKey.split("#")[0];
    const foundElements = getElementsWithComponentProperty(
      componentSet,
      propKey
    );
    let deletedElements = 0;

    // Delete property and its elements
    if (foundElements.length > 0) {
      try {
        if (componentSet.componentPropertyDefinitions[propKey]) {
          componentSet.deleteComponentProperty(propKey);
        }
        foundElements.forEach((element) => element.remove());
        deletedElements = foundElements.length;
      } catch (deleteError) {
        errorService.handleError(deleteError, {
          operation: "DELETE_PROPERTY_ELEMENTS",
          propertyName: propKey,
          elementsCount: foundElements.length,
        });
        throw deleteError;
      }
    }

    // Handle dependent properties
    const dependentProp = dataKeys.find((property) =>
      isDependentProperty(property, propertyName)
    );

    if (
      dependentProp &&
      componentSet.componentPropertyDefinitions[dependentProp]
    ) {
      try {
        componentSet.deleteComponentProperty(dependentProp);
      } catch (deleteError) {
        errorService.handleError(deleteError, {
          operation: "DELETE_DEPENDENT_PROPERTY",
          propertyName: dependentProp,
          parentProperty: propertyName,
        });
        throw deleteError;
      }
    }

    return { success: true, deletedElements };
  } catch (error) {
    return {
      success: false,
      deletedElements: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function getDisabledPropertyKeys(buildData: BuildEventData): string[] {
  return Object.keys(buildData).filter((key) => !buildData[key]);
}

export function getPropertyElementCount(
  componentSet: ComponentSetNode,
  propertyName: string
): number {
  try {
    const elements = getElementsWithComponentProperty(
      componentSet,
      propertyName
    );
    return elements.length;
  } catch (error) {
    errorService.handleError(error, {
      operation: "GET_PROPERTY_ELEMENT_COUNT",
      propertyName,
    });
    return 0;
  }
}

// Regular component property processing
export interface ComponentPropertyProcessingOptions {
  buildData: BuildEventData;
  component: ComponentNode;
  disabledProperties: PropertyUsedStates;
}

export function processComponentProperties(
  options: ComponentPropertyProcessingOptions
): PropertyProcessingResult {
  const { buildData, component, disabledProperties } = options;
  const result: PropertyProcessingResult = {
    processedProperties: [],
    skippedProperties: [],
    deletedElements: 0,
    errors: [],
  };

  const propKeys = Object.keys(disabledProperties);

  // Process properties that are disabled (unchecked in UI)
  for (const propKey of propKeys) {
    if (!buildData[propKey]) {
      // Property is disabled (checkbox unchecked)
      try {
        const processResult = processComponentProperty(component, propKey);

        if (processResult.success) {
          result.processedProperties.push(propKey);
          result.deletedElements += processResult.deletedElements;
        } else {
          result.skippedProperties.push(propKey);
          result.errors.push(
            processResult.error || `Failed to process ${propKey}`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push(
          `Failed to process property "${propKey}": ${errorMessage}`
        );
        result.skippedProperties.push(propKey);

        errorService.handleError(error, {
          operation: "PROCESS_COMPONENT_PROPERTY",
          propertyName: propKey,
          componentName: component.name,
        });
      }
    } else {
      // Property is enabled, so we keep it
      result.skippedProperties.push(propKey);
    }
  }

  return result;
}

function processComponentProperty(
  component: ComponentNode,
  propKey: string
): PropertyProcessResult {
  try {
    const propertyName = propKey.split("#")[0];
    const foundElements = getElementsWithComponentPropertyFromComponent(
      component,
      propKey
    );
    let deletedElements = 0;

    console.log(
      `Processing component property: ${propKey}, found ${foundElements.length} elements`
    );

    // Delete property definition if it exists
    if (
      component.componentPropertyDefinitions &&
      component.componentPropertyDefinitions[propKey]
    ) {
      try {
        component.deleteComponentProperty(propKey);
        console.log(`Deleted component property definition: ${propKey}`);
      } catch (deleteError) {
        console.log(
          `Could not delete property definition for ${propKey}:`,
          deleteError
        );
        // Continue even if we can't delete the property definition
      }
    }

    // Remove elements that were using this property
    if (foundElements.length > 0) {
      try {
        foundElements.forEach((element) => element.remove());
        deletedElements = foundElements.length;
        console.log(
          `Removed ${deletedElements} elements for property: ${propKey}`
        );
      } catch (deleteError) {
        errorService.handleError(deleteError, {
          operation: "DELETE_COMPONENT_PROPERTY_ELEMENTS",
          propertyName: propKey,
          elementsCount: foundElements.length,
        });
        throw deleteError;
      }
    }

    return { success: true, deletedElements };
  } catch (error) {
    return {
      success: false,
      deletedElements: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function hasPropertyDefinition(
  componentSet: ComponentSetNode,
  propertyName: string
): boolean {
  return propertyName in componentSet.componentPropertyDefinitions;
}

export function getDependentProperties(
  propertyName: string,
  allPropertyKeys: string[]
): string[] {
  const baseName = propertyName.split("#")[0];
  return allPropertyKeys.filter((key) => isDependentProperty(key, baseName));
}
