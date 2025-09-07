import { Container, render } from "@create-figma-plugin/ui";
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
  componentImageAtom,
} from "./state/atoms";
import { PropertyUsedStates } from "./types";
import { minimalStyles, symbols } from "./ui_styles_minimal";

// Minimal, flat, monochrome UI styles
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: minimalStyles.colors.background,
    fontFamily: minimalStyles.typography.fontFamily,
    color: minimalStyles.colors.text,
  },
  header: {
    padding: `${minimalStyles.spacing[5]} ${minimalStyles.spacing[4]}`,
    marginBottom: minimalStyles.spacing[1],
  },
  title: {
    fontSize: minimalStyles.typography.fontSize.lg,
    fontWeight: minimalStyles.typography.fontWeight.semibold,
    color: minimalStyles.colors.text,
    marginBottom: minimalStyles.spacing[1],
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: minimalStyles.typography.fontSize.sm,
    color: minimalStyles.colors.textSecondary,
    lineHeight: minimalStyles.typography.lineHeight.normal,
  },
  content: {
    flex: 1,
    display: "flex",
    gap: minimalStyles.spacing[3],
    padding: `0 ${minimalStyles.spacing[4]}`,
    minHeight: 0,
  },
  leftColumn: {
    flex: "1",
    minHeight: 0,
    backgroundColor: minimalStyles.colors.surface,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    borderRadius: minimalStyles.borderRadius.base,
    overflow: "hidden",
  },
  rightColumn: {
    flex: "0 0 240px",
    backgroundColor: minimalStyles.colors.surface,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    borderRadius: minimalStyles.borderRadius.base,
    overflow: "hidden",
  },
  footer: {
    padding: `${minimalStyles.spacing[4]} ${minimalStyles.spacing[4]} ${minimalStyles.spacing[5]}`,
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
  const [componentImage, setComponentImage] = useAtom(componentImageAtom);
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
      setComponentImage(null);

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
    setComponentImage,
  ]);

  useEffect(() => {
    console.log("🎧 Setting up COMPONENT_SET_PROPERTIES event listener...");
    const unsubscribe = on("COMPONENT_SET_PROPERTIES", (data) => {
      console.log(
        "📨 Received COMPONENT_SET_PROPERTIES event with data:",
        data
      );

      const { cachedComponentProps, nestedInstances, componentDescription, componentImage } =
        data;
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
      setComponentImage(componentImage || null);

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
  }, [
    setComponentProps,
    setPropertyUsedStates,
    setIsLoadingComponent,
    setComponentDescription,
    setComponentImage,
  ]);

  return (
    <Container space="medium" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          {symbols.ui.divider} tidy-ds-pathfinder {symbols.ui.divider}
        </div>
        <div style={styles.subtitle}>
          select component {symbols.ui.divider} customize properties
        </div>
      </div>

      {/* Two-Column Content */}
      <div style={styles.content}>
        {/* Left Column - Component Preview (Dynamic Content) */}
        <div style={styles.leftColumn}>
          <ComponentPreview
            nestedInstances={nestedInstances}
            description={componentDescription}
            componentImage={componentImage}
          />
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
