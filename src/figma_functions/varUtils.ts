import { variablesData, getVariableCategoryNames, getVariableCategory, type Variable as VariableData, type VariableCategory } from "../variables_data/variables";

export async function createVariables() {
  console.log("Creating design system variables...");
  const categoryNames = getVariableCategoryNames();
  
  for (const categoryName of categoryNames) {
    const category = getVariableCategory(categoryName);
    if (!category) {
      console.warn(`Category ${categoryName} not found`);
      continue;
    }

    console.log(`Processing ${categoryName} variables...`);
    await createVariablesForCategory(category, categoryName);
  }
  
  console.log("Design system variables creation complete");
}

async function createVariablesForCategory(category: VariableCategory, categoryName: string) {
  const { collectionName, prefix, global, semantic } = category;
  
  // Check if collection already exists
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find(
    (c) => c.name === collectionName
  );

  if (!collection) {
    // Create collection
    collection = figma.variables.createVariableCollection(collectionName);
    console.log(`Created ${collectionName} collection`);
  }

  // Check existing variables with this prefix
  const existingVariables = [];
  for (const id of collection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (variable && variable.name.startsWith(prefix)) {
      existingVariables.push(variable.name);
    }
  }

  const defaultModeId = collection.defaultModeId;
  const createdVariables = new Map<string, Variable>(); // Track created variables by name

  // First pass: Create global variables
  for (const globalVar of global) {
    if (!existingVariables.includes(globalVar.name)) {
      const variable = figma.variables.createVariable(
        globalVar.name,
        collection,
        globalVar.type as VariableResolvedDataType
      );

      // Set the value (global variables have direct values)
      try {
        variable.setValueForMode(
          defaultModeId,
          globalVar.values[0].value as VariableValue
        );
        createdVariables.set(globalVar.name, variable);
        console.log(`Created global variable: ${globalVar.name}`);
      } catch (error) {
        console.error(`Could not set value for ${globalVar.name}:`, error);
      }
    } else {
      // Add existing variable to map for semantic variable references
      const existingVar = await getExistingVariableByName(collection, globalVar.name);
      if (existingVar) {
        createdVariables.set(globalVar.name, existingVar);
      }
      console.log(`Global variable already exists: ${globalVar.name}`);
    }
  }

  // Second pass: Create semantic variables with aliases to global variables
  for (const semanticVar of semantic) {
    if (!existingVariables.includes(semanticVar.name)) {
      const variable = figma.variables.createVariable(
        semanticVar.name,
        collection,
        semanticVar.type as VariableResolvedDataType
      );

      // Find the referenced global variable
      const referencedId = semanticVar.values[0].referencedVariableId;
      const referencedGlobal = global.find((g: VariableData) => g.id === referencedId);

      if (referencedGlobal) {
        const referencedVariable = createdVariables.get(referencedGlobal.name);

        if (referencedVariable) {
          try {
            // Create alias to the global variable
            variable.setValueForMode(defaultModeId, {
              type: "VARIABLE_ALIAS",
              id: referencedVariable.id,
            } as VariableValue);
            console.log(
              `Created semantic variable: ${semanticVar.name} -> ${referencedGlobal.name}`
            );
          } catch (error) {
            console.error(`Could not set alias for ${semanticVar.name}:`, error);
          }
        } else {
          console.warn(
            `Referenced variable not found: ${referencedGlobal.name}`
          );
        }
      } else {
        console.warn(
          `Referenced global variable not found for ${semanticVar.name}`
        );
      }
    } else {
      console.log(`Semantic variable already exists: ${semanticVar.name}`);
    }
  }
}

async function getExistingVariableByName(collection: VariableCollection, name: string): Promise<Variable | null> {
  for (const id of collection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (variable && variable.name === name) {
      return variable;
    }
  }
  return null;
}

// Updated function to retrieve variables from Figma and format them like variables.ts
export async function getVariablesFromFigma(categoryName?: string) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  console.log("Available collections:", collections.map(c => c.name));

  const result: Record<string, { global: VariableData[], semantic: VariableData[] }> = {};
  
  // If specific category requested, only get that one
  const categoriesToProcess = categoryName 
    ? [categoryName] 
    : getVariableCategoryNames();
  
  for (const catName of categoriesToProcess) {
    const category = getVariableCategory(catName);
    if (!category) {
      console.warn(`Category ${catName} not found`);
      continue;
    }

    const collection = collections.find(
      (c) => c.name === category.collectionName
    );
    
    if (!collection) {
      console.log(`${category.collectionName} collection not found`);
      result[catName] = { global: [], semantic: [] };
      continue;
    }

    const globalVariables: VariableData[] = [];
    const semanticVariables: VariableData[] = [];

    for (const id of collection.variableIds) {
      const figmaVariable = await figma.variables.getVariableByIdAsync(id);
      if (figmaVariable && figmaVariable.name.startsWith(category.prefix)) {
        const variableData: VariableData = {
          id: figmaVariable.id,
          name: figmaVariable.name,
          type: figmaVariable.resolvedType,
          values: Object.entries(figmaVariable.valuesByMode).map(
            ([modeId, value]) => ({
              mode: modeId,
              value: value as (number | string | { type: "VARIABLE_ALIAS"; id: string }),
              // Check if value is an alias (references another variable)
              isAlias:
                typeof value === "object" &&
                value !== null &&
                "type" in value &&
                (value as any).type === "VARIABLE_ALIAS",
              // Store the referenced variable ID if it's an alias
              referencedVariableId:
                typeof value === "object" && value !== null && "id" in value
                  ? (value as any).id
                  : null,
            })
          ),
        };

        // Classify as global or semantic based on naming convention
        if (figmaVariable.name.includes("/semantic/")) {
          semanticVariables.push(variableData);
        } else {
          globalVariables.push(variableData);
        }
      }
    }

    result[catName] = { global: globalVariables, semantic: semanticVariables };
    console.log(`${catName} variables from Figma:`, result[catName]);
  }

  // If single category requested, return just that category's data
  if (categoryName && result[categoryName]) {
    return result[categoryName];
  }
  
  return result;
}

// Legacy function for backward compatibility
export async function createRadiusVariables() {
  console.warn("createRadiusVariables is deprecated. Use createVariables() instead.");
  const radiusCategory = getVariableCategory("radius");
  if (radiusCategory) {
    await createVariablesForCategory(radiusCategory, "radius");
  }
}

// Legacy function - now delegates to getVariablesFromFigma
export async function getVariables(categoryName?: string) {
  console.warn("getVariables is deprecated. Use getVariablesFromFigma() for new code.");
  return await getVariablesFromFigma(categoryName);
}

export function removeAllVariables(node: ComponentNode | ComponentSetNode) {
  console.log(`Removing all variables from ${node.type}: ${node.name}`);
  
  if (node.type === "COMPONENT_SET") {
    // Process all children (variants) in the component set
    for (const child of node.children) {
      if (child.type === "COMPONENT") {
        removeVariablesFromComponent(child);
      }
    }
  } else if (node.type === "COMPONENT") {
    removeVariablesFromComponent(node);
  }
  
  console.log(`Variable removal complete for: ${node.name}`);
}

function removeVariablesFromComponent(component: ComponentNode) {
  console.log(`Processing component: ${component.name}`);
  
  // Remove variables from the component itself
  removeVariablesFromNode(component);
  
  // Recursively process all children
  processNodeChildren(component);
}

function processNodeChildren(node: SceneNode) {
  if ('children' in node && node.children) {
    for (const child of node.children) {
      removeVariablesFromNode(child);
      processNodeChildren(child);
    }
  }
}

function removeVariablesFromNode(node: SceneNode) {
  try {
    // Handle fills (background colors, etc.)
    if ('fills' in node && node.fills && Array.isArray(node.fills)) {
      const updatedFills = node.fills.map(fill => {
        if (fill.type === 'SOLID' && fill.boundVariables?.color) {
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
    if ('strokes' in node && node.strokes && Array.isArray(node.strokes)) {
      const updatedStrokes = node.strokes.map(stroke => {
        if (stroke.type === 'SOLID' && stroke.boundVariables?.color) {
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
    if (('cornerRadius' in node || 'topLeftRadius' in node) && 'cornerRadius' in boundVars) {
      delete (boundVars as any).cornerRadius;
      hasChanges = true;
    }

    // Handle individual corner radii
    const cornerProperties = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'] as const;
    cornerProperties.forEach(prop => {
      if (prop in node && boundVars[prop]) {
        delete boundVars[prop];
        hasChanges = true;
      }
    });

    // Handle stroke weight
    if ('strokeWeight' in node && boundVars.strokeWeight) {
      delete boundVars.strokeWeight;
      hasChanges = true;
    }

    // Handle opacity
    if (boundVars.opacity) {
      delete boundVars.opacity;
      hasChanges = true;
    }

    // Handle spacing properties for auto layout
    if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      const spacingProps = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing'] as const;
      spacingProps.forEach(prop => {
        if (boundVars[prop]) {
          delete boundVars[prop];
          hasChanges = true;
        }
      });
    }

    // Handle text properties
    if (node.type === 'TEXT') {
      const textProps = ['fontSize', 'lineHeight', 'letterSpacing', 'paragraphSpacing'] as const;
      textProps.forEach(prop => {
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
