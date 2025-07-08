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
  propertyUsedStatesAtom, // Import the new atom
} from "./state/atoms";
import { ComponentPropertyInfo } from "./types";
import { shouldBeHidden } from "./ui_utils";

function Plugin() {
  const [selectedComponent] = useAtom(selectedComponentAtom);
  const [componentProps, setComponentProps] = useAtom(
    selectedComponentPropertiesAtom
  );
  const [propertyUsedStates] = useAtom(propertyUsedStatesAtom); // Get the checked states

  function handleButtonClick() {
    const buildData = Object.entries(propertyUsedStates)
      .filter(([, isUsed]) => isUsed)
      .map(([name]) => name);

    emit("BUILD", buildData);
  }

  useEffect(() => {
    if (selectedComponent) {
      emit("GET_COMPONENT_SET_PROPERTIES", components[selectedComponent]);
    }
  }, [selectedComponent]);

  useEffect(() => {
    const unsubscribe = on("COMPONENT_SET_PROPERTIES", (data) => {
      setComponentProps(data);
    });
    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   if (componentProps) {
  //     for (const prop of componentProps) console.log(getCleanName(prop));
  //   }
  // }, [componentProps]);

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
