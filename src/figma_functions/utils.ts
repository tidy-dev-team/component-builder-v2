function getComponentPropertyName(
  component: ComponentNode,
  propName: string
): string | undefined {
  return Object.keys(component.componentPropertyDefinitions).find(
    (propertyName) => propertyName.startsWith(propName)
  );
}

import {
  PropertyReferenceField,
  ComponentPropertyReferences,
} from "../types/figma";

function setComponentPropertyReference(
  node: SceneNode,
  property: PropertyReferenceField,
  propName: string
) {
  const references: ComponentPropertyReferences = {
    ...(node.componentPropertyReferences ?? {}),
  };
  references[property] = propName;
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

export function findExposedInstances(node: ComponentNode) {
  const exposedInstances: Array<{ name: string; id: string; key: string }> = [];

  node.findAll((child) => {
    if (child.type === "INSTANCE" && child.isExposedInstance) {
      exposedInstances.push({
        name: child.name,
        id: child.id,
        key: child.mainComponent?.key || "",
      });
    }
    return false; // Continue searching through all nodes
  });

  return exposedInstances;
}
