import { h, Fragment } from "preact";
import { useState, useEffect, useMemo, useCallback } from "preact/hooks";
import { useAtom } from "jotai";
import { selectedComponentAtom, componentSearchTermAtom } from "../state/atoms";
import { ComponentData } from "../types";
import { minimalStyles, symbols } from "../ui_styles_minimal";

const listStyles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: minimalStyles.colors.background,
  },
  searchContainer: {
    padding: minimalStyles.spacing[3],
    backgroundColor: minimalStyles.colors.surface,
    borderBottom: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
  },
  searchInputWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute" as const,
    left: minimalStyles.spacing[3],
    color: minimalStyles.colors.textSecondary,
    fontSize: minimalStyles.typography.fontSize.base,
    fontFamily: minimalStyles.typography.fontFamily,
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    padding: `${minimalStyles.spacing[2]} ${minimalStyles.spacing[3]} ${minimalStyles.spacing[2]} ${minimalStyles.spacing[6]}`,
    fontSize: minimalStyles.typography.fontSize.sm,
    fontFamily: minimalStyles.typography.fontFamily,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.border}`,
    borderRadius: minimalStyles.borderRadius.sm,
    outline: "none",
    transition: minimalStyles.transitions.fast,
    backgroundColor: minimalStyles.colors.surface,
    color: minimalStyles.colors.text,
  },
  searchInputFocus: {
    borderColor: minimalStyles.colors.accent,
    boxShadow: `0 0 0 1px ${minimalStyles.colors.accent}`,
  },
  listContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: minimalStyles.spacing[2],
  },
  componentItem: {
    padding: `${minimalStyles.spacing[3]} ${minimalStyles.spacing[3]}`,
    marginBottom: minimalStyles.spacing[1],
    borderRadius: minimalStyles.borderRadius.sm,
    cursor: "pointer",
    transition: minimalStyles.transitions.fast,
    fontSize: minimalStyles.typography.fontSize.sm,
    fontFamily: minimalStyles.typography.fontFamily,
    color: minimalStyles.colors.text,
    border: `${minimalStyles.borders.thin} solid transparent`,
    backgroundColor: "transparent",
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    pointerEvents: "auto" as const,
  },
  componentItemHover: {
    backgroundColor: minimalStyles.colors.gray100,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.gray200}`,
  },
  componentItemSelected: {
    backgroundColor: minimalStyles.colors.gray900,
    color: minimalStyles.colors.white,
    border: `${minimalStyles.borders.thin} solid ${minimalStyles.colors.gray900}`,
  },
  componentName: {
    fontWeight: minimalStyles.typography.fontWeight.medium,
    color: "inherit",
    fontFamily: minimalStyles.typography.fontFamily,
  },
  componentType: {
    fontSize: minimalStyles.typography.fontSize.xs,
    color: "inherit",
    opacity: 0.7,
    marginTop: minimalStyles.spacing[1],
    fontFamily: minimalStyles.typography.fontFamily,
    textTransform: "lowercase" as const,
  },
  resultsCount: {
    padding: `${minimalStyles.spacing[2]} ${minimalStyles.spacing[3]}`,
    fontSize: minimalStyles.typography.fontSize.xs,
    color: minimalStyles.colors.textSecondary,
    fontFamily: minimalStyles.typography.fontFamily,
    textAlign: "center" as const,
    textTransform: "lowercase" as const,
  },
  noResults: {
    padding: minimalStyles.spacing[6],
    textAlign: "center" as const,
    color: minimalStyles.colors.textSecondary,
    fontSize: minimalStyles.typography.fontSize.sm,
    fontFamily: minimalStyles.typography.fontFamily,
    textTransform: "lowercase" as const,
  },
};

interface ComponentListProps {
  components: ComponentData;
}

export function ComponentList({ components }: ComponentListProps) {
  const [selectedComponent, setSelectedComponent] = useAtom(selectedComponentAtom);
  const [searchTerm, setSearchTerm] = useAtom(componentSearchTermAtom);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [optimisticSelection, setOptimisticSelection] = useState<string | null>(null);

  // Cleanup hover state when component unmounts or search changes
  useEffect(() => {
    return () => {
      setHoveredComponent(null);
    };
  }, []);

  // Reset hover state when search results change
  useEffect(() => {
    setHoveredComponent(null);
  }, [searchTerm]);

  // Reset optimistic selection when actual selection changes
  useEffect(() => {
    if (selectedComponent) {
      setOptimisticSelection(null);
    }
  }, [selectedComponent]);

  // Simple cleanup when hoveredComponent changes
  useEffect(() => {
    // Ensure clean state transitions
    if (!hoveredComponent) {
      return;
    }
    
    // Optional: Add any additional cleanup logic here if needed
  }, [hoveredComponent]);

  // Simple container mouse leave handler
  const handleContainerMouseLeave = () => {
    setHoveredComponent(null);
  };

  // Memoize filtered components based on search term
  const allComponents = useMemo(() => {
    return Object.entries(components).filter(
      ([name, component]) => {
        if (component.type === "separator") return false;
        if (!searchTerm.trim()) return true;

        // Case-insensitive search in component name and type
        const searchLower = searchTerm.toLowerCase().trim();
        const nameMatch = name.toLowerCase().includes(searchLower);
        const typeMatch = component.type?.toLowerCase().includes(searchLower) || false;

        return nameMatch || typeMatch;
      }
    );
  }, [components, searchTerm]);

  // Memoized function to highlight search matches in text
  const highlightMatch = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{
          backgroundColor: minimalStyles.colors.gray900,
          color: minimalStyles.colors.white,
          fontWeight: minimalStyles.typography.fontWeight.semibold
        }}>
          {part}
        </span>
      ) : part
    );
  }, []);

  const handleComponentClick = useCallback((componentName: string) => {
    // Set optimistic selection immediately for instant visual feedback
    setOptimisticSelection(componentName);
    setSelectedComponent(componentName);
    // Always clear hover state when clicking to prevent sticking
    setHoveredComponent(null);
  }, [setSelectedComponent]);

  const handleSearchChange = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    setSearchTerm(target.value);
  }, [setSearchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    // Clear hover state when clearing search
    setHoveredComponent(null);
  }, [setSearchTerm]);

  // Simplified and more reliable hover handlers
  const handleMouseEnter = useCallback((componentName: string) => () => {
    setHoveredComponent(componentName);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredComponent(null);
  }, []);

  return (
    <div style={listStyles.container}>
      {/* Search Input */}
      <div style={listStyles.searchContainer}>
        <div style={listStyles.searchInputWrapper}>
          <span style={listStyles.searchIcon}>{symbols.search}</span>
          <input
            type="text"
            placeholder="search components..."
            value={searchTerm}
            onInput={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              ...listStyles.searchInput,
              ...(isSearchFocused ? listStyles.searchInputFocus : {}),
            }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                position: "absolute" as const,
                right: minimalStyles.spacing[2],
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                fontSize: minimalStyles.typography.fontSize.lg,
                cursor: "pointer",
                color: minimalStyles.colors.textSecondary,
                padding: minimalStyles.spacing[1],
                lineHeight: "1",
                fontFamily: minimalStyles.typography.fontFamily,
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              {symbols.clear}
            </button>
          )}
        </div>
      </div>

      {/* Component List */}
      <div style={listStyles.listContainer} onMouseLeave={handleContainerMouseLeave}>
        {searchTerm && (
          <div style={listStyles.resultsCount}>
            {allComponents.length} {allComponents.length === 1 ? 'result' : 'results'}
          </div>
        )}
        {allComponents.length === 0 ? (
          <div style={listStyles.noResults}>
            {searchTerm.trim() ? (
              <Fragment>
                <div style={{ marginBottom: minimalStyles.spacing[2] }}>
                  no components found for "{searchTerm}"
                </div>
                <div style={{ fontSize: minimalStyles.typography.fontSize.xs, opacity: 0.7 }}>
                  try searching with different keywords
                </div>
              </Fragment>
            ) : (
              "no components available"
            )}
          </div>
        ) : (
          allComponents.map(([name, component]) => {
            const isSelected = selectedComponent === name || optimisticSelection === name;
            const isHovered = hoveredComponent === name;

            // Calculate styles more explicitly to prevent conflicts
            const getItemStyles = () => {
              const baseStyles = listStyles.componentItem;
              
              if (isSelected) {
                // Selected state takes priority over hover
                return {
                  ...baseStyles,
                  ...listStyles.componentItemSelected,
                };
              } else if (isHovered) {
                // Only apply hover if not selected
                return {
                  ...baseStyles,
                  ...listStyles.componentItemHover,
                };
              } else {
                // Default state
                return baseStyles;
              }
            };

            return (
              <div key={name}>
                <div
                  data-component-name={name}
                  style={getItemStyles()}
                  onClick={() => handleComponentClick(name)}
                  onMouseEnter={handleMouseEnter(name)}
                  onMouseLeave={handleMouseLeave}
                >
              <div style={listStyles.componentName}>
                {highlightMatch(name.toLowerCase(), searchTerm)}
              </div>
              {component.type && (
                <div style={listStyles.componentType}>
                  {highlightMatch(component.type.toLowerCase(), searchTerm)}
                </div>
              )}
            </div>
          </div>
        );
          })
        )}
      </div>
    </div>
  );
}