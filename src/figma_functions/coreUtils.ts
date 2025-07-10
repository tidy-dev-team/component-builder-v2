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

// export function getDependentProps(
//   componentSet: ComponentSetNode,
//   propertyName: string
// ): string {
//   const properties = componentSet.componentPropertyDefinitions
// }
