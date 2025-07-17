# Component Data System

## Overview

The plugin uses a **pure generic component system** that works with any Figma component. All components use the same property types and are handled by a single generic generator.

## How It Works

1. **Single Generic Generator**: `generateGenericComponent()` handles ALL components
2. **Dynamic Properties**: Properties are discovered automatically from Figma components  
3. **Minimal Configuration**: Only need component name, key, and type
4. **Universal Compatibility**: Works with any component that has standard Figma properties

## Adding New Components

Super simple - just add the component key:

```typescript
// Add to the componentRegistry in index.ts
"MyNewComponent": {
  name: "My New Component",
  key: "abcdef1234567890abcdef1234567890abcdef12", // Your Figma component key
  type: "componentSet"
}
```

Or register dynamically:
```typescript
import { registerComponent } from "./component_data";

registerComponent("MyNewComponent", {
  name: "My New Component", 
  key: "abcdef1234567890abcdef1234567890abcdef12",
  type: "componentSet"
});
```

## Property Types Supported

All components automatically support these standard Figma property types:

- **Variant Properties**: `buttonType#primary`, `size#large`, `state#hover`
- **Boolean Properties**: `disabled`, `selected`, `hasIcon`, `isVisible`
- **Text Properties**: `label`, `placeholder`, `description`
- **Instance Swap**: `icon`, `avatar`, `illustration`

## Benefits

- ✅ **Ultra Simple**: Just provide component key, everything else is automatic
- ✅ **Zero Code**: No custom generators needed
- ✅ **Auto-Discovery**: Properties discovered from Figma automatically
- ✅ **Scales Infinitely**: Add hundreds of components with minimal effort
- ✅ **Consistent**: Identical behavior across all components

## File Structure

```
component_data/
├── index.ts          # Component registry (just keys and names)
└── README.md         # This file

figma_components/
├── genericGenerator.ts  # Single generator for all components
└── index.ts            # Exports
```

No component-specific files needed!