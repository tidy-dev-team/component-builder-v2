import { Container, render, VerticalSpace } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import { components } from "./componentData";
import { useAtom } from "jotai";

import { DropdownComponent } from "./ui_components/Dropdown";
import { CheckboxComponent } from "./ui_components/Checkbox";
import { ButtonComponent } from "./ui_components/Button";
import {
  selectedComponentAtom,
  selectedComponentPropertiesAtom,
  propertyUsedStatesAtom,
} from "./state/atoms";
import { ComponentPropertyInfo } from "./types";
import { shouldBeHidden } from "./ui_utils";

function Plugin() {
  const [selectedComponent] = useAtom(selectedComponentAtom);
  const [componentProps, setComponentProps] = useAtom(
    selectedComponentPropertiesAtom
  );
  const [propertyUsedStates, setPropertyUsedStates] = useAtom(
    propertyUsedStatesAtom
  );

  function handleButtonClick() {
    emit("BUILD", propertyUsedStates);
  }

  useEffect(() => {
    if (selectedComponent) {
      emit("GET_COMPONENT_SET_PROPERTIES", components[selectedComponent]);
    }
  }, [selectedComponent]);

  useEffect(() => {
    const unsubscribe = on(
      "COMPONENT_SET_PROPERTIES",
      (data: ComponentPropertyInfo[]) => {
        console.log("data with path :>> ", data);
        setComponentProps(data);
        const initialUsedStates = data.reduce(
          (acc, prop) => {
            acc[prop.name] = true;
            return acc;
          },
          {} as Record<string, boolean>
        );
        setPropertyUsedStates(initialUsedStates);
      }
    );
    return unsubscribe;
  }, [setComponentProps, setPropertyUsedStates]);

  return (
    <Container
      space="medium"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div>
        <VerticalSpace space="small" />
        <DropdownComponent components={components} />
        <VerticalSpace space="large" />
{(() => {
          const variantProps = componentProps.filter(prop => prop.type === "VARIANT");
          const otherProps = componentProps.filter(prop => prop.type !== "VARIANT");

          // Sort variants alphabetically
          variantProps.sort((a, b) => a.name.localeCompare(b.name));
          
          // Sort other props by path hierarchy (depth first, then by path values)
          otherProps.sort((a, b) => {
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

          return (
            <Fragment>
              {variantProps.length > 0 && (
                <Fragment>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", marginBottom: "8px" }}>
                    Variants
                  </div>
                  {variantProps.filter(prop => !shouldBeHidden(prop)).map((prop) => {
                    return (
                      <div key={prop.name}>
                        <CheckboxComponent {...prop} disabled={false} />
                        <VerticalSpace space="small" />
                      </div>
                    );
                  })}
                  <div style={{ height: "1px", backgroundColor: "#e0e0e0", margin: "12px 0" }} />
                </Fragment>
              )}
{otherProps.filter(prop => !shouldBeHidden(prop)).map((prop) => {
                const depth = prop.path ? prop.path.length : 0;
                const indent = '    '.repeat(Math.max(0, depth - 1)); // First level (depth 1) = 0 spaces, then 4 spaces per level
                const treeSymbol = depth > 0 ? '└─ ' : '';
                
                return (
                  <div key={prop.name} style={{ fontFamily: 'monospace' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        color: '#999', 
                        fontSize: '11px', 
                        marginRight: '4px',
                        whiteSpace: 'pre' // Preserve spaces
                      }}>
                        {indent}{treeSymbol}
                      </span>
                      <div style={{ flex: 1 }}>
                        <CheckboxComponent {...prop} disabled={false} />
                      </div>
                    </div>
                    <VerticalSpace space="small" />
                  </div>
                );
              })}
            </Fragment>
          );
        })()}
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <div>
        <ButtonComponent callback={handleButtonClick} />
        <VerticalSpace space="small" />
      </div>
    </Container>
  );
}

export default render(Plugin);
