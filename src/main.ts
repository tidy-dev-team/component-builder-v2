import { on, emit, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo, getComponentPropertyInfoFromComponent } from "./figma_functions/coreUtils";
import type {
  ComponentPropertyInfo,
  ComponentSetEventData,
  BuildEventData,
} from "./types";
import { UI_DIMENSIONS } from "./constants";
import { buildUpdatedComponent } from "./buildComponent";
import { errorService, ErrorCode, errorRecovery } from "./errors";
import { InputValidator, formatValidationErrors } from "./validation";
import { findExposedInstances } from "./figma_functions/utils";
import { createVariables } from "./figma_functions/varUtils";

export let cachedComponentSet: ComponentSetNode | null = null;
export let cachedComponent: ComponentNode | null = null;
let cachedComponentProps: ComponentPropertyInfo[] | null = null;
let lastComponentKey: string | null = null;
let nestedInstances: { name: string; id: string; key: string }[] | null = null;

export default async function () {
  on(
    "GET_COMPONENT_SET_PROPERTIES",
    async (componentSetData: ComponentSetEventData) => {
      console.log("🚀 GET_COMPONENT_SET_PROPERTIES triggered with:", componentSetData);
      
      try {
        // Validate input data
        const validationResult =
          InputValidator.validateComponentSetEventData(componentSetData);
        if (!validationResult.valid) {
          console.error("❌ Validation failed:", validationResult.errors);
          const errorMessage = formatValidationErrors(validationResult.errors);
          throw errorService.createValidationError(
            ErrorCode.INVALID_INPUT,
            errorMessage,
            { componentSetData, validationErrors: validationResult.errors }
          );
        }

        console.log("✅ Input validation passed, calling getComponentSet...");
        await errorService.handleAsyncError(
          () => getComponentSet(componentSetData.key),
          {
            operation: "GET_COMPONENT_SET_PROPERTIES",
            componentKey: componentSetData.key,
          }
        );
        
        lastComponentKey = componentSetData.key;
        console.log(`📤 Emitting properties to UI: ${cachedComponentProps?.length || 0} properties, ${nestedInstances?.length || 0} nested instances`);
        console.log("📋 Properties data:", cachedComponentProps);
        console.log("🔗 Nested instances:", nestedInstances);
        
        emit("COMPONENT_SET_PROPERTIES", {
          cachedComponentProps,
          nestedInstances,
        });
        
        console.log("✅ Successfully emitted COMPONENT_SET_PROPERTIES");
      } catch (error) {
        console.error("❌ Error in GET_COMPONENT_SET_PROPERTIES:", error);
        const propGateError = errorService.handleError(error, {
          operation: "GET_COMPONENT_SET_PROPERTIES",
          componentKey: componentSetData.key,
        });

         // Attempt recovery
         console.log("🔄 Attempting recovery...");
         const recovered = await errorRecovery.attemptRecovery(propGateError);
         if (!recovered) {
           console.log("❌ Recovery failed, emitting empty data");
           emit("COMPONENT_SET_PROPERTIES", { cachedComponentProps: [], nestedInstances: [] });
         }
      }
    }
  );

  on("REFRESH_COMPONENT_SET", async () => {
    try {
      if (!lastComponentKey) {
        const error = errorService.createComponentSetError(
          ErrorCode.COMPONENT_SET_NOT_FOUND,
          "No component key available for refresh",
          { operation: "REFRESH_COMPONENT_SET" }
        );
        throw error;
      }

      await errorService.handleAsyncError(
        () => getComponentSet(lastComponentKey!),
        {
          operation: "REFRESH_COMPONENT_SET",
          componentKey: lastComponentKey,
        }
      );
      emit("COMPONENT_SET_REFRESHED", true);
    } catch (error) {
      errorService.handleError(error, {
        operation: "REFRESH_COMPONENT_SET",
        componentKey: lastComponentKey,
      });
      emit("COMPONENT_SET_REFRESHED", false);
    }
  });

  on("BUILD", async (buildData: BuildEventData) => {
    console.log("buildData :>> ", buildData);
    try {
      // Validate build data
      const validationResult = InputValidator.validateBuildEventData(buildData);
      if (!validationResult.valid) {
        const errorMessage = formatValidationErrors(validationResult.errors);
        throw errorService.createValidationError(
          ErrorCode.INVALID_INPUT,
          errorMessage,
          { buildData, validationErrors: validationResult.errors }
        );
      }

      await errorService.handleAsyncError(
        () => buildUpdatedComponent(buildData),
        {
          operation: "BUILD",
          propertiesCount: Object.keys(buildData).length,
        }
      );
    } catch (error) {
      errorService.handleError(error, {
        operation: "BUILD",
        propertiesCount: Object.keys(buildData).length,
      });
    }
  });

  on("CLOSE", () => {
    figma.closePlugin();
  });

  // Initialize design system variables on plugin startup
  try {
    await createVariables();
  } catch (error) {
    console.error("Failed to initialize design system variables:", error);
    // Don't block plugin startup if variable creation fails
  }

  showUI({
    height: UI_DIMENSIONS.HEIGHT,
    width: UI_DIMENSIONS.WIDTH,
  });
}

async function getComponentSet(key: string): Promise<void> {
  console.log("🔍 getComponentSet called with key:", key);
  
  // Validate and sanitize the component key
  const keyValidationResult = InputValidator.validateComponentKey(key);
  if (!keyValidationResult.valid) {
    console.error("❌ Component key validation failed:", keyValidationResult.errors);
    const errorMessage = formatValidationErrors(keyValidationResult.errors);
    throw errorService.createValidationError(
      ErrorCode.INVALID_INPUT,
      errorMessage,
      { componentKey: key, validationErrors: keyValidationResult.errors }
    );
  }

  if (!key) {
    console.error("❌ Component key is empty");
    throw errorService.createComponentSetError(
      ErrorCode.COMPONENT_SET_NOT_FOUND,
      "Component key is required",
      { componentKey: key }
    );
  }

  try {
    console.log("🔄 Resetting cached values...");
    // Reset both cached values
    cachedComponentSet = null;
    cachedComponent = null;

    // Try importing as component set first
    try {
      console.log("📥 Attempting to import as component set...");
      cachedComponentSet = await figma.importComponentSetByKeyAsync(key);
      console.log("📦 Component set import result:", cachedComponentSet?.name, cachedComponentSet?.type);
      
      if (cachedComponentSet && cachedComponentSet.type === "COMPONENT_SET") {
        console.log("✅ Component set imported successfully:", cachedComponentSet.name);
        
        // Validate component set properties
        if (!cachedComponentSet.componentPropertyDefinitions) {
          console.error("❌ Component set has no property definitions");
          throw errorService.createComponentSetError(
            ErrorCode.COMPONENT_SET_INVALID,
            `Component set "${cachedComponentSet.name}" does not have component property definitions`,
            { componentKey: key, componentName: cachedComponentSet.name }
          );
        }

        if (!cachedComponentSet.defaultVariant) {
          console.error("❌ Component set has no default variant");
          throw errorService.createComponentSetError(
            ErrorCode.COMPONENT_SET_INVALID,
            `Component set "${cachedComponentSet.name}" does not have a default variant`,
            { componentKey: key, componentName: cachedComponentSet.name }
          );
        }

        console.log("🔧 Getting component property info...");
        cachedComponentProps = getComponentPropertyInfo(cachedComponentSet);
        console.log("🔍 Finding nested instances...");
        nestedInstances = findExposedInstances(cachedComponentSet.defaultVariant);
        console.log(`✅ Component set processed: ${cachedComponentSet.name}, properties: ${cachedComponentProps.length}, instances: ${nestedInstances.length}`);
        return;
      }
    } catch (error) {
      // If component set import fails, try importing as regular component
      console.log("⚠️  Component set import failed, trying regular component...", error);
    }

    // Try importing as regular component
    console.log("📥 Attempting to import as regular component...");
    cachedComponent = await figma.importComponentByKeyAsync(key);
    console.log("📦 Component import result:", cachedComponent?.name, cachedComponent?.type);

    if (!cachedComponent) {
      console.error("❌ Component not found");
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_NOT_FOUND,
        `Component or component set not found for key: ${key}`,
        { componentKey: key }
      );
    }

    // Validate that this is actually a component
    if (cachedComponent.type !== "COMPONENT") {
      console.error("❌ Invalid component type:", cachedComponent.type);
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_INVALID,
        `The selected element is not a component or component set. Found type: ${cachedComponent.type}`,
        { componentKey: key, componentType: cachedComponent.type }
      );
    }

    // For regular components, we get properties differently
    console.log("🔧 Getting properties from regular component...");
    cachedComponentProps = getComponentPropertyInfoFromComponent(cachedComponent);
    console.log("🔍 Finding nested instances in regular component...");
    nestedInstances = findExposedInstances(cachedComponent);
    console.log(`✅ Regular component processed: ${cachedComponent.name}, properties: ${cachedComponentProps.length}, instances: ${nestedInstances.length}`);
    
  } catch (error) {
    console.error("❌ Error in getComponentSet:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_NOT_FOUND,
        `Component or component set not found for key: ${key}`,
        { componentKey: key }
      );
    }
    throw error;
  }
}
