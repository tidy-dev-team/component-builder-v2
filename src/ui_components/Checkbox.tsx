import { h, JSX } from "preact";
import { Checkbox } from "@create-figma-plugin/ui";
import { useAtom } from "jotai";
import { propertyUsedStatesAtom } from "../state/atoms";
import { getCleanName, findChildProperties } from "../ui_utils";
import { ComponentPropertyInfo } from "../types";

export function CheckboxComponent(
  prop: ComponentPropertyInfo & { 
    disabled: boolean;
    allProperties?: ComponentPropertyInfo[];
  }
) {
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
    <Checkbox
      onValueChange={handleChange}
      value={usedStates[prop.name] ?? true}
      disabled={prop.disabled}
    >
      {cleanName}
    </Checkbox>
  );
}
