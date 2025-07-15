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
          const sortedProps = componentProps.sort((a, b) => {
            // Show VARIANT properties first
            if (a.type === "VARIANT" && b.type !== "VARIANT") return -1;
            if (a.type !== "VARIANT" && b.type === "VARIANT") return 1;
            // Then sort alphabetically within each group
            return a.name.localeCompare(b.name);
          });

          const variantProps = sortedProps.filter(prop => prop.type === "VARIANT");
          const otherProps = sortedProps.filter(prop => prop.type !== "VARIANT");

          return (
            <Fragment>
              {variantProps.length > 0 && (
                <Fragment>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#666", marginBottom: "8px" }}>
                    Variants
                  </div>
                  {variantProps.map((prop) => {
                    const isDisabled = shouldBeHidden(prop);
                    return (
                      <div key={prop.name}>
                        <CheckboxComponent {...prop} disabled={isDisabled} />
                        <VerticalSpace space="small" />
                      </div>
                    );
                  })}
                  <div style={{ height: "1px", backgroundColor: "#e0e0e0", margin: "12px 0" }} />
                </Fragment>
              )}
              {otherProps.map((prop) => {
                const isDisabled = shouldBeHidden(prop);
                return (
                  <div key={prop.name}>
                    <CheckboxComponent {...prop} disabled={isDisabled} />
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
