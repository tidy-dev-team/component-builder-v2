import { emit, on } from "@create-figma-plugin/utilities";
import { errorService, ErrorCode } from "../errors";
import { cachedComponentSet, cachedComponent } from "../main";

// Import the last selected component key from main module
let lastSelectedComponentKey: string | null = null;

// Update the lastSelectedComponentKey when main module changes
export function updateLastSelectedComponentKey(key: string | null) {
  lastSelectedComponentKey = key;
}

function isNodeValid(node: SceneNode): boolean {
  try {
    // Try to access a property that would fail if the node is invalid
    const _ = node.id;
    const __ = node.type;
    return true;
  } catch (error) {
    return false;
  }
}

export interface ComponentValidationResult {
  componentSet?: ComponentSetNode;
  component?: ComponentNode;
  wasRefreshed: boolean;
}

export async function validateAndRefreshComponent(): Promise<ComponentValidationResult> {
  // Check if we have a component set
  if (cachedComponentSet && isNodeValid(cachedComponentSet)) {
    return {
      componentSet: cachedComponentSet,
      wasRefreshed: false,
    };
  }

  // Check if we have a regular component
  if (cachedComponent && isNodeValid(cachedComponent)) {
    return {
      component: cachedComponent,
      wasRefreshed: false,
    };
  }

  // Neither is valid, try to refresh
  const staleError = errorService.createComponentSetError(
    ErrorCode.COMPONENT_SET_STALE,
    "Cached component is no longer valid",
    { operation: 'VALIDATE_COMPONENT' }
  );
  
  // Try to refresh the component
  emit("REFRESH_COMPONENT_SET");
  
  // Wait for refresh response
  const refreshResult = await new Promise<boolean>((resolve) => {
    const unsubscribe = on("COMPONENT_SET_REFRESHED", (success: boolean) => {
      unsubscribe();
      resolve(success);
    });
  });
  
  if (!refreshResult) {
    throw errorService.createComponentSetError(
      ErrorCode.COMPONENT_SET_REFRESH_FAILED,
      "Failed to refresh component",
      { operation: 'VALIDATE_COMPONENT' }
    );
  }
  
  // Check which one was refreshed successfully
  if (cachedComponentSet && isNodeValid(cachedComponentSet)) {
    figma.notify("Component set refreshed successfully!");
    return {
      componentSet: cachedComponentSet,
      wasRefreshed: true,
    };
  }
  
  if (cachedComponent && isNodeValid(cachedComponent)) {
    figma.notify("Component refreshed successfully!");
    return {
      component: cachedComponent,
      wasRefreshed: true,
    };
  }

  throw errorService.createComponentSetError(
    ErrorCode.COMPONENT_SET_REFRESH_FAILED,
    "Failed to refresh component",
    { operation: 'VALIDATE_COMPONENT' }
  );
}

export function cloneComponentSet(componentSet: ComponentSetNode): ComponentSetNode {
  try {
    const cloned = componentSet.clone();
    
    if (!cloned) {
      throw errorService.createBuildError(
        "Component set clone returned null",
        { operation: 'CLONE_COMPONENT' }
      );
    }
    
    return cloned;
  } catch (error) {
    throw errorService.createBuildError(
      "Failed to clone component set",
      { operation: 'CLONE_COMPONENT' },
      error instanceof Error ? error : undefined
    );
  }
}

export function cloneComponent(component: ComponentNode): ComponentNode {
  try {
    const cloned = component.clone();
    
    if (!cloned) {
      throw errorService.createBuildError(
        "Component clone returned null",
        { operation: 'CLONE_COMPONENT' }
      );
    }
    
    return cloned;
  } catch (error) {
    throw errorService.createBuildError(
      "Failed to clone component",
      { operation: 'CLONE_COMPONENT' },
      error instanceof Error ? error : undefined
    );
  }
}