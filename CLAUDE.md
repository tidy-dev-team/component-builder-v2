# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run build` - Build the plugin with typecheck and minification
- `npm run watch` - Watch mode for development with typecheck (recommended during development)

### Installation in Figma
After building, import the generated `manifest.json` file into Figma desktop app via "Import plugin from manifest..." in Quick Actions.

## Architecture Overview

This is a Figma plugin built with Create Figma Plugin framework that generates UI components on the canvas based on user configuration.

### Tech Stack
- **Framework**: Preact for lightweight UI
- **State Management**: Jotai with atomic state pattern
- **Build System**: Create Figma Plugin (@create-figma-plugin/build)
- **Language**: TypeScript with strict typing

### Key Architecture Patterns

#### Dual-Thread Architecture
- `src/main.ts` - Main thread (Figma API operations)
- `src/ui.tsx` - UI thread (interface)
- Communication via EventHandlers (`BuildHandler`, `CloseHandler`)

#### Component Data System
Components are defined in `src/component_data/` and registered in `src/componentData.ts`:
```typescript
// Each component has properties with:
interface ComponentProperty {
  name: string;           // camelCase API name
  displayName: string;    // UI display name  
  value: string | boolean; // default value
  used: boolean;          // whether property is applied
  dependentProperty?: DependentProperty; // dependency relationships
}
```

#### State Management (Jotai Atoms)
- `selectedComponentAtom` - Currently selected component
- `selectedComponentPropertiesAtom` - Properties of selected component  
- `propertyUsedStatesAtom` - Checkbox states for property usage
- `updatedComponentPropertiesAtom` - Computed final component data

### Project Structure
```
src/
├── main.ts                    # Plugin main thread
├── ui.tsx                     # UI entry point
├── types.ts                   # TypeScript interfaces
├── componentData.ts           # Component registry
├── state/atoms.ts             # Jotai state atoms
├── component_data/            # Component definitions
├── figma_components/          # Canvas generation logic
├── ui_components/             # UI components (Button, Checkbox, Dropdown)
└── figma_functions/           # Figma API utilities
```

## Development Workflow

### Adding New Components
1. Create component data file in `src/component_data/` following `checkboxData.ts` pattern
2. Add canvas generation logic in `src/figma_components/`
3. Register component in `src/componentData.ts`
4. Component automatically appears in dropdown

### Component Property Dependencies
Use `dependentProperty` field to show relationships:
- `{kind: "text", name: "propertyName", value: "✏️ propertyName"}` - Editable dependency
- `{kind: "instance swap", name: "propertyName", value: "🔁 propertyName"}` - Reactive dependency

### Canvas Generation
Canvas rendering logic goes in `src/figma_components/` and is triggered via BUILD event handler in main thread.

## Important Notes

- All component properties use camelCase naming for Figma API compatibility
- Property `used` boolean controls whether property is applied to generated component
- State management is atomic - avoid deep cloning, use object spread
- The plugin UI is sized to 320x360 pixels
- Console debugging available via Figma's "Open Console" Quick Action