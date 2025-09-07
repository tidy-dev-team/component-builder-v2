import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import { useAtom } from "jotai";
import { selectedComponentAtom, componentSearchTermAtom } from "../state/atoms";
import { ComponentData } from "../types";
import { sharedStyles, getHoverStyles } from "../ui_styles";

const listStyles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  },
  searchContainer: {
    padding: sharedStyles.spacing.medium,
    backgroundColor: sharedStyles.colors.white,
    position: "relative" as const,
  },
  searchInputWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute" as const,
    left: "12px",
    color: sharedStyles.colors.secondary,
    fontSize: "14px",
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px 8px 36px", // Extra padding for icon
    fontSize: "13px",
    border: `1px solid ${sharedStyles.colors.border}`,
    borderRadius: "6px",
    outline: "none",
    transition: sharedStyles.transitions.fast,
    backgroundColor: sharedStyles.colors.white,
  },
  searchInputFocus: {
    borderColor: sharedStyles.colors.primary,
    boxShadow: `0 0 0 2px rgba(79, 70, 229, 0.1)`,
  },
  listContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: sharedStyles.spacing.medium,
  },
  componentItem: {
    padding: "16px 12px",
    marginBottom: sharedStyles.spacing.small,
    borderRadius: "4px",
    cursor: "pointer",
    transition: sharedStyles.transitions.fast,
    fontSize: sharedStyles.text.primary.fontSize,
    color: sharedStyles.text.primary.color,
    border: `1px solid ${sharedStyles.colors.border}`,
    backgroundColor: sharedStyles.colors.white,
    textAlign: "left" as const,
  },
  componentName: {
    fontWeight: sharedStyles.text.primary.fontWeight,
    color: "inherit",
  },
  componentType: {
    fontSize: "11px",
    color: sharedStyles.colors.secondary,
    marginTop: "4px",
  },
  resultsCount: {
    padding: `0 ${sharedStyles.spacing.medium} ${sharedStyles.spacing.small} ${sharedStyles.spacing.medium}`,
    fontSize: "11px",
    color: sharedStyles.colors.secondary,
    textAlign: "center" as const,
  },
  noResults: {
    padding: sharedStyles.spacing.xlarge,
    textAlign: "center" as const,
    color: sharedStyles.colors.secondary,
    fontSize: sharedStyles.text.secondary.fontSize,
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
        <span key={index} style={{ backgroundColor: '#fef3c7', fontWeight: '600' }}>
          {part}
        </span>
      ) : part
    );
  };

  const handleComponentClick = (componentName: string) => {
    setSelectedComponent(componentName);
  };

  const handleSearchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setSearchTerm(target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div style={listStyles.container}>
      {/* Search Input */}
      <div style={listStyles.searchContainer}>
        <div style={listStyles.searchInputWrapper}>
          <span style={listStyles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search components..."
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
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                color: sharedStyles.colors.secondary,
                padding: "4px",
                lineHeight: "1",
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Component List */}
      <div style={listStyles.listContainer}>
        {searchTerm && (
          <div style={listStyles.resultsCount}>
            {allComponents.length} {allComponents.length === 1 ? 'result' : 'results'}
          </div>
        )}
        {allComponents.length === 0 ? (
          <div style={listStyles.noResults}>
            {searchTerm.trim() ? (
              <Fragment>
                <div style={{ marginBottom: sharedStyles.spacing.small }}>
                  No components found for "{searchTerm}"
                </div>
                <div style={{ fontSize: "11px", opacity: 0.7 }}>
                  Try searching with different keywords
                </div>
              </Fragment>
            ) : (
              "No components available"
            )}
          </div>
        ) : (
          allComponents.map(([name, component]) => {
            const isSelected = selectedComponent === name;
            const isHovered = hoveredComponent === name;

            const itemStyle = {
              ...listStyles.componentItem,
              ...getHoverStyles(isHovered, isSelected),
            };

            return (
              <div key={name}>
                <div
                  style={itemStyle}
                  onClick={() => handleComponentClick(name)}
                  onMouseEnter={() => setHoveredComponent(name)}
                  onMouseLeave={() => setHoveredComponent(null)}
                >
              <div style={listStyles.componentName}>
                {highlightMatch(name, searchTerm)}
              </div>
              {component.type && (
                <div
                  style={{
                    ...listStyles.componentType,
                    color: isSelected ? "#e0e7ff" : sharedStyles.colors.secondary,
                  }}
                >
                  {highlightMatch(component.type, searchTerm)}
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