import { on, emit, showUI } from "@create-figma-plugin/utilities";
import { getComponentPropertyInfo } from "./figma_functions/coreUtils";
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
let cachedComponentProps: ComponentPropertyInfo[] | null = null;
let lastComponentKey: string | null = null;
let nestedInstances: { name: string; id: string; key: string }[] | null = null;

export default async function () {
  on(
    "GET_COMPONENT_SET_PROPERTIES",
    async (componentSetData: ComponentSetEventData) => {
      try {
        // Validate input data
        const validationResult =
          InputValidator.validateComponentSetEventData(componentSetData);
        if (!validationResult.valid) {
          const errorMessage = formatValidationErrors(validationResult.errors);
          throw errorService.createValidationError(
            ErrorCode.INVALID_INPUT,
            errorMessage,
            { componentSetData, validationErrors: validationResult.errors }
          );
        }

        await errorService.handleAsyncError(
          () => getComponentSet(componentSetData.key),
          {
            operation: "GET_COMPONENT_SET_PROPERTIES",
            componentKey: componentSetData.key,
          }
        );
        lastComponentKey = componentSetData.key;
        emit("COMPONENT_SET_PROPERTIES", {
          cachedComponentProps,
          nestedInstances,
        });
      } catch (error) {
        const propGateError = errorService.handleError(error, {
          operation: "GET_COMPONENT_SET_PROPERTIES",
          componentKey: componentSetData.key,
        });

         // Attempt recovery
         const recovered = await errorRecovery.attemptRecovery(propGateError);
         if (!recovered) {
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
  // Validate and sanitize the component key
  const keyValidationResult = InputValidator.validateComponentKey(key);
  if (!keyValidationResult.valid) {
    const errorMessage = formatValidationErrors(keyValidationResult.errors);
    throw errorService.createValidationError(
      ErrorCode.INVALID_INPUT,
      errorMessage,
      { componentKey: key, validationErrors: keyValidationResult.errors }
    );
  }

  if (!key) {
    throw errorService.createComponentSetError(
      ErrorCode.COMPONENT_SET_NOT_FOUND,
      "Component key is required",
      { componentKey: key }
    );
  }

  try {
    cachedComponentSet = await figma.importComponentSetByKeyAsync(key);

    if (!cachedComponentSet) {
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_NOT_FOUND,
        `Component set not found for key: ${key}`,
        { componentKey: key }
      );
    }

    // Validate that this is actually a component set
    if (cachedComponentSet.type !== "COMPONENT_SET") {
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_INVALID,
        `The selected element is not a component set. Found type: ${cachedComponentSet.type}`,
        { componentKey: key, componentType: cachedComponentSet.type }
      );
    }

    // Validate that this is actually a component set with required properties
    if (!cachedComponentSet.componentPropertyDefinitions) {
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_INVALID,
        `Component set "${cachedComponentSet.name}" does not have component property definitions`,
        { componentKey: key, componentName: cachedComponentSet.name }
      );
    }

    if (!cachedComponentSet.defaultVariant) {
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_INVALID,
        `Component set "${cachedComponentSet.name}" does not have a default variant`,
        { componentKey: key, componentName: cachedComponentSet.name }
      );
    }

    cachedComponentProps = getComponentPropertyInfo(cachedComponentSet);
    nestedInstances = findExposedInstances(cachedComponentSet.defaultVariant);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_NOT_FOUND,
        `Component set not found for key: ${key}`,
        { componentKey: key }
      );
    }
    throw error;
  }
}
