import { ComponentPropertyInfo } from "../types";

export function getElementsWithComponentProperty(
  componentSet: ComponentSetNode,
  propertyName: string
): SceneNode[] {
  const matchedNodes: SceneNode[] = [];

  for (const variant of componentSet.children) {
    const nodes = getNodesWithPropertyReference(variant, propertyName);
    matchedNodes.push(...nodes);
  }

  return matchedNodes;
}

function getNodesWithPropertyReference(
  variant: SceneNode,
  propertyName: string
): SceneNode[] {
  return (variant as ComponentNode).findAll((node: SceneNode) => {
    const refs: Record<string, string> | undefined = (node as any)
      .componentPropertyReferences;
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

      const properties = originalName.split(",").reduce(
        (acc, part) => {
          const [key, value] = part.split("=").map((s) => s.trim());
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

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
    `Deleting variants where "${property}" is not in [${valuesToKeep.join(", ")}]...`
  );

  const variants = [...componentSetNode.children];
  let deletedCount = 0;

  for (const variant of variants) {
    if (variant.type === "COMPONENT") {
      const originalName = variant.name;

      const properties = originalName.split(",").reduce(
        (acc, part) => {
          const [key, value] = part.split("=").map((s) => s.trim());
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

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

export function getComponentPropertyInfo(
  node: ComponentSetNode
): ComponentPropertyInfo[] {
  const properties = node.componentPropertyDefinitions;
  return Object.entries(properties)
    .map(([name, definition]) => {
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
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
