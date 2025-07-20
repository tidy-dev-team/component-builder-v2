import { Container, render, VerticalSpace } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { components } from "./componentData";
import { useAtom } from "jotai";

import { DropdownComponent } from "./ui_components/Dropdown";
import { ButtonComponent } from "./ui_components/Button";
import {
  selectedComponentAtom,
  selectedComponentPropertiesAtom,
  propertyUsedStatesAtom,
} from "./state/atoms";
import { ComponentPropertyInfo, PropertyUsedStates } from "./types";
import { renderAllProperties } from "./ui_elements";

// Sleek UI styles
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    padding: "16px 0 12px 0",
    borderBottom: "1px solid #e8eaed",
    marginBottom: "20px",
  },
  title: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
    letterSpacing: "0.01em",
  },
  subtitle: {
    fontSize: "11px",
    color: "#6b7280",
    lineHeight: "1.4",
  },
  content: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "0 2px",
  },
  footer: {
    padding: "16px 0 12px 0",
    borderTop: "1px solid #e8eaed",
    marginTop: "auto",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px 20px",
    color: "#6b7280",
  },
  emptyStateIcon: {
    fontSize: "24px",
    marginBottom: "12px",
    opacity: 0.6,
  },
  emptyStateText: {
    fontSize: "12px",
    lineHeight: "1.5",
  },
};

function Plugin() {
  const [selectedComponent] = useAtom(selectedComponentAtom);
  const [componentProps, setComponentProps] = useAtom(
    selectedComponentPropertiesAtom
  );
  const [propertyUsedStates, setPropertyUsedStates] = useAtom(
    propertyUsedStatesAtom
  );

  function handleButtonClick() {
    console.log("propertyUsedStates :>> ", propertyUsedStates);
    emit("BUILD", propertyUsedStates);
  }

  useEffect(() => {
    if (selectedComponent) {
      emit("GET_COMPONENT_SET_PROPERTIES", components[selectedComponent]);
    }
  }, [selectedComponent]);

  useEffect(() => {
    const unsubscribe = on(
      "COMPONENT_SET_PROPERTIES",
      ({ cachedComponentProps, nestedInstances }) => {
        console.log(
          "data with path :>> ",
          cachedComponentProps,
          nestedInstances
        );
        setComponentProps(cachedComponentProps);
        const initialUsedStates = cachedComponentProps.reduce(
          (acc: any, prop: any) => {
            acc[prop.name] = true;
            // Initialize variant options states
            if (prop.type === "VARIANT" && prop.variantOptions) {
              prop.variantOptions.forEach((option: any) => {
                acc[`${prop.name}#${option}`] = true;
              });
            }
            return acc;
          },
          {} as PropertyUsedStates
        );
        setPropertyUsedStates(initialUsedStates);
      }
    );
    return unsubscribe;
  }, [setComponentProps, setPropertyUsedStates]);

  return (
    <Container space="medium" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>PropGate</div>
        <div style={styles.subtitle}>
          Select a component and customize its properties
        </div>
      </div>

      {/* Component Selection */}
      <div style={{ marginBottom: "20px" }}>
        <DropdownComponent components={components} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        {selectedComponent && componentProps.length > 0 ? (
          renderAllProperties(componentProps, propertyUsedStates)
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>⚡</div>
            <div style={styles.emptyStateText}>
              {selectedComponent
                ? "Loading component properties..."
                : "Choose a component to get started"}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <ButtonComponent
          callback={handleButtonClick}
          disabled={!selectedComponent || componentProps.length === 0}
        />
      </div>
    </Container>
  );
}

export default render(Plugin);
