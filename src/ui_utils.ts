import { ComponentPropertyInfo } from "./types";

export function getCleanName(prop: ComponentPropertyInfo): string {
  const [cleanName] = prop.name.split("#");
  return cleanName;
}

export function shouldBeHidden(prop: ComponentPropertyInfo): boolean {
  const hiddenProps = ["type", "state"];
  const hiddenPrefixes = ["🔁", "✏️"];

  if (hiddenProps.includes(prop.name)) {
    return true;
  }

  if (hiddenPrefixes.some((prefix) => prop.name.startsWith(prefix))) {
    return true;
  }

  return false;
}
