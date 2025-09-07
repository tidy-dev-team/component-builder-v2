import { h } from "preact";
import { useAtom } from "jotai";
import {
  selectedComponentAtom,
  selectedComponentPropertiesAtom,
  propertyUsedStatesAtom,
} from "../state/atoms";
import { renderAllProperties } from "../ui_elements";
import { minimalStyles, symbols } from "../ui_styles_minimal";

const previewStyles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: minimalStyles.colors.background,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    borderRadius: minimalStyles.borderRadius.base,
    overflow: "hidden",
  },
  header: {
    padding: minimalStyles.spacing[4],
    backgroundColor: minimalStyles.colors.surface,
    borderBottom: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    flexShrink: 0,
  },
  componentName: {
    fontSize: minimalStyles.typography.fontSize.lg,
    fontWeight: minimalStyles.typography.fontWeight.semibold,
    color: minimalStyles.colors.text,
    marginBottom: minimalStyles.spacing[1],
    fontFamily: minimalStyles.typography.fontFamily,
    textTransform: "lowercase" as const,
  },
  imagePlaceholder: {
    width: "100%",
    height: "200px",
    backgroundColor: minimalStyles.colors.background,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    borderRadius: minimalStyles.borderRadius.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  placeholderText: {
    fontSize: minimalStyles.typography.fontSize.sm,
    color: minimalStyles.colors.textSecondary,
    textAlign: "center" as const,
    fontFamily: minimalStyles.typography.fontFamily,
    textTransform: "lowercase" as const,
  },
  content: {
    flex: 1,
    padding: minimalStyles.spacing[4],
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: minimalStyles.spacing[4],
  },
  descriptionBlock: {
    backgroundColor: minimalStyles.colors.surface,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    borderRadius: minimalStyles.borderRadius.sm,
    padding: minimalStyles.spacing[3],
    fontSize: minimalStyles.typography.fontSize.sm,
    color: minimalStyles.colors.text,
    lineHeight: minimalStyles.typography.lineHeight.normal,
    flexShrink: 0,
    fontFamily: minimalStyles.typography.fontFamily,
  },
  propertiesBlock: {
    backgroundColor: minimalStyles.colors.surface,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    borderRadius: minimalStyles.borderRadius.sm,
    padding: minimalStyles.spacing[3],
    flexShrink: 0,
  },
  propertiesContent: {
    width: "100%",
    height: "100%",
  },
  propertiesPlaceholder: {
    color: minimalStyles.colors.textSecondary,
    fontSize: minimalStyles.typography.fontSize.sm,
    textAlign: "center" as const,
    fontFamily: minimalStyles.typography.fontFamily,
    textTransform: "lowercase" as const,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    color: minimalStyles.colors.textSecondary,
    textAlign: "center" as const,
    fontFamily: minimalStyles.typography.fontFamily,
  },
  emptyStateIcon: {
    fontSize: "32px",
    marginBottom: minimalStyles.spacing[4],
    opacity: 0.3,
    fontFamily: minimalStyles.typography.fontFamily,
  },
  emptyStateText: {
    fontSize: minimalStyles.typography.fontSize.base,
    fontWeight: minimalStyles.typography.fontWeight.medium,
    marginBottom: minimalStyles.spacing[2],
    textTransform: "lowercase" as const,
  },
  emptyStateSubtext: {
    fontSize: minimalStyles.typography.fontSize.xs,
    color: minimalStyles.colors.textMuted,
    textTransform: "lowercase" as const,
  },
};

interface ComponentPreviewProps {
  nestedInstances?: { name: string; id: string; key: string }[];
  description?: string;
  componentImage?: string | null;
}

export function ComponentPreview({
  nestedInstances,
  description,
  componentImage,
}: ComponentPreviewProps) {
  const [selectedComponent] = useAtom(selectedComponentAtom);
  const [componentProps] = useAtom(selectedComponentPropertiesAtom);
  const [propertyUsedStates] = useAtom(propertyUsedStatesAtom);

  if (!selectedComponent) {
    return (
      <div style={previewStyles.container}>
        <div style={previewStyles.emptyState}>
          <div style={previewStyles.emptyStateIcon}>✦</div>
          <div style={previewStyles.emptyStateText}>select component</div>
          <div style={previewStyles.emptyStateSubtext}>
            choose component from list to preview properties
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
          <div style={previewStyles.componentName}>
            {symbols.ui.divider} {selectedComponent.toLowerCase()}{" "}
            {symbols.ui.divider}
          </div>
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
                maxWidth: "calc(100% - 16px)",
                maxHeight: "calc(200px - 16px)", // Account for container padding
                objectFit: "contain",
                objectPosition: "center",
                borderRadius: "4px",
                display: "block",
              }}
            />
          ) : (
            <div style={previewStyles.placeholderText}>
              {symbols.ui.divider} loading preview {symbols.ui.divider}
            </div>
          )}
        </div>

        {/* Component Description */}
        <div style={previewStyles.descriptionBlock}>
          {description &&
          description !== "No description available" &&
          description !== "Error loading description" ? (
            <div>
              {/* Parse and display the description with proper formatting */}
              {description.split("\n").map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine)
                  return <div key={index} style={{ height: "8px" }} />;

                // Check for hashtags
                if (trimmedLine.startsWith("#")) {
                  return (
                    <div
                      key={index}
                      style={{
                        color: "#6b7280",
                        fontSize: "11px",
                        marginBottom: "4px",
                        fontFamily: "monospace",
                      }}
                    >
                      {trimmedLine}
                    </div>
                  );
                }

                // Check for emoji markers (info and folder)
                if (
                  trimmedLine.startsWith("ℹ️") ||
                  trimmedLine.startsWith("🗂️")
                ) {
                  return (
                    <div
                      key={index}
                      style={{
                        fontSize: "14px",
                        marginBottom: trimmedLine.length > 2 ? "8px" : "4px",
                        fontWeight: trimmedLine.length > 2 ? "500" : "normal",
                      }}
                    >
                      {trimmedLine}
                    </div>
                  );
                }

                // Regular text
                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: "6px",
                      lineHeight: "1.4",
                    }}
                  >
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
              {renderAllProperties(
                componentProps,
                propertyUsedStates,
                nestedInstances
              )}
            </div>
          ) : (
            <div
              style={{
                ...previewStyles.propertiesPlaceholder,
                padding: "40px 20px",
                textAlign: "center" as const,
              }}
            >
              {symbols.ui.divider} property checkboxes {symbols.ui.divider}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
