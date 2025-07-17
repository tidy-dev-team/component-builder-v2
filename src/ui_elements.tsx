import { VerticalSpace } from "@create-figma-plugin/ui";
import { h, Fragment } from "preact";
import { ComponentPropertyInfo } from "./types";
import { CheckboxComponent } from "./ui_components/Checkbox";
import { shouldBeHidden, isChildDisabledByParent } from "./ui_utils";

function sortPropertiesByPath(
  props: ComponentPropertyInfo[]
): ComponentPropertyInfo[] {
  return props.sort((a, b) => {
    const pathA = a.path || [];
    const pathB = b.path || [];

    // Compare path arrays element by element
    for (let i = 0; i < Math.max(pathA.length, pathB.length); i++) {
      const valueA = pathA[i] !== undefined ? pathA[i] : -1;
      const valueB = pathB[i] !== undefined ? pathB[i] : -1;

      if (valueA !== valueB) {
        return valueA - valueB;
      }
    }

    // If paths are equal, sort by name
    return a.name.localeCompare(b.name);
  });
}
function renderVariantProperties(
  variantProps: ComponentPropertyInfo[],
  componentProps: ComponentPropertyInfo[],
  propertyUsedStates: Record<string, boolean>
) {
  if (variantProps.length === 0) return null;

  return (
    <Fragment>
      <div
        style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#666",
          marginBottom: "8px",
        }}
      >
        Variants
      </div>
      {variantProps
        .filter((prop) => !shouldBeHidden(prop))
        .map((prop) => {
          return (
            <div key={prop.name}>
              <CheckboxComponent
                {...prop}
                disabled={false}
                allProperties={componentProps}
              />
              <VerticalSpace space="small" />
              {/* Show variant options as sub-properties */}
              {prop.variantOptions && prop.variantOptions.length > 0 && (
                <div style={{ marginLeft: "20px" }}>
                  {prop.variantOptions.map((option) => {
                    const variantOptionKey = `${prop.name}#${option}`;
                    const variantOptionProp: ComponentPropertyInfo = {
                      name: variantOptionKey,
                      type: prop.type,
                      defaultValue: option,
                      path: prop.path,
                    };
                    return (
                      <div key={variantOptionKey}>
                        <CheckboxComponent
                          {...variantOptionProp}
                          disabled={!propertyUsedStates[prop.name]}
                          allProperties={componentProps}
                        />
                        <VerticalSpace space="small" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      <div
        style={{
          height: "1px",
          backgroundColor: "#e0e0e0",
          margin: "12px 0",
        }}
      />
    </Fragment>
  );
}
function renderOtherProperties(
  otherProps: ComponentPropertyInfo[],
  componentProps: ComponentPropertyInfo[],
  propertyUsedStates: Record<string, boolean>
) {
  return otherProps
    .filter((prop) => !shouldBeHidden(prop))
    .map((prop) => {
      const depth = prop.path ? prop.path.length : 0;
      const indent = "    ".repeat(Math.max(0, depth - 1)); // First level (depth 1) = 0 spaces, then 4 spaces per level
      const treeSymbol = depth > 0 ? "└─ " : "";

      // Check if this property should be disabled due to parent being unchecked
      const isDisabled = isChildDisabledByParent(
        prop,
        componentProps,
        propertyUsedStates
      );

      return (
        <div key={prop.name} style={{ fontFamily: "monospace" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                color: "#999",
                fontSize: "11px",
                marginRight: "4px",
                whiteSpace: "pre", // Preserve spaces
              }}
            >
              {indent}
              {treeSymbol}
            </span>
            <div style={{ flex: 1 }}>
              <CheckboxComponent
                {...prop}
                disabled={isDisabled}
                allProperties={componentProps}
              />
            </div>
          </div>
          <VerticalSpace space="small" />
        </div>
      );
    });
}
export function renderAllProperties(
  componentProps: ComponentPropertyInfo[],
  propertyUsedStates: Record<string, boolean>
) {
  const variantProps = componentProps.filter((prop) => prop.type === "VARIANT");
  const otherProps = componentProps.filter((prop) => prop.type !== "VARIANT");

  // Sort variants alphabetically
  variantProps.sort((a, b) => a.name.localeCompare(b.name));

  // Sort other props by path hierarchy (depth first, then by path values)
  const sortedOtherProps = sortPropertiesByPath(otherProps);

  return (
    <Fragment>
      {renderVariantProperties(
        variantProps,
        componentProps,
        propertyUsedStates
      )}
      {renderOtherProperties(
        sortedOtherProps,
        componentProps,
        propertyUsedStates
      )}
    </Fragment>
  );
}
