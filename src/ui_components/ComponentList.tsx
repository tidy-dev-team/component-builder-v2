import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useAtom } from "jotai";
import { selectedComponentAtom, componentSearchTermAtom } from "../state/atoms";
import { ComponentData } from "../types";
import { minimalStyles, symbols } from "../ui_styles_minimal";

// Simple debounce function
const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): T => {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

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
    borderColor: minimalStyles.colors.gray200,
  },
  componentItemSelected: {
    backgroundColor: minimalStyles.colors.gray900,
    color: minimalStyles.colors.white,
    borderColor: minimalStyles.colors.gray900,
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

  // Window-level mouse move handler to detect when mouse leaves the component area
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      // If we have a hovered component but mouse is moving outside our bounds, clear it
      if (hoveredComponent) {
        const component = document.querySelector(`[data-component-name="${hoveredComponent}"]`);
        if (component) {
          const rect = component.getBoundingClientRect();
          const x = e.clientX;
          const y = e.clientY;
          
          // Check if mouse is far away from the hovered component
          const buffer = 50; // pixels
          if (x < rect.left - buffer || x > rect.right + buffer || 
              y < rect.top - buffer || y > rect.bottom + buffer) {
            setHoveredComponent(null);
          }
        }
      }
    };

    // Add a small delay to prevent excessive checks
    const debouncedHandler = debounce(handleWindowMouseMove, 100);
    
    window.addEventListener('mousemove', debouncedHandler);
    
    return () => {
      window.removeEventListener('mousemove', debouncedHandler);
    };
  }, [hoveredComponent]);

  // Global mouse leave handler for the list container
  const handleContainerMouseLeave = (e: Event) => {
    // Check if the mouse actually left the container (not just moved to a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e as MouseEvent).clientX;
    const y = (e as MouseEvent).clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setHoveredComponent(null);
    }
  };

  // Filter components based on search term
  const allComponents = Object.entries(components).filter(
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

  // Function to highlight search matches in text
  const highlightMatch = (text: string, searchTerm: string) => {
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
  };

  const handleComponentClick = (componentName: string) => {
    setSelectedComponent(componentName);
    // Clear hover state when clicking to prevent sticking
    setHoveredComponent(null);
  };

  const handleSearchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setSearchTerm(target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    // Clear hover state when clearing search
    setHoveredComponent(null);
  };

  // More robust hover handlers with error boundaries
  const handleMouseEnter = (componentName: string) => (e: Event) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      setHoveredComponent(componentName);
    } catch (error) {
      console.warn('Mouse enter error:', error);
      setHoveredComponent(null);
    }
  };

  const handleMouseLeave = () => (e: Event) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      setHoveredComponent(null);
    } catch (error) {
      console.warn('Mouse leave error:', error);
      setHoveredComponent(null);
    }
  };

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
            const isSelected = selectedComponent === name;
            const isHovered = hoveredComponent === name;

            return (
              <div key={name}>
                <div
                  data-component-name={name}
                  style={{
                    ...listStyles.componentItem,
                    ...(isHovered ? listStyles.componentItemHover : {}),
                    ...(isSelected ? listStyles.componentItemSelected : {}),
                  }}
                  onClick={() => handleComponentClick(name)}
                  onMouseEnter={handleMouseEnter(name)}
                  onMouseLeave={handleMouseLeave()}
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