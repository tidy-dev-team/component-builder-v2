import { h } from "preact";
import { useState } from "preact/hooks";
import { useAtom } from "jotai";
import { selectedComponentAtom } from "../state/atoms";
import { ComponentData } from "../types";
import { sharedStyles, getHoverStyles } from "../ui_styles";

const listStyles = {
  container: {
    height: "100%",
    overflowY: "auto" as const,
    padding: sharedStyles.spacing.small,
  },
  componentItem: {
    padding: "16px 12px",
    marginBottom: sharedStyles.spacing.small,
    borderRadius: "4px",
    cursor: "pointer",
    transition: sharedStyles.transitions.fast,
    fontSize: sharedStyles.text.primary.fontSize,
    color: sharedStyles.text.primary.color,
    border: `1px solid ${sharedStyles.colors.border}`,
    backgroundColor: sharedStyles.colors.white,
    textAlign: "left" as const,
  },
  componentName: {
    fontWeight: sharedStyles.text.primary.fontWeight,
    color: "inherit",
  },
  componentType: {
    fontSize: "11px",
    color: sharedStyles.colors.secondary,
    marginTop: "4px",
  },
};

interface ComponentListProps {
  components: ComponentData;
}

export function ComponentList({ components }: ComponentListProps) {
  const [selectedComponent, setSelectedComponent] = useAtom(selectedComponentAtom);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const allComponents = Object.entries(components).filter(
    ([, component]) => component.type !== "separator"
  );

  const handleComponentClick = (componentName: string) => {
    setSelectedComponent(componentName);
  };

  return (
    <div style={listStyles.container}>
      {allComponents.map(([name, component]) => {
        const isSelected = selectedComponent === name;
        const isHovered = hoveredComponent === name;

        const itemStyle = {
          ...listStyles.componentItem,
          ...getHoverStyles(isHovered, isSelected),
        };

        return (
          <div key={name}>
            <div
              style={itemStyle}
              onClick={() => handleComponentClick(name)}
              onMouseEnter={() => setHoveredComponent(name)}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <div style={listStyles.componentName}>{name}</div>
              {component.type && (
                <div
                  style={{
                    ...listStyles.componentType,
                    color: isSelected ? "#e0e7ff" : sharedStyles.colors.secondary,
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