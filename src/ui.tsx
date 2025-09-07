import { Container, render, VerticalSpace } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { components } from "./componentData";
import { useAtom } from "jotai";

import { ComponentList } from "./ui_components/ComponentList";
import { ComponentPreview } from "./ui_components/ComponentPreview";
import { ButtonComponent } from "./ui_components/Button";
import {
  selectedComponentAtom,
  selectedComponentPropertiesAtom,
  propertyUsedStatesAtom,
  isLoadingComponentAtom,
  componentDescriptionAtom,
} from "./state/atoms";
import { ComponentPropertyInfo, PropertyUsedStates } from "./types";

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
    display: "flex",
    gap: "12px",
    padding: "0 2px",
    minHeight: 0, // Allow flex children to shrink
  },
  leftColumn: {
    flex: "1", // Flexible width for preview (takes remaining space)
    minHeight: 0,
    backgroundColor: "#f1f1f1",
    border: "1px solid #e8eaed",
    borderRadius: "4px",
    overflow: "hidden",
  },
  rightColumn: {
    flex: "0 0 240px", // Fixed width for component list (wider than before)
    backgroundColor: "#ffffff",
    border: "1px solid #e8eaed",
    borderRadius: "4px",
    overflow: "hidden",
  },
  footer: {
    padding: "16px 0 12px 0",
    borderTop: "1px solid #e8eaed",
    marginTop: "auto",
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
  const [isLoadingComponent, setIsLoadingComponent] = useAtom(
    isLoadingComponentAtom
  );
  const [componentDescription, setComponentDescription] = useAtom(
    componentDescriptionAtom
  );
  const [nestedInstances, setNestedInstances] = useState<
    { name: string; id: string; key: string }[]
  >([]);

  function handleButtonClick() {
    console.log("propertyUsedStates :>> ", propertyUsedStates);
    emit("BUILD", propertyUsedStates);
  }

  useEffect(() => {
    console.log(
      "🎯 Setting up useEffect for selectedComponent:",
      selectedComponent
    );
    if (selectedComponent) {
      console.log("🚀 Selected component changed, triggering data load...");
      setIsLoadingComponent(true);
      setComponentProps([]);
      setPropertyUsedStates({});
      setComponentDescription("");

      const componentData = components[selectedComponent];
      console.log(
        "📤 Emitting GET_COMPONENT_SET_PROPERTIES with:",
        componentData
      );
      emit("GET_COMPONENT_SET_PROPERTIES", componentData);
    } else {
      console.log("🧹 No component selected, clearing state");
    }
  }, [
    selectedComponent,
    setIsLoadingComponent,
    setComponentProps,
    setPropertyUsedStates,
    setComponentDescription,
  ]);

  useEffect(() => {
    console.log("🎧 Setting up COMPONENT_SET_PROPERTIES event listener...");
    const unsubscribe = on("COMPONENT_SET_PROPERTIES", (data) => {
      console.log(
        "📨 Received COMPONENT_SET_PROPERTIES event with data:",
        data
      );

      const { cachedComponentProps, nestedInstances, componentDescription } = data;
      console.log(
        "📋 Processing received data - Props:",
        cachedComponentProps,
        "Instances:",
        nestedInstances
      );

      // Handle undefined or null data gracefully
      const safeComponentProps = cachedComponentProps || [];
      const safeNestedInstances = nestedInstances || [];

      // First, set the component props
      setComponentProps(safeComponentProps);
      setNestedInstances(safeNestedInstances);
      setComponentDescription(componentDescription || "");

      // Only process if we have valid component props
      if (safeComponentProps && Array.isArray(safeComponentProps)) {
        console.log(
          "🔍 Processing component props:",
          safeComponentProps.length,
          "properties"
        );

        // Filter out invalid properties and validate names
        const validProps = safeComponentProps.filter(
          (prop: any, index: number) => {
            if (!prop || typeof prop !== "object") {
              console.log(
                `❌ Property ${index}: Invalid property object:`,
                prop
              );
              return false;
            }
            if (
              !prop.name ||
              typeof prop.name !== "string" ||
              prop.name.trim() === ""
            ) {
              console.log(`❌ Property ${index}: Missing valid name:`, prop);
              return false;
            }
            console.log(
              `✅ Property ${index}: Valid - ${prop.name} (${prop.type})`
            );
            return true;
          }
        );

        console.log("📋 Valid properties after filtering:", validProps.length);

        const initialUsedStates = validProps.reduce((acc: any, prop: any) => {
          if (prop && prop.name) {
            acc[prop.name] = true;
            console.log(`🔄 Initializing state for: ${prop.name} = true`);

            // Initialize variant options states
            if (prop.type === "VARIANT" && prop.variantOptions) {
              console.log(
                `🎯 Processing variant options for ${prop.name}:`,
                prop.variantOptions
              );
              prop.variantOptions.forEach((option: any) => {
                if (typeof option === "string" && option.trim() !== "") {
                  const variantKey = `${prop.name}#${option}`;
                  acc[variantKey] = true;
                  console.log(
                    `🔄 Initializing variant state: ${variantKey} = true`
                  );
                } else {
                  console.log(`⚠️ Skipping invalid variant option:`, option);
                }
              });
            }
          }
          return acc;
        }, {} as PropertyUsedStates);

        console.log(
          "🎯 Final initialUsedStates:",
          Object.keys(initialUsedStates)
        );
        setPropertyUsedStates(initialUsedStates);
      } else {
        console.log("🧹 Resetting property used states to empty");
        setPropertyUsedStates({});
      }

      // Add a small delay to ensure UI has time to render before hiding loading state
      setTimeout(() => {
        setIsLoadingComponent(false);
      }, 100);
    });
    return unsubscribe;
  }, [setComponentProps, setPropertyUsedStates, setIsLoadingComponent, setComponentDescription]);

  return (
    <Container space="medium" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>PropGate</div>
        <div style={styles.subtitle}>
          Select a component and customize its properties
        </div>
      </div>

      {/* Two-Column Content */}
      <div style={styles.content}>
        {/* Left Column - Component Preview (Dynamic Content) */}
        <div style={styles.leftColumn}>
          <ComponentPreview nestedInstances={nestedInstances} description={componentDescription} />
        </div>

        {/* Right Column - Component List */}
        <div style={styles.rightColumn}>
          <ComponentList components={components} />
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <ButtonComponent
          callback={handleButtonClick}
          disabled={!selectedComponent || isLoadingComponent}
        />
      </div>
    </Container>
  );
}

export default render(Plugin);
