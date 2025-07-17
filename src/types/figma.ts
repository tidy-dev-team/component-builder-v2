// Extended Figma types for better type safety

export interface ComponentPropertyReferences {
  [key: string]: string;
}

// Type for property reference fields
export type PropertyReferenceField = 'characters' | 'visible' | 'mainComponent' | 'fills' | 'strokes';

// Type for component property references with specific fields
export interface TypedPropertyReferences {
  characters?: string;
  visible?: string;
  mainComponent?: string;
  fills?: string;
  strokes?: string;
}

// Utility type for safer property reference access
export type PropertyReferenceValue = string | undefined;

// Type for the property reference assignment
export interface PropertyReferenceAssignment {
  [property: string]: string;
}