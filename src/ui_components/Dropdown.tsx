import { h, JSX } from "preact";
import { useAtom } from "jotai";
import { Dropdown, DropdownOption } from "@create-figma-plugin/ui";
import { selectedComponentAtom } from "../state/atoms";
import { ComponentData } from "../types";

interface DropdownComponentProps {
  components: ComponentData;
}

export function DropdownComponent({ components }: DropdownComponentProps) {
  const componentNames = Object.keys(components);
  const dropdownOptions = componentNames.map(
    (name): DropdownOption => ({ value: name })
  );
  const [value, setValue] = useAtom(selectedComponentAtom);

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value;
    setValue(newValue);
  }

  return (
    <Dropdown
      onChange={handleChange}
      options={dropdownOptions}
      value={value}
      placeholder="Select component..."
    />
  );
}
