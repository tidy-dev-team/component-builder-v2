import { h, JSX } from "preact";
import { useAtom } from "jotai";
import { selectedComponentAtom } from "../state/atoms";
import { ComponentData } from "../types";
import { InputValidator, InputSanitizer } from "../validation";

const listStyles = {
  container: {
    height: "100%",
    overflowY: "auto" as const,
    padding: "4px",
  },
  group: {
    marginBottom: "16px",
  },
  groupTitle: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "8px",
    padding: "0 8px",
  },
  separator: {
    height: "1px",
    backgroundColor: "#e8eaed",
    margin: "8px 0",
  },
  componentItem: {
    padding: "16px 12px",
    marginBottom: "4px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: "14px",
    color: "#1f2937",
    border: "1px solid #e8eaed",
    backgroundColor: "#ffffff",
    textAlign: "center" as const,
  },
  componentItemHover: {
    backgroundColor: "#f8f9fa",
    borderColor: "#d1d5db",
    color: "#1f2937",
  },
  componentItemSelected: {
    backgroundColor: "#4F46E5",
    color: "#ffffff",
    borderColor: "#4F46E5",
  },
  componentItemSelectedHover: {
    backgroundColor: "#4338CA",
    borderColor: "#4338CA",
    color: "#ffffff",
  },
  componentName: {
    fontWeight: "500",
    color: "inherit",
  },
  componentType: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "4px",
  },
  componentTypeSelected: {
    color: "#e0e7ff",
  },
};

interface ComponentListProps {
  components: ComponentData;
}

export function ComponentList({ components }: ComponentListProps) {
  const [selectedComponent, setSelectedComponent] = useAtom(selectedComponentAtom);

  // Convert to flat list - we don't need complex grouping for scrollable list
  const allComponents = Object.entries(components).filter(
    ([name, component]) => component.type !== "separator"
  );

  function handleComponentClick(componentName: string) {
    // Sanitize the input value
    const sanitizedValue = InputSanitizer.sanitizeUserInput(componentName);

    // Validate the selection
    const componentNames = Object.keys(components).filter(
      (name) => components[name].type !== "separator"
    );
    const validationResult = InputValidator.validateDropdownSelection(
      sanitizedValue,
      componentNames
    );

    if (validationResult.valid) {
      setSelectedComponent(sanitizedValue);
    } else {
      console.log("Component selection validation failed:", validationResult.errors);
    }
  }

  return (
    <div style={listStyles.container}>
      {allComponents.map(([name, component], index) => {
        const isSelected = selectedComponent === name;

        return (
          <div key={name}>
            <div
              style={{
                ...listStyles.componentItem,
                ...(isSelected ? listStyles.componentItemSelected : {}),
              }}
              onClick={() => handleComponentClick(name)}
              onMouseEnter={(e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
                if (!isSelected) {
                  Object.assign(e.currentTarget.style, listStyles.componentItemHover);
                } else {
                  Object.assign(e.currentTarget.style, listStyles.componentItemSelectedHover);
                }
              }}
              onMouseLeave={(e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
                if (!isSelected) {
                  Object.assign(e.currentTarget.style, listStyles.componentItem);
                } else {
                  Object.assign(e.currentTarget.style, listStyles.componentItemSelected);
                }
              }}
            >
              <div style={listStyles.componentName}>{name}</div>
              {component.type && (
                <div
                  style={{
                    ...listStyles.componentType,
                    ...(isSelected ? listStyles.componentTypeSelected : {}),
                  }}
                >
                  {component.type}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}