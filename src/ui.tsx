import { Container, render, VerticalSpace } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { components } from "./componentData";
import { useAtom } from "jotai";

import { DropdownComponent } from "./ui_components/Dropdown";
import { ButtonComponent } from "./ui_components/Button";
import {
  selectedComponentAtom,
  selectedComponentPropertiesAtom,
  propertyUsedStatesAtom,
} from "./state/atoms";
import { ComponentPropertyInfo, PropertyUsedStates } from "./types";
import { renderAllProperties } from "./ui_elements";

function Plugin() {
  const [selectedComponent] = useAtom(selectedComponentAtom);
  const [componentProps, setComponentProps] = useAtom(
    selectedComponentPropertiesAtom
  );
  const [propertyUsedStates, setPropertyUsedStates] = useAtom(
    propertyUsedStatesAtom
  );

  function handleButtonClick() {
    console.log("propertyUsedStates :>> ", propertyUsedStates);
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
            // Initialize variant options states
            if (prop.type === "VARIANT" && prop.variantOptions) {
              prop.variantOptions.forEach((option) => {
                acc[`${prop.name}#${option}`] = true;
              });
            }
            return acc;
          },
          {} as PropertyUsedStates
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
        {renderAllProperties(componentProps, propertyUsedStates)}
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
