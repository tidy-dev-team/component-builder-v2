// Minimal, flat, monochrome design system
export const minimalStyles = {
  // Monochrome color palette
  colors: {
    // Primary scales (grayscale)
    black: '#000000',
    gray900: '#1a1a1a',
    gray800: '#2d2d2d', 
    gray700: '#404040',
    gray600: '#525252',
    gray500: '#737373',
    gray400: '#a3a3a3',
    gray300: '#d4d4d4',
    gray200: '#e5e5e5',
    gray100: '#f5f5f5',
    white: '#ffffff',
    
    // Accent colors (minimal use)
    accent: '#2563eb', // Single blue accent for interactive elements
    accentHover: '#1d4ed8',
    
    // Semantic colors
    background: '#fafafa',
    surface: '#ffffff',
    border: '#e5e5e5',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
  },

  // Typography - monospace/terminal inspired
  typography: {
    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
    fontSize: {
      xs: '11px',
      sm: '12px', 
      base: '13px',
      lg: '14px',
      xl: '16px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.4',
      relaxed: '1.6',
    },
  },

  // Spacing - based on 4px grid
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px', 
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
  },

  // Borders - minimal, sharp
  borders: {
    none: '0',
    thin: '1px',
    thick: '2px',
  },

  // Border radius - minimal, sharp corners
  borderRadius: {
    none: '0px',
    sm: '2px',
    base: '4px',
    lg: '6px',
  },

  // Shadows - minimal, flat
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },

  // Transitions - snappy, purposeful
  transitions: {
    fast: '150ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    elevated: 10,
    dropdown: 20,
    modal: 30,
  },
} as const;

// Component-specific minimal styles
export const componentStyles = {
  // Button styles
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: minimalStyles.typography.fontFamily,
      fontSize: minimalStyles.typography.fontSize.sm,
      fontWeight: minimalStyles.typography.fontWeight.medium,
      lineHeight: minimalStyles.typography.lineHeight.tight,
      border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.gray800}`,
      borderRadius: minimalStyles.borderRadius.base,
      backgroundColor: minimalStyles.colors.gray800,
      color: minimalStyles.colors.white,
      cursor: 'pointer',
      transition: minimalStyles.transitions.fast,
      outline: 'none',
      textDecoration: 'none',
      userSelect: 'none',
      whiteSpace: 'nowrap',
    },
    hover: {
      backgroundColor: minimalStyles.colors.gray700,
      borderColor: minimalStyles.colors.gray600,
    },
    active: {
      backgroundColor: minimalStyles.colors.gray600,
      transform: 'translateY(0.5px)',
    },
    focus: {
      borderColor: minimalStyles.colors.accent,
      boxShadow: `0 0 0 2px rgba(37, 99, 235, 0.1)`,
    },
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    primary: {
      backgroundColor: minimalStyles.colors.accent,
      borderColor: minimalStyles.colors.accent,
      color: minimalStyles.colors.white,
    },
    primaryHover: {
      backgroundColor: minimalStyles.colors.accentHover,
      borderColor: minimalStyles.colors.accentHover,
    },
  },

  // Input styles
  input: {
    base: {
      fontFamily: minimalStyles.typography.fontFamily,
      fontSize: minimalStyles.typography.fontSize.sm,
      lineHeight: minimalStyles.typography.lineHeight.normal,
      border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
      borderRadius: minimalStyles.borderRadius.base,
      backgroundColor: minimalStyles.colors.white,
      color: minimalStyles.colors.text,
      outline: 'none',
      transition: minimalStyles.transitions.fast,
    },
    focus: {
      borderColor: minimalStyles.colors.accent,
      boxShadow: `0 0 0 2px rgba(37, 99, 235, 0.1)`,
    },
    placeholder: {
      color: minimalStyles.colors.textMuted,
    },
  },

  // Card/Surface styles
  surface: {
    base: {
      backgroundColor: minimalStyles.colors.surface,
      border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
      borderRadius: minimalStyles.borderRadius.base,
    },
    elevated: {
      backgroundColor: minimalStyles.colors.surface,
      border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
      borderRadius: minimalStyles.borderRadius.base,
      boxShadow: minimalStyles.shadows.sm,
    },
  },
};

// Symbol/icon replacements
export const symbols = {
  search: '⌕',
  clear: '×',
  dropdown: '▼',
  checkbox: {
    checked: '■',
    unchecked: '□',
    indeterminate: '▣',
  },
  radio: {
    selected: '●',
    unselected: '○',
  },
  arrow: {
    right: '→',
    down: '↓',
    up: '↑',
    left: '←',
  },
  status: {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  },
  navigation: {
    close: '×',
    menu: '≡',
    back: '←',
    forward: '→',
  },
  ui: {
    bullet: '•',
    divider: '│',
    ellipsis: '…',
    dash: '–',
  },
};

// Utility functions
export const utils = {
  // Truncate text with ellipsis
  truncate: (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + symbols.ui.ellipsis;
  },

  // Format numbers in monospace style
  formatNumber: (num: number) => {
    return num.toString().padStart(2, '0');
  },

  // Create consistent spacing
  spacing: (...values: number[]) => {
    return values.map(v => minimalStyles.spacing[v as keyof typeof minimalStyles.spacing] || '0').join(' ');
  },
};

