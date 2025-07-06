import { Button } from "@create-figma-plugin/ui";
import { h, JSX } from "preact";

interface ButtonComponentProps {
  callback: () => void;
}

export function ButtonComponent({
  callback,
}: ButtonComponentProps): JSX.Element {
  return (
    <Button fullWidth onClick={callback} style={{ height: "32px" }}>
      Build on canvas
    </Button>
  );
}
