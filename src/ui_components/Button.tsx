import { Button } from "@create-figma-plugin/ui";
import { h, JSX } from "preact";
import { ButtonComponentProps } from "../types";

export function ButtonComponent({
  callback,
}: ButtonComponentProps): JSX.Element {
  return (
    <Button fullWidth onClick={callback} style={{ height: "32px" }}>
      Build on canvas
    </Button>
  );
}
