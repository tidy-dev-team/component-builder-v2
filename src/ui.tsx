import { Container, render, VerticalSpace } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
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
  ); // Get the setter for used states

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
        setComponentProps(data);
        // Create an object with all property names set to true
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
  }, [setComponentProps, setPropertyUsedStates]); // Add setters to dependency array

  return (
    <Container
      space="medium"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div>
        <VerticalSpace space="small" />
        <DropdownComponent components={components} />
        <VerticalSpace space="large" />
        {componentProps.map((prop) => {
          const isDisabled = shouldBeHidden(prop);
          return (
            <div key={prop.name}>
              <CheckboxComponent {...prop} disabled={isDisabled} />
              <VerticalSpace space="small" />
            </div>
          );
        })}
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
