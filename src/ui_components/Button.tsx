import { Button } from "@create-figma-plugin/ui";
import { h } from "preact";
import { ButtonComponentProps } from "../types";
import { sharedStyles } from "../ui_styles";

const buttonStyle = {
  height: "36px",
  fontSize: "13px",
  fontWeight: "500",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: sharedStyles.transitions.medium,
  background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  color: "#ffffff",
  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
};

export function ButtonComponent({
  callback,
  disabled = false,
}: ButtonComponentProps & { disabled?: boolean }) {
  const style = disabled 
    ? { ...buttonStyle, opacity: 0.5, cursor: "not-allowed" }
    : buttonStyle;

  return (
    <Button 
      fullWidth 
      onClick={disabled ? undefined : callback} 
      disabled={disabled}
      style={style}
    >
      {disabled ? "Select a component" : "Build on canvas"}
    </Button>
  );
}
