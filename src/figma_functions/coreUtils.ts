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
  valueToKeep: string
) {
  if (!componentSetNode || componentSetNode.type !== "COMPONENT_SET") {
    figma.notify("Error: Please provide a valid Component Set node.");
    return;
  }

  figma.notify(
    `Deleting variants where "${property}" is not "${valueToKeep}"...`
  );

  // We iterate over a copy of the children array because removing a child
  // while iterating over the original array can lead to skipping elements.
  const variants = [...componentSetNode.children];
  let deletedCount = 0;

  // Loop through each variant component to check its properties.
  for (const variant of variants) {
    if (variant.type === "COMPONENT") {
      // The variant properties are stored in a "key=value, key2=value2" format in the component's name.
      const originalName = variant.name;

      // Parse the existing properties from the name string into an object.
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

      // Check if the variant has the target property AND its value is NOT the one we want to keep.
      if (
        properties.hasOwnProperty(property) &&
        properties[property] !== valueToKeep
      ) {
        // If the condition is met, remove the variant node from the document.
        variant.remove();
        deletedCount++;
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
