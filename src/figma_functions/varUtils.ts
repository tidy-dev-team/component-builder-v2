import { variablesData } from "../variables_data/variables";

export async function createRadiusVariables() {
  const { radius } = variablesData;
  // Check if border collection already exists
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let borderCollection = collections.find(
    (collection) => collection.name === "border"
  );

  if (!borderCollection) {
    // Create border collection
    borderCollection = figma.variables.createVariableCollection("border");
    console.log("Created border collection");
  }

  // Check existing variables
  const existingVariables = [];
  for (const id of borderCollection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (variable && variable.name.startsWith("radius")) {
      existingVariables.push(variable.name);
    }
  }

  const defaultModeId = borderCollection.defaultModeId;
  const createdVariables = new Map(); // Track created variables by name

  // First pass: Create global variables
  for (const globalVar of radius.global) {
    if (!existingVariables.includes(globalVar.name)) {
      const variable = figma.variables.createVariable(
        globalVar.name,
        borderCollection,
        globalVar.type as VariableResolvedDataType
      );

      // Set the numeric value (global variables have direct values)
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
      console.log(`Global variable already exists: ${globalVar.name}`);
    }
  }

  // Second pass: Create semantic variables with aliases to global variables
  for (const semanticVar of radius.semantic) {
    if (!existingVariables.includes(semanticVar.name)) {
      const variable = figma.variables.createVariable(
        semanticVar.name,
        borderCollection,
        semanticVar.type as VariableResolvedDataType
      );

      // Find the referenced global variable
      const referencedId = semanticVar.values[0].referencedVariableId;
      const referencedGlobal = radius.global.find((g) => g.id === referencedId);

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
            console.log(`Could not set alias for ${semanticVar.name}:`, error);
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

export async function getVariables() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  console.log("collections :>> ", collections);

  const borderCollection = collections.find(
    (collection) => collection.name === "border"
  );
  if (!borderCollection) {
    console.log("Border collection not found");
    return { global: [], semantic: [] };
  }

  const globalVariables = [];
  const semanticVariables = [];

  for (const id of borderCollection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (variable && variable.name.startsWith("radius")) {
      const variableData = {
        id: variable.id,
        name: variable.name,
        type: variable.resolvedType,
        values: Object.entries(variable.valuesByMode).map(
          ([modeId, value]) => ({
            mode: modeId,
            value: value,
            // Check if value is an alias (references another variable)
            isAlias:
              typeof value === "object" &&
              value !== null &&
              "type" in value &&
              value.type === "VARIABLE_ALIAS",
            // Store the referenced variable ID if it's an alias
            referencedVariableId:
              typeof value === "object" && value !== null && "id" in value
                ? value.id
                : null,
          })
        ),
      };

      // Classify as global or semantic based on naming convention
      if (variable.name.includes("/semantic/")) {
        semanticVariables.push(variableData);
      } else {
        globalVariables.push(variableData);
      }
    }
  }

  console.log("Global radius variables:", globalVariables);
  console.log("Semantic radius variables:", semanticVariables);

  return { global: globalVariables, semantic: semanticVariables };
}
