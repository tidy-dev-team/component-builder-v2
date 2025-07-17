import { emit, on } from "@create-figma-plugin/utilities";
import { errorService, ErrorCode } from "../errors";
import { cachedComponentSet } from "../main";

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
  componentSet: ComponentSetNode;
  wasRefreshed: boolean;
}

export async function validateAndRefreshComponent(): Promise<ComponentValidationResult> {
  // Check if cached component set is still valid
  if (!cachedComponentSet || !isNodeValid(cachedComponentSet)) {
    const staleError = errorService.createComponentSetError(
      ErrorCode.COMPONENT_SET_STALE,
      "Cached component set is no longer valid",
      { operation: 'VALIDATE_COMPONENT' }
    );
    
    // Try to refresh the component set
    emit("REFRESH_COMPONENT_SET");
    
    // Wait for refresh response
    const refreshResult = await new Promise<boolean>((resolve) => {
      const unsubscribe = on("COMPONENT_SET_REFRESHED", (success: boolean) => {
        unsubscribe();
        resolve(success);
      });
    });
    
    if (!refreshResult || !cachedComponentSet) {
      throw errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_REFRESH_FAILED,
        "Failed to refresh component set",
        { operation: 'VALIDATE_COMPONENT' }
      );
    }
    
    figma.notify("Component set refreshed successfully!");
    return {
      componentSet: cachedComponentSet,
      wasRefreshed: true,
    };
  }

  return {
    componentSet: cachedComponentSet,
    wasRefreshed: false,
  };
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