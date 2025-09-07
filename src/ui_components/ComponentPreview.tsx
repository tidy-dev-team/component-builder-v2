import { h } from "preact";
import { useAtom } from "jotai";
import { selectedComponentAtom, selectedComponentPropertiesAtom, propertyUsedStatesAtom } from "../state/atoms";
import { ComponentPropertyInfo, PropertyUsedStates } from "../types";
import { renderAllProperties } from "../ui_elements";

const previewStyles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
    overflow: "hidden",
    padding: "4px",
    gap: "4px",
  },
  header: {
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
  },
  componentName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  componentDescription: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.4",
  },
  imagePlaceholder: {
    width: "100%",
    height: "65px",
    backgroundColor: "#f8f9fa",
    border: "2px dashed #d1d5db",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0px",
  },
  placeholderIcon: {
    fontSize: "16px",
    color: "#6b7280",
  },
  placeholderText: {
    fontSize: "16px",
    color: "#6b7280",
    marginTop: "0px",
    textAlign: "center" as const,
  },
  content: {
    flex: 1,
    padding: "4px",
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  descriptionBlock: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "13px",
    color: "#374151",
    lineHeight: "1.4",
    minHeight: "80px",
  },
  propertiesBlock: {
    backgroundColor: "#ffffff",
    border: "1px solid #e8eaed",
    borderRadius: "4px",
    padding: "12px",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
  },
  propertiesContent: {
    width: "100%",
  },
  propertiesPlaceholder: {
    color: "#6b7280",
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
    color: "#6b7280",
    textAlign: "center" as const,
  },
  emptyStateIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  emptyStateSubtext: {
    fontSize: "12px",
    color: "#9ca3af",
  },
};

interface ComponentPreviewProps {
  nestedInstances?: { name: string; id: string; key: string }[];
  description?: string;
}

export function ComponentPreview({ nestedInstances, description }: ComponentPreviewProps) {
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
      {/* Component Image Placeholder */}
      <div style={previewStyles.imagePlaceholder}>
        <div style={previewStyles.placeholderText}>placeholder image</div>
      </div>

      <div style={previewStyles.content}>
        {/* Component Name Header */}
        <div style={previewStyles.header}>
          <div style={previewStyles.componentName}>{selectedComponent}</div>
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
            <div style={previewStyles.propertiesPlaceholder}>
              property checkboxes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}