import { h, JSX } from "preact";
import { Checkbox } from "@create-figma-plugin/ui";
import { useAtom } from "jotai";
import { propertyUsedStatesAtom } from "../state/atoms";
import { getCleanName } from "../ui_utils";
import { ComponentPropertyInfo } from "../types";

export function CheckboxComponent(
  prop: ComponentPropertyInfo & { disabled: boolean }
) {
  const [usedStates, setUsedStates] = useAtom(propertyUsedStatesAtom);
  const cleanName = getCleanName(prop);

  const handleChange = (value: boolean) => {
    setUsedStates((prev) => ({ ...prev, [prop.name]: value }));
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
