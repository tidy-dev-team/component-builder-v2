import { VerticalSpace } from "@create-figma-plugin/ui";
import { h, Fragment } from "preact";
import { ComponentPropertyInfo, PropertyUsedStates } from "./types";
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
  propertyUsedStates: PropertyUsedStates
) {
  if (variantProps.length === 0) return null;

  return (
    <Fragment>
      <div
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            color: "#7C3AED",
            fontSize: "14px",
          }}
        >
          ⚡
        </span>
        Variants
      </div>
      <div
        style={{
          background: "transparent",
          border: "1px solid #e8eaed",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "16px",
        }}
      >
        {variantProps
          .filter(
            (prop) => !shouldBeHidden(prop) && prop.name in propertyUsedStates
          )
          .map((prop, index) => {
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
                  <div
                    style={{
                      marginLeft: "20px",
                      paddingLeft: "12px",
                      borderLeft: "2px solid #e8eaed",
                    }}
                  >
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
                            disabled={
                              !propertyUsedStates[prop.name] ||
                              !(variantOptionKey in propertyUsedStates)
                            }
                            allProperties={componentProps}
                          />
                          <VerticalSpace space="small" />
                        </div>
                      );
                    })}
                  </div>
                )}
                {index <
                  variantProps.filter((p) => !shouldBeHidden(p)).length - 1 && (
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#e8eaed",
                      margin: "8px 0",
                    }}
                  />
                )}
              </div>
            );
          })}
      </div>
    </Fragment>
  );
}
function renderOtherProperties(
  otherProps: ComponentPropertyInfo[],
  componentProps: ComponentPropertyInfo[],
  propertyUsedStates: PropertyUsedStates
) {
  if (otherProps.length === 0) return null;

  return (
    <Fragment>
      <div
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            color: "#059669",
            fontSize: "14px",
          }}
        >
          ⚙️
        </span>
        Properties
      </div>
      <div
        style={{
          background: "transparent",
          border: "1px solid #e8eaed",
          borderRadius: "8px",
          padding: "12px",
        }}
      >
        {otherProps
          .filter(
            (prop) => !shouldBeHidden(prop) && prop.name in propertyUsedStates
          )
          .map((prop, index) => {
            const depth = prop.path ? prop.path.length : 0;
            const indent = "    ".repeat(Math.max(0, depth - 1));
            const treeSymbol = depth > 0 ? "└─ " : "";

            // Check if this property should be disabled due to parent being unchecked
            const isDisabled = isChildDisabledByParent(
              prop,
              componentProps,
              propertyUsedStates
            );

            return (
              <div key={prop.name}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "2px 0",
                    borderRadius: "4px",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "11px",
                      marginRight: "6px",
                      whiteSpace: "pre",
                      fontFamily: "SF Mono, Monaco, monospace",
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
          })}
      </div>
    </Fragment>
  );
}
function renderNestedComponents(
  nestedInstances: { name: string; id: string; key: string }[]
) {
  if (nestedInstances.length === 0) return null;

  return (
    <Fragment>
      <div
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "12px",
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            color: "#DC2626",
            fontSize: "14px",
          }}
        >
          🔗
        </span>
        Nested Components
      </div>
      <div
        style={{
          background: "transparent",
          border: "1px solid #e8eaed",
          borderRadius: "8px",
          padding: "12px",
        }}
      >
        {nestedInstances.map((instance, index) => (
          <div key={instance.id}>
            <div
              style={{
                padding: "8px 12px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "SF Mono, Monaco, monospace",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                }}
              >
                •
              </span>
              {instance.name}
            </div>
            {index < nestedInstances.length - 1 && (
              <div
                style={{
                  height: "8px",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </Fragment>
  );
}

export function renderAllProperties(
  componentProps: ComponentPropertyInfo[],
  propertyUsedStates: PropertyUsedStates,
  nestedInstances?: { name: string; id: string; key: string }[]
) {
  console.log("🎨 renderAllProperties called with:", {
    componentPropsCount: componentProps.length,
    propertyUsedStatesKeys: Object.keys(propertyUsedStates),
    propertyUsedStatesValues: propertyUsedStates,
  });

  // Filter out properties that don't exist in propertyUsedStates to prevent invalid value errors
  const validProps = componentProps.filter((prop) => {
    if (!prop || !prop.name) {
      console.log("❌ Filtering out invalid property:", prop);
      return false;
    }
    if (!(prop.name in propertyUsedStates)) {
      console.error(
        `🚨 CRITICAL: Property ${prop.name} not found in propertyUsedStates!`
      );
      console.error(`🚨 Available keys:`, Object.keys(propertyUsedStates));
      console.error(`🚨 Property details:`, prop);
      return false;
    }
    console.log(`✅ Rendering property: ${prop.name} (${prop.type})`);
    return true;
  });

  console.log(
    `📊 After filtering: ${validProps.length} valid properties out of ${componentProps.length}`
  );

  const variantProps = validProps.filter((prop) => prop.type === "VARIANT");
  const otherProps = validProps.filter((prop) => prop.type !== "VARIANT");

  // Sort variants alphabetically
  variantProps.sort((a, b) => a.name.localeCompare(b.name));

  // Sort other props by path hierarchy (depth first, then by path values)
  const sortedOtherProps = sortPropertiesByPath(otherProps);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
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
      {nestedInstances && renderNestedComponents(nestedInstances)}
    </div>
  );
}
