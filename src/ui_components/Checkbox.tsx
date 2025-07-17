import { h, JSX } from "preact";
import { Checkbox } from "@create-figma-plugin/ui";
import { useAtom } from "jotai";
import { propertyUsedStatesAtom } from "../state/atoms";
import { getCleanName, findChildProperties } from "../ui_utils";
import { CheckboxComponentProps } from "../types";

export function CheckboxComponent(prop: CheckboxComponentProps) {
  const [usedStates, setUsedStates] = useAtom(propertyUsedStatesAtom);
  const cleanName = getCleanName(prop);

  const handleChange = (value: boolean) => {
    setUsedStates((prev) => {
      const newStates = { ...prev, [prop.name]: value };
      
      // Handle variant property parent-child relationships
      if (prop.type === "VARIANT" && !prop.name.includes("#")) {
        // This is a main variant property (e.g., "size")
        // Find all variant options for this property
        const variantOptions = Object.keys(prev).filter(key => 
          key.startsWith(`${prop.name}#`)
        );
        
        if (!value) {
          // If unchecking main variant, uncheck all its options
          variantOptions.forEach(option => {
            newStates[option] = false;
          });
        } else {
          // If checking main variant, re-enable all its options
          variantOptions.forEach(option => {
            newStates[option] = true;
          });
        }
      }
      
      // Handle regular property parent-child relationships
      if (prop.allProperties && prop.type !== "VARIANT") {
        const childProperties = findChildProperties(prop, prop.allProperties);
        
        if (!value) {
          // If unchecking, uncheck all child properties
          childProperties.forEach(child => {
            newStates[child.name] = false;
          });
        } else {
          // If checking, re-enable all child properties
          childProperties.forEach(child => {
            newStates[child.name] = true;
          });
        }
      }
      
      return newStates;
    });
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "4px 0",
      borderRadius: "4px",
      transition: "background-color 0.15s ease",
    }}>
      <Checkbox
        onValueChange={handleChange}
        value={usedStates[prop.name] ?? true}
        disabled={prop.disabled}
        style={{
          fontSize: "12px",
          color: prop.disabled ? "#9ca3af" : "#374151",
          fontWeight: "400",
        }}
      >
        <span style={{
          fontSize: "12px",
          color: prop.disabled ? "#9ca3af" : "#374151",
          fontWeight: "400",
        }}>
          {cleanName}
        </span>
      </Checkbox>
    </div>
  );
}
