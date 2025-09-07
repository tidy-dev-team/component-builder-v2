import { Button } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import { ButtonComponentProps } from "../types";
import { minimalStyles, componentStyles, symbols } from "../ui_styles_minimal";

export function ButtonComponent({
  callback,
  disabled = false,
}: ButtonComponentProps & { disabled?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getButtonStyle = () => {
    const baseStyle = {
      ...componentStyles.button.base,
      width: '100%',
      textTransform: 'lowercase',
      letterSpacing: '0.01em',
    };

    if (disabled) {
      return { ...baseStyle, ...componentStyles.button.disabled };
    }
    
    if (isHovered) {
      return { ...baseStyle, ...componentStyles.button.hover };
    }
    
    return baseStyle;
  };

  return (
    <Button 
      fullWidth 
      onClick={disabled ? undefined : callback} 
      disabled={disabled}
      style={getButtonStyle()}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {disabled ? `${symbols.ui.divider} select component ${symbols.ui.divider}` : `${symbols.ui.divider} build on canvas ${symbols.ui.divider}`}
    </Button>
  );
}
