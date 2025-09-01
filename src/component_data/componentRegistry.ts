import { ComponentData } from "../types";
import { componentGroups } from "./componentGroups";

// Helper function to create separator entries
const createSeparator = () => ({ key: "", type: "separator" as const });

// Build the registry with automatic separators
export const componentRegistry: ComponentData = componentGroups.reduce(
  (registry, group, groupIndex) => {
    // Add separator before each group (except the first one)
    if (groupIndex > 0) {
      registry[`---separator-${groupIndex}---`] = createSeparator();
    }

    // Add all components in the group
    group.forEach(([name, key, type]) => {
      registry[name] = {
        key,
        ...(type && { type: type as "component" }),
      };
    });

    return registry;
  },
  {} as ComponentData
);
