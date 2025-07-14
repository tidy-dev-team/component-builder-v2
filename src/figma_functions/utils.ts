import { ComponentPropertyInfo } from "../types";

function getComponentPropertyName(
  component: ComponentNode,
  propName: string
): string | undefined {
  return Object.keys(component.componentPropertyDefinitions).find(
    (propertyName) => propertyName.startsWith(propName)
  );
}

function setComponentPropertyReference(
  node: SceneNode,
  property: string,
  propName: string
) {
  const references = { ...(node.componentPropertyReferences ?? {}) };
  (references as any)[property] = propName;
  node.componentPropertyReferences = references;
}

export function addNewTextProperty(
  component: ComponentNode,
  textNode: TextNode,
  propName: string,
  propDefault: string
) {
  component.addComponentProperty(propName, "TEXT", propDefault);
  const objName = getComponentPropertyName(component, propName);
  if (objName) {
    setComponentPropertyReference(textNode, "characters", objName);
  }
}

export function addNewBooleanProperty(
  component: ComponentNode,
  node: SceneNode,
  propName: string,
  propDefault: boolean
) {
  component.addComponentProperty(propName, "BOOLEAN", propDefault);
  const objName = getComponentPropertyName(component, propName);
  if (objName) {
    setComponentPropertyReference(node, "visible", objName);
  }
}

//TODO this function should return additionally index of the element to which this property applide (on a tree like 1-1-3-2)
export function getComponentPropertyInfo(
  node: ComponentNode | ComponentSetNode
): ComponentPropertyInfo[] {
  const properties = node.componentPropertyDefinitions;
  return Object.entries(properties)
    .map(([name, definition]) => ({
      name,
      ...definition,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
