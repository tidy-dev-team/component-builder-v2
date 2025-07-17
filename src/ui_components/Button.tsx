import { Button } from "@create-figma-plugin/ui";
import { h, JSX } from "preact";
import { ButtonComponentProps } from "../types";

const buttonStyles = {
  base: {
    height: "36px",
    fontSize: "13px",
    fontWeight: "500",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    color: "#ffffff",
    boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
  },
  hover: {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(79, 70, 229, 0.3)",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },
};

export function ButtonComponent({
  callback,
  disabled = false,
}: ButtonComponentProps & { disabled?: boolean }): JSX.Element {
  return (
    <Button 
      fullWidth 
      onClick={disabled ? undefined : callback} 
      disabled={disabled}
      style={{
        ...buttonStyles.base,
        ...(disabled ? buttonStyles.disabled : {}),
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, buttonStyles.hover);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, buttonStyles.base);
        }
      }}
    >
      {disabled ? "Select a component" : "Build on canvas"}
    </Button>
  );
}
