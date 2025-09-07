// Shared UI styles to eliminate repetition
export const sharedStyles = {
  // Common containers
  container: {
    border: "1px solid #e8eaed",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  
  // Common headers
  header: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  
  // Common blocks
  block: {
    background: "transparent",
    border: "1px solid #e8eaed",
    borderRadius: "8px",
    padding: "12px",
  },
  
  // Common text styles
  text: {
    primary: {
      fontSize: "14px",
      color: "#1f2937",
      fontWeight: "500",
    },
    secondary: {
      fontSize: "12px",
      color: "#6b7280",
    },
    disabled: {
      color: "#9ca3af",
    },
  },
  
  // Common spacing
  spacing: {
    small: "4px",
    medium: "8px",
    large: "12px",
    xlarge: "16px",
  },
  
  // Common colors
  colors: {
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    secondary: "#6b7280",
    background: "#f8f9fa",
    border: "#e8eaed",
    white: "#ffffff",
  },
  
  // Common transitions
  transitions: {
    fast: "all 0.15s ease",
    medium: "all 0.2s ease",
  },
} as const;

// Helper function to merge styles
export const mergeStyles = (base: any, ...overrides: any[]) => {
  return overrides.reduce((acc, override) => ({ ...acc, ...override }), base);
};

// Helper for hover state styles
export const getHoverStyles = (isHovered: boolean, isSelected: boolean) => {
  if (isSelected) {
    return {
      backgroundColor: isHovered ? sharedStyles.colors.primaryHover : sharedStyles.colors.primary,
      color: sharedStyles.colors.white,
      border: `1px solid ${isHovered ? sharedStyles.colors.primaryHover : sharedStyles.colors.primary}`,
    };
  }
  if (isHovered) {
    return {
      backgroundColor: sharedStyles.colors.background,
      border: `1px solid #d1d5db`,
    };
  }
  return {};
};