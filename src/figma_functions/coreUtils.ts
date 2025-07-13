/**
 * Finds all elements within a ComponentSet that reference a given component property.
 *
 * @param componentSet - The ComponentSetNode to search inside
 * @param propertyName - The component property key (e.g., "icon#2192:308") to match
 * @returns Array of SceneNode elements that have matching componentPropertyReferences
 */
export function getElementsWithComponentProperty(
  componentSet: ComponentSetNode,
  propertyName: string
): SceneNode[] {
  const matchedNodes: SceneNode[] = [];

  for (const variant of componentSet.children) {
    const nodes = (variant as ComponentNode).findAll((node: SceneNode) => {
      const refs: Record<string, string> | undefined = (node as any)
        .componentPropertyReferences;
      if (!refs) return false;
      return Object.values(refs).includes(propertyName);
    });
    matchedNodes.push(...nodes);
  }

  return matchedNodes;
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

/**
 * Gets the type of a component property from a ComponentSet.
 *
 * @param componentSet - The ComponentSetNode to search in
 * @param propertyName - The name of the property to find the type for
 * @returns The ComponentPropertyType if found, undefined otherwise
 */
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
