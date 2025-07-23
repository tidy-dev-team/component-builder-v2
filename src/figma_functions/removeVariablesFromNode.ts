export function removeVariablesFromNode(node: SceneNode) {
  try {
    // Handle fills (background colors, etc.)
    if ("fills" in node && node.fills && Array.isArray(node.fills)) {
      const updatedFills = node.fills.map((fill) => {
        if (fill.type === "SOLID" && fill.boundVariables?.color) {
          // Get the resolved color value and remove the variable binding
          const resolvedColor = { ...fill };
          delete resolvedColor.boundVariables;
          return resolvedColor;
        }
        return fill;
      });
      (node as any).fills = updatedFills;
    }

    // Handle strokes
    if ("strokes" in node && node.strokes && Array.isArray(node.strokes)) {
      const updatedStrokes = node.strokes.map((stroke) => {
        if (stroke.type === "SOLID" && stroke.boundVariables?.color) {
          const resolvedStroke = { ...stroke };
          delete resolvedStroke.boundVariables;
          return resolvedStroke;
        }
        return stroke;
      });
      (node as any).strokes = updatedStrokes;
    }

    // Check if node has boundVariables before attempting to modify
    if (!node.boundVariables) {
      return;
    }

    // Create a mutable copy of boundVariables to work with
    const boundVars = { ...node.boundVariables };
    let hasChanges = false;

    // Handle corner radius (only for nodes that support it)
    if (
      ("cornerRadius" in node || "topLeftRadius" in node) &&
      "cornerRadius" in boundVars
    ) {
      delete (boundVars as any).cornerRadius;
      hasChanges = true;
    }

    // Handle individual corner radii
    const cornerProperties = [
      "topLeftRadius",
      "topRightRadius",
      "bottomLeftRadius",
      "bottomRightRadius",
    ] as const;
    cornerProperties.forEach((prop) => {
      if (prop in node && boundVars[prop]) {
        delete boundVars[prop];
        hasChanges = true;
      }
    });

    // Handle stroke weight
    if ("strokeWeight" in node && boundVars.strokeWeight) {
      delete boundVars.strokeWeight;
      hasChanges = true;
    }

    // Handle opacity
    if (boundVars.opacity) {
      delete boundVars.opacity;
      hasChanges = true;
    }

    // Handle spacing properties for auto layout
    if (
      node.type === "FRAME" ||
      node.type === "COMPONENT" ||
      node.type === "INSTANCE"
    ) {
      const spacingProps = [
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "itemSpacing",
      ] as const;
      spacingProps.forEach((prop) => {
        if (boundVars[prop]) {
          delete boundVars[prop];
          hasChanges = true;
        }
      });
    }

    // Handle text properties
    if (node.type === "TEXT") {
      const textProps = [
        "fontSize",
        "lineHeight",
        "letterSpacing",
        "paragraphSpacing",
      ] as const;
      textProps.forEach((prop) => {
        if (boundVars[prop]) {
          delete boundVars[prop];
          hasChanges = true;
        }
      });
    }

    // Handle width and height
    if (boundVars.width) {
      delete boundVars.width;
      hasChanges = true;
    }
    if (boundVars.height) {
      delete boundVars.height;
      hasChanges = true;
    }

    // Apply changes if any were made
    if (hasChanges) {
      if (Object.keys(boundVars).length === 0) {
        // Remove the entire boundVariables object if empty
        (node as any).boundVariables = undefined;
      } else {
        // Set the updated boundVariables
        (node as any).boundVariables = boundVars;
      }
    }
  } catch (error) {
    console.warn(`Failed to remove variables from node ${node.name}:`, error);
  }
}
