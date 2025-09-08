import {
  variablesData,
  getVariableCategoryNames,
  getVariableCategory,
  type Variable as VariableData,
  type VariableCategory,
} from "../variables_data/variables";
import { removeVariablesFromNode } from "./removeVariablesFromNode";

export async function createVariables() {
  console.log("Creating design system variables...");
  const categoryNames = getVariableCategoryNames();

  for (const categoryName of categoryNames) {
    const category = getVariableCategory(categoryName);
    if (!category) {
      console.log(`Category ${categoryName} not found`);
      continue;
    }

    console.log(`Processing ${categoryName} variables...`);
    await createVariablesForCategory(category, categoryName);
  }

  console.log("Design system variables creation complete");
}

async function createVariablesForCategory(
  category: VariableCategory,
  categoryName: string
) {
  const { collectionName, prefix, global, semantic } = category;

  // Check if collection already exists
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find((c) => c.name === collectionName);

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
        console.log(`Could not set value for ${globalVar.name}:`, error);
      }
    } else {
      // Add existing variable to map for semantic variable references
      const existingVar = await getExistingVariableByName(
        collection,
        globalVar.name
      );
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
      const referencedGlobal = global.find(
        (g: VariableData) => g.id === referencedId
      );

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
            console.log(
              `Could not set alias for ${semanticVar.name}:`,
              error
            );
          }
        } else {
          console.log(
            `Referenced variable not found: ${referencedGlobal.name}`
          );
        }
      } else {
        console.log(
          `Referenced global variable not found for ${semanticVar.name}`
        );
      }
    } else {
      console.log(`Semantic variable already exists: ${semanticVar.name}`);
    }
  }
}

async function getExistingVariableByName(
  collection: VariableCollection,
  name: string
): Promise<Variable | null> {
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
  console.log(
    "Available collections:",
    collections.map((c) => c.name)
  );

  const result: Record<
    string,
    { global: VariableData[]; semantic: VariableData[] }
  > = {};

  // If specific category requested, only get that one
  const categoriesToProcess = categoryName
    ? [categoryName]
    : getVariableCategoryNames();

  for (const catName of categoriesToProcess) {
    const category = getVariableCategory(catName);
    if (!category) {
      console.log(`Category ${catName} not found`);
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
              value: value as
                | number
                | string
                | { type: "VARIABLE_ALIAS"; id: string },
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
  console.log(
    "createRadiusVariables is deprecated. Use createVariables() instead."
  );
  const radiusCategory = getVariableCategory("radius");
  if (radiusCategory) {
    await createVariablesForCategory(radiusCategory, "radius");
  }
}

// Legacy function - now delegates to getVariablesFromFigma
export async function getVariables(categoryName?: string) {
  console.log(
    "getVariables is deprecated. Use getVariablesFromFigma() for new code."
  );
  return await getVariablesFromFigma(categoryName);
}

export function removeAllVariables(node: ComponentNode | ComponentSetNode) {
  console.log(
    `[DEBUG] removeAllVariables called for ${node.type}: ${node.name}`
  );
  console.log(`[DEBUG] Node children count:`, node.children?.length || 0);

  if (node.type === "COMPONENT_SET") {
    // Process all children (variants) in the component set
    console.log(
      `[DEBUG] Processing component set with ${node.children.length} children`
    );
    for (const child of node.children) {
      if (child.type === "COMPONENT") {
        console.log(`[DEBUG] Processing component variant: ${child.name}`);
        removeVariablesFromComponent(child);
      }
    }
  } else if (node.type === "COMPONENT") {
    console.log(`[DEBUG] Processing single component: ${node.name}`);
    removeVariablesFromComponent(node);
  }

  console.log(`[DEBUG] Variable removal complete for: ${node.name}`);
}

function removeVariablesFromComponent(component: ComponentNode) {
  console.log(`Processing component: ${component.name}`);

  // Remove variables from the component itself
  removeVariablesFromNode(component);

  // Recursively process all children
  processNodeChildren(component);
}

function processNodeChildren(node: SceneNode) {
  if ("children" in node && node.children) {
    for (const child of node.children) {
      removeVariablesFromNode(child);
      processNodeChildren(child);
    }
  }
}

export async function applySemanticBorderRadiusVariables(node: ComponentNode | ComponentSetNode) {
  console.log(`Applying semantic border radius variables to: ${node.name}`);
  
  // Get the radius variables from Figma
  const radiusVariables = await getVariablesFromFigma("radius");
  if (!radiusVariables) {
    console.log("No radius variables found");
    return;
  }

  // Since we're calling with "radius" category, it returns { global: Variable[], semantic: Variable[] }
  const variableData = radiusVariables as { global: VariableData[]; semantic: VariableData[] };
  
  if (!variableData.semantic || variableData.semantic.length === 0) {
    console.log("No semantic radius variables found");
    return;
  }

  if (!variableData.global || variableData.global.length === 0) {
    console.log("No global radius variables found");
    return;
  }

  // Create mapping of radius values to semantic variables
  const valueToSemanticVariable = new Map<number, VariableData>();
  
  for (const semanticVar of variableData.semantic) {
    // Get the global variable this semantic variable references
    const referencedId = semanticVar.values[0].referencedVariableId;
    if (referencedId) {
      const globalVar = variableData.global.find((g: VariableData) => g.id === referencedId);
      if (globalVar && typeof globalVar.values[0].value === 'number') {
        valueToSemanticVariable.set(globalVar.values[0].value as number, semanticVar);
      }
    }
  }

  if (node.type === "COMPONENT_SET") {
    for (const child of node.children) {
      if (child.type === "COMPONENT") {
        await applySemanticVariablesToComponent(child, valueToSemanticVariable);
      }
    }
  } else if (node.type === "COMPONENT") {
    await applySemanticVariablesToComponent(node, valueToSemanticVariable);
  }

  console.log(`Semantic border radius variables applied to: ${node.name}`);
}

async function applySemanticVariablesToComponent(
  component: ComponentNode, 
  valueToSemanticVariable: Map<number, VariableData>
) {
  console.log(`Processing component: ${component.name}`);

  // Apply to component itself
  await applySemanticVariablesToNode(component, valueToSemanticVariable);

  // Recursively process all children
  await processNodeChildrenForVariables(component, valueToSemanticVariable);
}

async function processNodeChildrenForVariables(
  node: SceneNode, 
  valueToSemanticVariable: Map<number, VariableData>
) {
  if ("children" in node && node.children) {
    for (const child of node.children) {
      await applySemanticVariablesToNode(child, valueToSemanticVariable);
      await processNodeChildrenForVariables(child, valueToSemanticVariable);
    }
  }
}

async function applySemanticVariablesToNode(
  node: SceneNode, 
  valueToSemanticVariable: Map<number, VariableData>
) {
  // Check if node has border radius properties
  if ("cornerRadius" in node) {
    const cornerRadius = node.cornerRadius;
    
    if (typeof cornerRadius === "number") {
      // Single corner radius value
      const semanticVar = valueToSemanticVariable.get(cornerRadius);
      if (semanticVar) {
        try {
          const figmaVariable = await figma.variables.getVariableByIdAsync(semanticVar.id);
          if (figmaVariable) {
            (node as any).setBoundVariable("cornerRadius", figmaVariable);
            console.log(`Applied ${semanticVar.name} to ${node.name} (radius: ${cornerRadius})`);
          }
        } catch (error) {
          console.log(`Failed to apply variable ${semanticVar.name} to ${node.name}:`, error);
        }
      }
    } else if (typeof cornerRadius === "object" && cornerRadius !== figma.mixed) {
      // Individual corner radii
      const corners = ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const;
      
      for (const corner of corners) {
        if (corner in node) {
          const radiusValue = (node as any)[corner];
          if (typeof radiusValue === "number") {
            const semanticVar = valueToSemanticVariable.get(radiusValue);
            if (semanticVar) {
              try {
                const figmaVariable = await figma.variables.getVariableByIdAsync(semanticVar.id);
                if (figmaVariable) {
                  (node as any).setBoundVariable(corner, figmaVariable);
                  console.log(`Applied ${semanticVar.name} to ${node.name} ${corner} (radius: ${radiusValue})`);
                }
              } catch (error) {
                console.log(`Failed to apply variable ${semanticVar.name} to ${node.name} ${corner}:`, error);
              }
            }
          }
        }
      }
    }
  }
}
