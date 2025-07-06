import { Container, render, VerticalSpace } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect } from "preact/hooks";
import { components } from "./componentData";
import { useAtom } from "jotai";

import { DropdownComponent } from "./ui_components/Dropdown";
import { CheckboxComponent } from "./ui_components/Checkbox";
import { ButtonComponent } from "./ui_components/Button";
import {
  selectedComponentAtom,
  selectedComponentPropertiesAtom,
  // updatedComponentPropertiesAtom,
} from "./state/atoms";

function Plugin() {
  const [selectedComponent] = useAtom(selectedComponentAtom);
  const [componentProps] = useAtom(selectedComponentPropertiesAtom);
  // const [updatedComponentProps] = useAtom(updatedComponentPropertiesAtom);

  const propertyKeys = Object.keys(componentProps);

  function handleButtonClick() {
    // emit("BUILD", updatedComponentProps);
  }

  useEffect(() => {
    if (selectedComponent) {
      emit("GET_COMPONENT_PROPERTIES", components[selectedComponent]);
    }
  }, [selectedComponent]);

  return (
    <Container
      space="medium"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div>
        <VerticalSpace space="small" />
        <DropdownComponent components={components} />
        <VerticalSpace space="large" />
        {/* {propertyKeys.map((propertyKey) => (
          <div key={propertyKey}>
            <CheckboxComponent propertyKey={propertyKey} />
            <VerticalSpace space="small" />
          </div>
        ))} */}
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
