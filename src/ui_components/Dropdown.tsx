import { h, JSX } from "preact";
import { useAtom } from "jotai";
import { Dropdown, DropdownOption } from "@create-figma-plugin/ui";
import { selectedComponentAtom } from "../state/atoms";
import { DropdownComponentProps } from "../types";
import { InputValidator, InputSanitizer } from "../validation";

const dropdownStyles = {
  wrapper: {
    position: "relative" as const,
  },
  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
    display: "block",
  },
  container: {
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  focused: {
    borderColor: "#4F46E5",
    boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
  },
};

export function DropdownComponent({ components }: DropdownComponentProps) {
  const componentNames = Object.keys(components);

  // Create dropdown options with separators based on componentRegistry entries
  const dropdownOptions = componentNames.reduce(
    (acc: DropdownOption[], name) => {
      const component = components[name];

      // Check if this is a separator entry
      if (component.type === "separator") {
        // Add a visual separator (empty header creates a line)
        acc.push({ header: "―――――" }); // or you can use an empty header: { header: "" }
        return acc;
      }

      // Add regular component option
      acc.push({ value: name });
      return acc;
    },
    []
  );

  const [value, setValue] = useAtom(selectedComponentAtom);

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const rawValue = event.currentTarget.value;

    // Sanitize the input value
    const sanitizedValue = InputSanitizer.sanitizeUserInput(rawValue);

    // Validate the selection
    const validationResult = InputValidator.validateDropdownSelection(
      sanitizedValue,
      componentNames
    );

    if (validationResult.valid) {
      setValue(sanitizedValue);
    } else {
      // Log validation errors for debugging
      console.warn("Dropdown validation failed:", validationResult.errors);
      // Reset to empty to force user to make a valid selection
      setValue("");
    }
  }

  return (
    <div style={dropdownStyles.wrapper}>
      <label style={dropdownStyles.label}>Component</label>
      <div style={dropdownStyles.container}>
        <Dropdown
          onChange={handleChange}
          options={dropdownOptions}
          value={value}
          placeholder="Choose a component..."
          style={{
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            height: "36px",
          }}
        />
      </div>
    </div>
  );
}
