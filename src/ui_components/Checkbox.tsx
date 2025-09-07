import { h } from "preact";
import { Checkbox } from "@create-figma-plugin/ui";
import { useAtom } from "jotai";
import { propertyUsedStatesAtom } from "../state/atoms";
import { getCleanName, findChildProperties } from "../ui_utils";
import { CheckboxComponentProps } from "../types";
import { sharedStyles } from "../ui_styles";

export function CheckboxComponent(prop: CheckboxComponentProps) {
  const [usedStates, setUsedStates] = useAtom(propertyUsedStatesAtom);
  const cleanName = getCleanName(prop);

  // Skip if property not in state (shouldn't happen with proper initialization)
  if (!(prop.name in usedStates)) return null;

  const handleChange = (value: boolean) => {
    setUsedStates((prev) => {
      const newStates = { ...prev, [prop.name]: value };

      // Handle variant property parent-child relationships
      if (prop.type === "VARIANT" && !prop.name.includes("#")) {
        const variantOptions = Object.keys(prev).filter((key) =>
          key.startsWith(`${prop.name}#`)
        );
        variantOptions.forEach((option) => {
          newStates[option] = value;
        });
      }

      // Handle regular property parent-child relationships
      if (prop.allProperties && prop.type !== "VARIANT") {
        const childProperties = findChildProperties(prop, prop.allProperties);
        childProperties.forEach((child) => {
          newStates[child.name] = value;
        });
      }

      return newStates;
    });
  };

  const checkboxValue = typeof usedStates[prop.name] === 'boolean' ? usedStates[prop.name] : true;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: sharedStyles.spacing.small }}>
      <Checkbox
        onValueChange={handleChange}
        value={checkboxValue}
        disabled={prop.disabled}
      >
        <span style={{ display: "none" }}></span>
      </Checkbox>
      <span
        style={{
          fontSize: sharedStyles.text.secondary.fontSize,
          color: prop.disabled ? sharedStyles.text.disabled.color : "#374151",
          fontWeight: "400",
          lineHeight: "1.4",
        }}
      >
        {cleanName}
      </span>
    </div>
  );
}
