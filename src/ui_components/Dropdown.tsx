import { h, JSX } from "preact";
import { useAtom } from "jotai";
import { Dropdown, DropdownOption } from "@create-figma-plugin/ui";
import { selectedComponentAtom } from "../state/atoms";
import { DropdownComponentProps } from "../types";
import { InputValidator, InputSanitizer } from "../validation";

export function DropdownComponent({ components }: DropdownComponentProps) {
  const componentNames = Object.keys(components);
  const dropdownOptions = componentNames.map(
    (name): DropdownOption => ({ value: name })
  );
  const [value, setValue] = useAtom(selectedComponentAtom);

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const rawValue = event.currentTarget.value;
    
    // Sanitize the input value
    const sanitizedValue = InputSanitizer.sanitizeUserInput(rawValue);
    
    // Validate the selection
    const validationResult = InputValidator.validateDropdownSelection(sanitizedValue, componentNames);
    
    if (validationResult.valid) {
      setValue(sanitizedValue);
    } else {
      // Log validation errors for debugging
      console.warn('Dropdown validation failed:', validationResult.errors);
      // Reset to empty to force user to make a valid selection
      setValue("");
    }
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
