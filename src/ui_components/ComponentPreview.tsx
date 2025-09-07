import { h } from "preact";
import { useAtom } from "jotai";
import { selectedComponentAtom, selectedComponentPropertiesAtom, propertyUsedStatesAtom } from "../state/atoms";
import { renderAllProperties } from "../ui_elements";
import { sharedStyles } from "../ui_styles";

const previewStyles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#f1f1f1",
    border: `1px solid ${sharedStyles.colors.border}`,
    borderRadius: "4px",
    overflow: "hidden",
  },
  header: {
    padding: sharedStyles.spacing.large,
    backgroundColor: sharedStyles.colors.white,
    borderRadius: "4px",
    flexShrink: 0,
  },
  componentName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  imagePlaceholder: {
    width: "100%",
    height: "256px",
    backgroundColor: sharedStyles.colors.white,
    border: "2px dashed #d1d5db",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "4px 0",
  },
  placeholderText: {
    fontSize: "16px",
    color: sharedStyles.colors.secondary,
    textAlign: "center" as const,
  },
  content: {
    flex: 1,
    padding: sharedStyles.spacing.small,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: sharedStyles.spacing.small,
  },
  descriptionBlock: {
    backgroundColor: sharedStyles.colors.white,
    borderRadius: "4px",
    padding: sharedStyles.spacing.medium,
    fontSize: "13px",
    color: "#374151",
    lineHeight: "1.4",
    flexShrink: 0,
  },
  propertiesBlock: {
    backgroundColor: sharedStyles.colors.white,
    border: `1px solid ${sharedStyles.colors.border}`,
    borderRadius: "4px",
    padding: sharedStyles.spacing.large,
    flexShrink: 0,
  },
  propertiesContent: {
    width: "100%",
    height: "100%",
  },
  propertiesPlaceholder: {
    color: sharedStyles.colors.secondary,
    fontSize: "16px",
    textAlign: "center" as const,
    fontStyle: "italic" as const,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    color: sharedStyles.colors.secondary,
    textAlign: "center" as const,
  },
  emptyStateIcon: {
    fontSize: "48px",
    marginBottom: sharedStyles.spacing.large,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: sharedStyles.text.primary.fontSize,
    fontWeight: sharedStyles.text.primary.fontWeight,
    marginBottom: sharedStyles.spacing.medium,
  },
  emptyStateSubtext: {
    fontSize: sharedStyles.text.secondary.fontSize,
    color: "#9ca3af",
  },
};

interface ComponentPreviewProps {
  nestedInstances?: { name: string; id: string; key: string }[];
  description?: string;
  componentImage?: string | null;
}

export function ComponentPreview({ nestedInstances, description, componentImage }: ComponentPreviewProps) {
  const [selectedComponent] = useAtom(selectedComponentAtom);
  const [componentProps] = useAtom(selectedComponentPropertiesAtom);
  const [propertyUsedStates] = useAtom(propertyUsedStatesAtom);

  if (!selectedComponent) {
    return (
      <div style={previewStyles.container}>
        <div style={previewStyles.emptyState}>
          <div style={previewStyles.emptyStateIcon}>🎨</div>
          <div style={previewStyles.emptyStateText}>Select a component</div>
          <div style={previewStyles.emptyStateSubtext}>
            Choose a component from the list to see its properties and preview
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={previewStyles.container}>
      <div style={previewStyles.content}>
        {/* Component Name Header */}
        <div style={previewStyles.header}>
          <div style={previewStyles.componentName}>{selectedComponent}</div>
        </div>

        {/* Component Image */}
        <div style={previewStyles.imagePlaceholder}>
          {componentImage ? (
            <img 
              src={componentImage} 
              alt={selectedComponent}
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "248px", // 256px - 8px padding
                objectFit: "contain",
                objectPosition: "center",
                borderRadius: "4px",
                display: "block",
              }}
            />
          ) : (
            <div style={previewStyles.placeholderText}>Loading preview...</div>
          )}
        </div>

        {/* Component Description */}
        <div style={previewStyles.descriptionBlock}>
          {description && description !== "No description available" && description !== "Error loading description" ? (
            <div>
              {/* Parse and display the description with proper formatting */}
              {description.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return <div key={index} style={{ height: "8px" }} />;
                
                // Check for hashtags
                if (trimmedLine.startsWith('#')) {
                  return (
                    <div key={index} style={{ 
                      color: "#6b7280", 
                      fontSize: "11px", 
                      marginBottom: "4px",
                      fontFamily: "monospace"
                    }}>
                      {trimmedLine}
                    </div>
                  );
                }
                
                // Check for emoji markers (info and folder)
                if (trimmedLine.startsWith('ℹ️') || trimmedLine.startsWith('🗂️')) {
                  return (
                    <div key={index} style={{ 
                      fontSize: "14px", 
                      marginBottom: trimmedLine.length > 2 ? "8px" : "4px",
                      fontWeight: trimmedLine.length > 2 ? "500" : "normal"
                    }}>
                      {trimmedLine}
                    </div>
                  );
                }
                
                // Regular text
                return (
                  <div key={index} style={{ 
                    marginBottom: "6px",
                    lineHeight: "1.4"
                  }}>
                    {trimmedLine}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: "#6b7280", fontStyle: "italic" }}>
              {description === "Error loading description" 
                ? "Error loading component description"
                : "No description available for this component"}
            </div>
          )}
        </div>

        {/* Properties */}
        <div style={previewStyles.propertiesBlock}>
          {componentProps.length > 0 ? (
            <div style={previewStyles.propertiesContent}>
              {renderAllProperties(componentProps, propertyUsedStates, nestedInstances)}
            </div>
          ) : (
            <div style={{
              ...previewStyles.propertiesPlaceholder,
              padding: "40px 20px",
              textAlign: "center" as const,
            }}>
              property checkboxes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}