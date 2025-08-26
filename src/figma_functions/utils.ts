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

  try {
    if (!node) {
      console.error("Component node is null or undefined");
      return exposedInstances;
    }

    if (!node.findAll) {
      console.error("Component node does not have findAll method");
      return exposedInstances;
    }

    node.findAll((child) => {
      try {
        if (child && child.type === "INSTANCE" && child.isExposedInstance) {
          exposedInstances.push({
            name: child.name || "Unnamed Instance",
            id: child.id || "",
            key: child.mainComponent?.key || "",
          });
        }
      } catch (error) {
        console.error("Error processing child node:", error);
      }
      return false; // Continue searching through all nodes
    });
  } catch (error) {
    console.error("Error finding exposed instances:", error);
  }

  return exposedInstances;
}
