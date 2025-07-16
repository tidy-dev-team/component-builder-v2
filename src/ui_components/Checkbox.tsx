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
    if (prop.allProperties && prop.type !== "VARIANT") {
      // Only apply parent-child logic to non-variant properties
      const childProperties = findChildProperties(prop, prop.allProperties);
      
      setUsedStates((prev) => {
        const newStates = { ...prev, [prop.name]: value };
        
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
        
        return newStates;
      });
    } else {
      // Normal behavior for variants and properties without children
      setUsedStates((prev) => ({ ...prev, [prop.name]: value }));
    }
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
