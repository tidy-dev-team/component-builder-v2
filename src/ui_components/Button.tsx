import { Button } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import { ButtonComponentProps } from "../types";
import { minimalStyles, componentStyles, symbols } from "../ui_styles_minimal";

export function ButtonComponent({
  callback,
  disabled = false,
  loading = false,
}: ButtonComponentProps & { disabled?: boolean; loading?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getButtonStyle = () => {
    const baseStyle = {
      ...componentStyles.button.base,
      width: '100%',
      textTransform: 'lowercase',
      letterSpacing: '0.01em',
    };

    if (disabled || loading) {
      return { ...baseStyle, ...componentStyles.button.disabled };
    }
    
    if (isHovered) {
      return { ...baseStyle, ...componentStyles.button.hover };
    }
    
    return baseStyle;
  };

  const getButtonText = () => {
    if (loading) {
      return `${symbols.ui.divider} loading... ${symbols.ui.divider}`;
    }
    if (disabled) {
      return `${symbols.ui.divider} select component ${symbols.ui.divider}`;
    }
    return `${symbols.ui.divider} build on canvas ${symbols.ui.divider}`;
  };

  return (
    <Button 
      fullWidth 
      onClick={disabled || loading ? undefined : callback} 
      disabled={disabled || loading}
      style={getButtonStyle()}
      onMouseEnter={() => !disabled && !loading && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getButtonText()}
    </Button>
  );
}
