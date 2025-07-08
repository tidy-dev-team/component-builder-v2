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

  const handleChange = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.checked;
    setUsedStates((prev) => ({ ...prev, [prop.name]: newValue }));
  };

  return (
    <Checkbox
      onValueChange={() => handleChange}
      value={usedStates[prop.name] ?? false}
      disabled={prop.disabled}
    >
      {cleanName}
    </Checkbox>
  );
}
