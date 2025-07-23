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
      console.warn(`Category ${categoryName} not found`);
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
        console.error(`Could not set value for ${globalVar.name}:`, error);
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
            console.error(
              `Could not set alias for ${semanticVar.name}:`,
              error
            );
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
  console.warn(
    "createRadiusVariables is deprecated. Use createVariables() instead."
  );
  const radiusCategory = getVariableCategory("radius");
  if (radiusCategory) {
    await createVariablesForCategory(radiusCategory, "radius");
  }
}

// Legacy function - now delegates to getVariablesFromFigma
export async function getVariables(categoryName?: string) {
  console.warn(
    "getVariables is deprecated. Use getVariablesFromFigma() for new code."
  );
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
  if ("children" in node && node.children) {
    for (const child of node.children) {
      removeVariablesFromNode(child);
      processNodeChildren(child);
    }
  }
}
