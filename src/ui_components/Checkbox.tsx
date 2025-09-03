import { h, JSX } from "preact";
import { Checkbox } from "@create-figma-plugin/ui";
import { useAtom } from "jotai";
import { propertyUsedStatesAtom } from "../state/atoms";
import { getCleanName, findChildProperties } from "../ui_utils";
import { CheckboxComponentProps } from "../types";

export function CheckboxComponent(prop: CheckboxComponentProps) {
  const [usedStates, setUsedStates] = useAtom(propertyUsedStatesAtom);
  const cleanName = getCleanName(prop);

  // Additional safeguard: ensure the property exists in usedStates
  if (!(prop.name in usedStates)) {
    console.error(`🚨 CRITICAL: Property ${prop.name} not found in usedStates!`);
    console.error(`🚨 Available properties in usedStates:`, Object.keys(usedStates));
    console.error(`🚨 Property details:`, prop);
    console.error(`🚨 usedStates[${prop.name}]:`, usedStates[prop.name]);
    // Show alert to make it impossible to miss
    alert(`🚨 CRITICAL ERROR: Property "${prop.name}" not found in state!\n\nAvailable properties: ${Object.keys(usedStates).join(', ')}\n\nCheck console for full details.`);
    // This should not happen with our fixes, but just in case
    setUsedStates((prev) => ({ ...prev, [prop.name]: true }));
  }

  const handleChange = (value: boolean) => {
    console.log(`🔄 Checkbox change for ${prop.name}: ${usedStates[prop.name]} -> ${value}`);
    setUsedStates((prev) => {
      const newStates = { ...prev, [prop.name]: value };

      // Handle variant property parent-child relationships
      if (prop.type === "VARIANT" && !prop.name.includes("#")) {
        // This is a main variant property (e.g., "size")
        // Find all variant options for this property
        const variantOptions = Object.keys(prev).filter((key) =>
          key.startsWith(`${prop.name}#`)
        );

        if (!value) {
          // If unchecking main variant, uncheck all its options
          variantOptions.forEach((option) => {
            newStates[option] = false;
          });
        } else {
          // If checking main variant, re-enable all its options
          variantOptions.forEach((option) => {
            newStates[option] = true;
          });
        }
      }

      // Handle regular property parent-child relationships
      if (prop.allProperties && prop.type !== "VARIANT") {
        const childProperties = findChildProperties(prop, prop.allProperties);

        if (!value) {
          // If unchecking, uncheck all child properties
          childProperties.forEach((child) => {
            newStates[child.name] = false;
          });
        } else {
          // If checking, re-enable all child properties
          childProperties.forEach((child) => {
            newStates[child.name] = true;
          });
        }
      }

      return newStates;
    });
  };

  // Ensure the value is always a boolean
  const checkboxValue = typeof usedStates[prop.name] === 'boolean' ? usedStates[prop.name] : true;

  console.log(`🔲 Rendering Checkbox for ${prop.name}: value=${checkboxValue}, disabled=${prop.disabled}, inState=${prop.name in usedStates}`);

  try {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Checkbox
          onValueChange={handleChange}
          value={checkboxValue}
          disabled={prop.disabled}
        >
          <span style={{ display: "none" }}></span>
        </Checkbox>
        <span
          style={{
            fontSize: "12px",
            color: prop.disabled ? "#9ca3af" : "#374151",
            fontWeight: "400",
            lineHeight: "1.4",
          }}
        >
          {cleanName}
        </span>
      </div>
    );
  } catch (error) {
    console.error(`💥 ERROR rendering Checkbox for ${prop.name}:`, error);
    console.error(`💥 Property details:`, prop);
    console.error(`💥 State details:`, { checkboxValue, usedStatesValue: usedStates[prop.name], allStates: usedStates });
    const errorMessage = error instanceof Error ? error.message : String(error);
    alert(`💥 CRITICAL ERROR rendering checkbox for "${prop.name}": ${errorMessage}\n\nCheck console for full details.`);
    throw error; // Re-throw to preserve original error
  }
}
