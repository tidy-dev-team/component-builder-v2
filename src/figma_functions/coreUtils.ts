import { ComponentPropertyInfo } from "../types";
import { ComponentPropertyReferences } from "../types/figma";
import { errorService, ErrorCode } from "../errors";

export function getElementsWithComponentProperty(
  componentSet: ComponentSetNode,
  propertyName: string
): SceneNode[] {
  const matchedNodes: SceneNode[] = [];

  try {
    for (const variant of componentSet.children) {
      const nodes = getNodesWithPropertyReference(variant, propertyName);
      matchedNodes.push(...nodes);
    }
  } catch (error) {
    errorService.handleError(error, {
      operation: "GET_ELEMENTS_WITH_PROPERTY",
      propertyName,
      componentSetName: componentSet.name,
    });
  }

  return matchedNodes;
}

export function hasProperty(
  componentSet: ComponentSetNode,
  propertyName: string
): boolean {
  try {
    for (const variant of componentSet.children) {
      const nodes = getNodesWithPropertyReference(variant, propertyName);
      if (nodes.length > 0) {
        return true;
      }
    }
  } catch (error) {
    errorService.handleError(error, {
      operation: "HAS_PROPERTY",
      propertyName,
      componentSetName: componentSet.name,
    });
  }

  return false;
}

function getNodesWithPropertyReference(
  variant: SceneNode,
  propertyName: string
): SceneNode[] {
  return (variant as ComponentNode).findAll((node: SceneNode) => {
    const refs = node.componentPropertyReferences;
    if (!refs) return false;
    return Object.values(refs).includes(propertyName);
  });
}

export async function deleteVariantsExcept(
  componentSetNode: ComponentSetNode,
  property: string,
  valueToKeep?: string
) {
  if (!valueToKeep) {
    const propertyDefinitions = componentSetNode.componentPropertyDefinitions;
    if (propertyDefinitions && propertyDefinitions[property]) {
      valueToKeep = propertyDefinitions[property].defaultValue as string;
    }
  }

  figma.notify(
    `Deleting variants where "${property}" is not "${valueToKeep}"...`
  );

  const variants = [...componentSetNode.children];
  let deletedCount = 0;

  for (const variant of variants) {
    if (variant.type === "COMPONENT") {
      const originalName = variant.name;

      const properties = originalName.split(",").reduce((acc, part) => {
        const [key, value] = part.split("=").map((s) => s.trim());
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      if (
        properties.hasOwnProperty(property) &&
        properties[property] !== valueToKeep
      ) {
        variant.remove();
        deletedCount++;
      } else if (properties.hasOwnProperty(property)) {
        delete properties[property];
        const updatedName = Object.entries(properties)
          .map(([key, value]) => `${key}=${value}`)
          .join(", ");
        variant.name = updatedName;
      }
    }
  }

  if (deletedCount > 0) {
    figma.notify(`Successfully deleted ${deletedCount} variant(s).`);
  } else {
    figma.notify(
      `No variants were found where "${property}" was not "${valueToKeep}".`
    );
  }
}

export async function deleteVariantsWithValues(
  componentSetNode: ComponentSetNode,
  property: string,
  valuesToKeep: string[]
) {
  if (valuesToKeep.length === 0) {
    // If no values to keep, default to keeping only the default value
    const propertyDefinitions = componentSetNode.componentPropertyDefinitions;
    if (propertyDefinitions && propertyDefinitions[property]) {
      valuesToKeep = [propertyDefinitions[property].defaultValue as string];
    }
  }

  figma.notify(
    `Deleting variants where "${property}" is not in [${valuesToKeep.join(
      ", "
    )}]...`
  );

  const variants = [...componentSetNode.children];
  let deletedCount = 0;

  for (const variant of variants) {
    if (variant.type === "COMPONENT") {
      const originalName = variant.name;

      const properties = originalName.split(",").reduce((acc, part) => {
        const [key, value] = part.split("=").map((s) => s.trim());
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      if (
        properties.hasOwnProperty(property) &&
        !valuesToKeep.includes(properties[property])
      ) {
        variant.remove();
        deletedCount++;
      }
    }
  }

  // The variant removal is complete, no need to update component property definitions
  // Figma automatically updates the property definition when variants are removed
  // Attempting to manually update can cause "Invalid component property name" errors

  if (deletedCount > 0) {
    figma.notify(`Successfully deleted ${deletedCount} variant(s).`);
  } else {
    figma.notify(
      `No variants were found where "${property}" was not in the kept values.`
    );
  }
}

export function getComponentPropertyType(
  componentSet: ComponentSetNode,
  propertyName: string
): ComponentPropertyType | undefined {
  const componentProperties = componentSet.componentPropertyDefinitions;

  if (componentProperties && componentProperties[propertyName]) {
    return componentProperties[propertyName].type;
  }

  return undefined;
}

export function getPathToDefaultVariant(
  componentSet: ComponentSetNode,
  element: SceneNode
): number[] {
  const defaultVariant = componentSet.defaultVariant as ComponentNode;

  const path: number[] = [];
  let current: SceneNode = element;

  while (current !== defaultVariant) {
    const parent = current.parent;
    if (!parent || !("children" in parent)) {
      throw new Error(
        `Node is not inside the default variant "${defaultVariant.name}"`
      );
    }

    const siblings = (parent as ChildrenMixin).children as SceneNode[];
    const idx = siblings.indexOf(current);
    if (idx === -1) {
      throw new Error("Failed to locate node in parent.children");
    }
    path.push(idx);

    current = parent as SceneNode;
  }

  return path.reverse();
}

export function getComponentPropertyInfoFromComponent(
  node: ComponentNode
): ComponentPropertyInfo[] {
  try {
    // Validate that the node has the required properties
    if (!node) {
      console.error("Component node is null or undefined");
      return [];
    }

    console.log(`Getting properties for regular component: ${node.name}`);
    const properties: ComponentPropertyInfo[] = [];

    // Check if the component has componentPropertyDefinitions (like component sets)
    // This is the main case for your component
    if (
      node.componentPropertyDefinitions &&
      Object.keys(node.componentPropertyDefinitions).length > 0
    ) {
      console.log(
        "Component has componentPropertyDefinitions:",
        Object.keys(node.componentPropertyDefinitions)
      );

      Object.entries(node.componentPropertyDefinitions).forEach(
        ([propName, propDef]) => {
          console.log(`🔍 Processing component property: ${propName}`, propDef);
          // Validate property name
          if (typeof propName === "string" && propName.trim() !== "") {
            const property = {
              name: propName,
              type: propDef.type,
              defaultValue: propDef.defaultValue,
              preferredValues: propDef.preferredValues,
              variantOptions: propDef.variantOptions,
              boundVariables: propDef.boundVariables,
              path: [], // For regular components, we'll keep path empty for now
            };
            properties.push(property);
            console.log(
              `✅ Added component property: ${propName} (${propDef.type})`
            );
          } else {
            console.log("❌ Skipping property with invalid name:", propName);
          }
        }
      );
    }

    // For regular components, check for componentPropertyReferences
    if (
      node.componentPropertyReferences &&
      Object.keys(node.componentPropertyReferences).length > 0
    ) {
      console.log(
        "Component has componentPropertyReferences:",
        Object.keys(node.componentPropertyReferences)
      );
      const refs = node.componentPropertyReferences;

      // Extract unique property names from all references
      const propertyNames = new Set<string>();
      Object.values(refs).forEach((propName) => {
        if (typeof propName === "string") {
          propertyNames.add(propName);
        }
      });

      // Create property info for each unique property (avoid duplicates)
      propertyNames.forEach((propName) => {
        if (
          typeof propName === "string" &&
          propName.trim() !== "" &&
          !properties.some((p) => p.name === propName)
        ) {
          properties.push({
            name: propName,
            type: "TEXT", // Default to text type for regular components
            defaultValue: "",
            path: [],
          });
        } else if (typeof propName !== "string" || propName.trim() === "") {
          console.log(
            "Skipping property reference with invalid name:",
            propName
          );
        }
      });
    }

    // Also check if the component has componentProperties (legacy/different case)
    if (
      (node as any).componentProperties &&
      Object.keys((node as any).componentProperties).length > 0
    ) {
      console.log(
        "Component has componentProperties:",
        Object.keys((node as any).componentProperties)
      );

      Object.entries((node as any).componentProperties).forEach(
        ([propName, propDef]: [string, any]) => {
          // Avoid duplicates
          if (!properties.some((p) => p.name === propName)) {
            properties.push({
              name: propName,
              type: propDef.type || "TEXT",
              defaultValue: propDef.defaultValue || "",
              path: [],
            });
          }
        }
      );
    }

    // If no properties found, log it
    if (properties.length === 0) {
      console.log(`No exposed properties found for component: ${node.name}`);
      console.log(
        "Regular component imported successfully, but has no exposed properties"
      );
    }

    console.log(
      `Found ${properties.length} properties for component:`,
      properties.map((p) => p.name)
    );
    return properties.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(
      "Error getting component property info from component:",
      error
    );
    return [];
  }
}

export function getComponentPropertyInfo(
  node: ComponentSetNode
): ComponentPropertyInfo[] {
  try {
    // Validate that the node has the required properties
    if (!node) {
      console.error("Component set node is null or undefined");
      return [];
    }

    if (!node.componentPropertyDefinitions) {
      console.error("Component set does not have componentPropertyDefinitions");
      return [];
    }

    if (!node.defaultVariant) {
      console.error("Component set does not have defaultVariant");
      return [];
    }

    const properties = node.componentPropertyDefinitions;

    if (!properties || typeof properties !== "object") {
      console.error("Component property definitions are invalid");
      return [];
    }

    console.log(
      "🔍 Processing component set properties:",
      Object.keys(properties)
    );

    return Object.entries(properties)
      .filter(([name, definition]) => {
        console.log(
          `🔍 Processing component set property: ${name}`,
          definition
        );
        // Validate property name
        if (typeof name !== "string" || name.trim() === "") {
          console.log(
            "❌ Skipping component set property with invalid name:",
            name
          );
          return false;
        }
        console.log(
          `✅ Component set property valid: ${name} (${definition.type})`
        );
        return true;
      })
      .map(([name, definition]) => {
        try {
          const nodeWithProps = getNodesWithPropertyReference(
            node.defaultVariant,
            name
          );
          const path =
            nodeWithProps.length > 0
              ? getPathToDefaultVariant(node, nodeWithProps[0])
              : [];

          return {
            name,
            ...definition,
            path,
          };
        } catch (error) {
          console.error(`Error processing property "${name}":`, error);
          // Return a basic property definition without path if there's an error
          return {
            name,
            ...definition,
            path: [],
          };
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error getting component property info:", error);
    return [];
  }
}

export function removeEmptyProps(node: ComponentSetNode): void {
  const props = node.componentPropertyDefinitions;

  if (!props) {
    return;
  }

  for (const [key, property] of Object.entries(props)) {
    if (property.type !== "VARIANT" && !hasProperty(node, key)) {
      node.deleteComponentProperty(key);
    }
  }
}

export function getElementsWithComponentPropertyFromComponent(
  component: ComponentNode,
  propertyName: string
): SceneNode[] {
  const matchedNodes: SceneNode[] = [];

  try {
    const nodes = getNodesWithPropertyReference(component, propertyName);
    matchedNodes.push(...nodes);
  } catch (error) {
    errorService.handleError(error, {
      operation: "GET_ELEMENTS_WITH_PROPERTY",
      propertyName,
      componentName: component.name,
    });
  }

  return matchedNodes;
}

export function hasPropertyInComponent(
  component: ComponentNode,
  propertyName: string
): boolean {
  try {
    const nodes = getNodesWithPropertyReference(component, propertyName);
    return nodes.length > 0;
  } catch (error) {
    errorService.handleError(error, {
      operation: "HAS_PROPERTY",
      propertyName,
      componentName: component.name,
    });
  }

  return false;
}

export function getComponentDescription(node: ComponentSetNode | ComponentNode): string {
  try {
    // Check if the node has a description property
    if (node.description && typeof node.description === "string" && node.description.trim() !== "") {
      return node.description.trim();
    }

    // For component sets, check the default variant
    if (node.type === "COMPONENT_SET" && node.defaultVariant) {
      if (node.defaultVariant.description && typeof node.defaultVariant.description === "string" && node.defaultVariant.description.trim() !== "") {
        return node.defaultVariant.description.trim();
      }
    }

    // Return a default description if none found
    return "No description available";
  } catch (error) {
    console.error("Error getting component description:", error);
    return "Error loading description";
  }
}
