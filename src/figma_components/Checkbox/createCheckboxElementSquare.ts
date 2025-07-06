import { CHECKBOX_CONFIG } from "./Checkbox";

export function createCheckboxSquare(size: number): RectangleNode {
  const checkboxSquare = figma.createRectangle();
  checkboxSquare.name = "Checkbox Square";
  checkboxSquare.resize(size, size);
  checkboxSquare.cornerRadius = CHECKBOX_CONFIG.CORNER_RADIUS;
  checkboxSquare.fills = [
    { type: "SOLID", color: CHECKBOX_CONFIG.COLORS.background },
  ];
  checkboxSquare.strokes = [
    { type: "SOLID", color: CHECKBOX_CONFIG.COLORS.border },
  ];
  checkboxSquare.strokeWeight = CHECKBOX_CONFIG.STROKE_WEIGHT;
  checkboxSquare.effects = [
    {
      type: "DROP_SHADOW",
      color: CHECKBOX_CONFIG.COLORS.shadow,
      offset: { x: 0, y: 1 },
      radius: 2,
      visible: true,
      blendMode: "NORMAL",
    },
  ];
  return checkboxSquare;
}
