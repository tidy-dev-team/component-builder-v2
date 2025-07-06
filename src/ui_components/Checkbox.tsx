import { h, JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Checkbox, Text } from "@create-figma-plugin/ui";
import { useAtom } from "jotai";
import {
  selectedComponentPropertiesAtom,
  propertyUsedStatesAtom,
} from "../state/atoms";

interface CheckboxComponentProps {
  propertyKey: string;
}

export function CheckboxComponent({ propertyKey }: CheckboxComponentProps) {
  const [componentProps] = useAtom(selectedComponentPropertiesAtom);
  const [propertyUsedStates, setPropertyUsedStates] = useAtom(propertyUsedStatesAtom);
  const property = componentProps[propertyKey];
  
  const [value, setValue] = useState<boolean>(() => 
    propertyUsedStates[propertyKey] ?? property?.used ?? true
  );

  useEffect(() => {
    if (property && !(propertyKey in propertyUsedStates)) {
      const initialState = property.used;
      setValue(initialState);
      setPropertyUsedStates((prev) => ({
        ...prev,
        [propertyKey]: initialState,
      }));
    }
  }, [property, propertyKey, setPropertyUsedStates]);

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.checked;
    setValue(newValue);
    setPropertyUsedStates((prev) => ({
      ...prev,
      [propertyKey]: newValue,
    }));
  }

  if (!property) {
    return null;
  }

  return (
    <Checkbox onChange={handleChange} value={value}>
      <Text>{property.displayName}</Text>
    </Checkbox>
  );
}
