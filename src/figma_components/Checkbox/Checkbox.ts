import { getPlaceholderIcon } from "./getPlaceholderIcon";
import { addNewBooleanProperty } from "../../figma_functions/utils";
import { ComponentProperties } from "../../types";
import { createCheckboxSquare } from "./createCheckboxElementSquare";
import { computeMaximumBounds } from "@create-figma-plugin/utilities";

export const VARIANTS = {
  size: ["s", "m"] as const,
  state: ["idle", "hover", "pressed", "focused", "disabled"] as const,
  selectionType: ["unchecked", "checked", "indeterminate"] as const,
} as const;

export type VariantKeys = keyof typeof VARIANTS;
export type VariantValues<K extends VariantKeys> = (typeof VARIANTS)[K][number];
export type SizeVariant = VariantValues<"size">;
export type StateVariant = VariantValues<"state">;
export type SelectionTypeVariant = VariantValues<"selectionType">;

export const CHECKBOX_CONFIG = {
  SIZES: { s: 16, m: 20 } as const,
  SPACING: { item: 4 },
  CORNER_RADIUS: 4,
  STROKE_WEIGHT: 1,
  ICON_SCALE: 0.8,
  COLORS: {
    background: { r: 0.988, g: 0.992, b: 1 },
    border: { r: 0.792, g: 0.816, b: 0.871 },
    shadow: { r: 0.082, g: 0.114, b: 0.2, a: 0.06 },
    text: {
      primary: { r: 0.133, g: 0.153, b: 0.2 },
      secondary: { r: 0.384, g: 0.416, b: 0.502 },
    },
  },
  TYPOGRAPHY: {
    family: "Inter",
    styles: { medium: "Medium", regular: "Regular" },
  },
} as const;

interface TextConfig {
  name: string;
  value: string;
  font: { family: string; style: string };
  fontSize: number;
  color: { r: number; g: number; b: number };
  opacity?: number;
  lineHeight: number;
  letterSpacing?: number;
}

type TextType = "label" | "count";

interface CheckboxSize {
  size: number;
  isSmall: boolean;
}

async function createStyledText(config: TextConfig): Promise<TextNode> {
  await figma.loadFontAsync(config.font);
  const text = figma.createText();
  text.name = config.name;
  text.fontName = config.font;
  text.characters = config.value;
  text.fontSize = config.fontSize;
  text.fills = [{ type: "SOLID", color: config.color }];
  text.opacity = config.opacity || 1;
  text.lineHeight = { unit: "PIXELS", value: config.lineHeight };
  text.letterSpacing = { unit: "PERCENT", value: config.letterSpacing || 0 };
  return text;
}

function getTextConfig(
  type: TextType,
  value: string,
  { size, isSmall }: CheckboxSize
): TextConfig {
  const configs = {
    label: {
      name: "Label",
      font: {
        family: CHECKBOX_CONFIG.TYPOGRAPHY.family,
        style: CHECKBOX_CONFIG.TYPOGRAPHY.styles.regular,
      },
      fontSize: isSmall ? 14 : 16,
      color: CHECKBOX_CONFIG.COLORS.text.primary,
      lineHeight: isSmall ? 18 : 20,
    },
    count: {
      name: "Count",
      font: {
        family: CHECKBOX_CONFIG.TYPOGRAPHY.family,
        style: CHECKBOX_CONFIG.TYPOGRAPHY.styles.regular,
      },
      fontSize: isSmall ? 14 : 16,
      color: CHECKBOX_CONFIG.COLORS.text.secondary,
      lineHeight: isSmall ? 14 : 16,
    },
  } as const;
  return { ...configs[type], value };
}

function createCheckboxComponent(sizeVariant: SizeVariant): ComponentNode {
  const checkboxFrame = figma.createComponent();
  checkboxFrame.name = `Size=${sizeVariant}`;
  checkboxFrame.layoutMode = "HORIZONTAL";
  checkboxFrame.itemSpacing = CHECKBOX_CONFIG.SPACING.item;
  checkboxFrame.primaryAxisSizingMode = "AUTO";
  checkboxFrame.counterAxisSizingMode = "AUTO";
  checkboxFrame.counterAxisAlignItems = "CENTER"; // Center align all children
  checkboxFrame.paddingLeft = 0;
  checkboxFrame.paddingRight = 0;
  checkboxFrame.paddingTop = 0;
  checkboxFrame.paddingBottom = 0;
  checkboxFrame.fills = [];
  return checkboxFrame;
}

function getCheckboxSize(sizeVariant: SizeVariant): CheckboxSize {
  const size = CHECKBOX_CONFIG.SIZES[sizeVariant];
  return {
    size,
    isSmall: sizeVariant === "s",
  };
}

async function createCheckboxVariant(
  sizeVariant: SizeVariant,
  properties: ComponentProperties
): Promise<ComponentNode> {
  const checkboxFrame = createCheckboxComponent(sizeVariant);
  const checkboxSize = getCheckboxSize(sizeVariant);

  // Add checkbox square as direct child
  const checkboxSquare = createCheckboxSquare(checkboxSize.size);
  checkboxFrame.appendChild(checkboxSquare);

  // Add icon as direct child if needed
  if (properties.icon?.used) {
    const icon = getPlaceholderIcon();
    const iconNode = figma.createNodeFromSvg(icon);
    iconNode.name = "Icon";
    const iconSize = checkboxSize.size * CHECKBOX_CONFIG.ICON_SCALE;
    iconNode.resize(iconSize, iconSize);
    iconNode.visible = true; // Visible by default
    checkboxFrame.appendChild(iconNode);
    addNewBooleanProperty(checkboxFrame, iconNode, "icon", true);
  }

  // Add label as direct child if needed
  if (properties.label?.used) {
    const labelText = await createStyledText(
      getTextConfig(
        "label",
        properties.label?.value?.toString() || "Checkbox",
        checkboxSize
      )
    );
    checkboxFrame.appendChild(labelText);
    addNewBooleanProperty(checkboxFrame, labelText, "label", true);
  }

  // Add count as direct child if needed
  if (properties.count?.used) {
    const countText = await createStyledText(
      getTextConfig(
        "count",
        `(${properties.count?.value?.toString()})` || "(0)",
        checkboxSize
      )
    );
    checkboxFrame.appendChild(countText);
    addNewBooleanProperty(checkboxFrame, countText, "count", true);
  }

  return checkboxFrame;
}

export async function buildCheckboxOnCanvas(
  properties: ComponentProperties
): Promise<void> {
  // Create all size variants from VARIANTS.size
  const sizeVariants = VARIANTS.size;
  const variantNodes: ComponentNode[] = [];

  for (const sizeVariant of sizeVariants) {
    const variantNode = await createCheckboxVariant(sizeVariant, properties);
    variantNodes.push(variantNode);
  }

  // Add variants to component set
  const componentSet = figma.combineAsVariants(variantNodes, figma.currentPage);
  componentSet.name = "Checkbox";

  // Optionally, compute bounds and resize if needed
  const [min, max] = computeMaximumBounds(componentSet.children as SceneNode[]);
  console.log("Computed bounds:", { min, max });
  componentSet.resize(max.x - min.x, max.y - min.y);

  // Add to page and center
  figma.currentPage.appendChild(componentSet);
  figma.viewport.scrollAndZoomIntoView([componentSet]);

  console.log("Checkbox component set built with properties:", properties);
}
