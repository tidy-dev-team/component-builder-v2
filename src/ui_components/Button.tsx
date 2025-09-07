import { Button } from "@create-figma-plugin/ui";
import { h } from "preact";
import { ButtonComponentProps } from "../types";
import { minimalStyles, componentStyles, symbols } from "../ui_styles_minimal";

export function ButtonComponent({
  callback,
  disabled = false,
}: ButtonComponentProps & { disabled?: boolean }) {
  const baseStyle = {
    ...componentStyles.button.base,
    width: '100%',
    textTransform: 'lowercase',
    letterSpacing: '0.01em',
  };

  const style = disabled 
    ? { ...baseStyle, ...componentStyles.button.disabled }
    : baseStyle;

  return (
    <Button 
      fullWidth 
      onClick={disabled ? undefined : callback} 
      disabled={disabled}
      style={style}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, componentStyles.button.hover);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, baseStyle);
        }
      }}
    >
      {disabled ? `${symbols.ui.divider} select component ${symbols.ui.divider}` : `${symbols.ui.divider} build on canvas ${symbols.ui.divider}`}
    </Button>
  );
}
