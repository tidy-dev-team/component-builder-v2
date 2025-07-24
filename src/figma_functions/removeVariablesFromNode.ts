export function removeVariablesFromNode(node: SceneNode) {
  console.log(`[DEBUG] *** UPDATED removeVariablesFromNode v2.0 *** Checking node: ${node.name} (${node.type}) for bound variables`);
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
      console.log(`[DEBUG] Node ${node.name} has no boundVariables`);
      return;
    }
    
    console.log(`[DEBUG] Node ${node.name} has boundVariables:`, Object.keys(node.boundVariables));

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

    // Handle stroke weight (unified and individual)
    if ("strokeWeight" in node && boundVars.strokeWeight) {
      delete boundVars.strokeWeight;
      hasChanges = true;
    }
    
    // Handle individual stroke weights
    const strokeProps = [
      "strokeTopWeight",
      "strokeBottomWeight", 
      "strokeLeftWeight",
      "strokeRightWeight"
    ] as const;
    strokeProps.forEach((prop) => {
      if (boundVars[prop]) {
        delete boundVars[prop];
        hasChanges = true;
      }
    });

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
    
    // Handle any remaining common variable properties
    const additionalProps = [
      "strokeAlign",
      "strokeCap", 
      "strokeJoin",
      "strokeMiterLimit",
      "dashPattern",
      "rotation",
      "borderRadius", // alternative name for cornerRadius
      "gap", // for flex layouts
      "minWidth",
      "maxWidth", 
      "minHeight",
      "maxHeight"
    ] as const;
    
    additionalProps.forEach((prop) => {
      if (boundVars[prop as keyof typeof boundVars]) {
        delete boundVars[prop as keyof typeof boundVars];
        hasChanges = true;
      }
    });
    
    // Catch-all: Remove any remaining bound variable properties
    // This ensures we don't miss any variable types
    const remainingKeys = Object.keys(boundVars);
    if (remainingKeys.length > 0) {
      console.log(`[DEBUG] Removing remaining bound variables: ${remainingKeys.join(', ')}`);
      remainingKeys.forEach(key => {
        delete boundVars[key as keyof typeof boundVars];
        hasChanges = true;
      });
    }

    // Apply changes if any were made
    if (hasChanges) {
      console.log(`[DEBUG] Applying changes to ${node.name}. Remaining keys:`, Object.keys(boundVars));
      if (Object.keys(boundVars).length === 0) {
        // Remove the entire boundVariables object if empty
        (node as any).boundVariables = undefined;
        console.log(`[DEBUG] Removed all boundVariables from ${node.name}`);
      } else {
        // Set the updated boundVariables
        (node as any).boundVariables = boundVars;
        console.log(`[DEBUG] Updated boundVariables for ${node.name}`);
      }
      
      // Verify the removal worked
      const finalBoundVars = node.boundVariables;
      if (!finalBoundVars || Object.keys(finalBoundVars).length === 0) {
        console.log(`[DEBUG] ✅ CONFIRMED: ${node.name} has no bound variables after removal`);
      } else {
        console.log(`[DEBUG] ❌ WARNING: ${node.name} still has bound variables:`, Object.keys(finalBoundVars));
      }
    } else {
      console.log(`[DEBUG] No changes needed for ${node.name}`);
    }
  } catch (error) {
    console.warn(`Failed to remove variables from node ${node.name}:`, error);
  }
}
