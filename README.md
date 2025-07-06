# Component Builder Test (CBT)

A Figma plugin for building custom components with configurable properties. This plugin allows designers to select component types, configure their properties through an intuitive UI, and generate them directly on the Figma canvas.

## Status: In Development 🚧

**Current Implementation:** UI Configuration Phase
- ✅ Component selection dropdown
- ✅ Property configuration with checkboxes
- ✅ Property usage tracking (`used` property)
- ✅ Dependency mapping with visual indicators
- ✅ State management with Jotai
- ⏳ Canvas rendering (planned)

**Next Phase:** Canvas Generation
- Build selected components on Figma canvas based on UI configurations
- Apply property values and variants using API-ready camelCase names
- Position and style components automatically

## Features

### Currently Available
- **Component Selection**: Choose from available component templates via dropdown
- **Property Configuration**: Toggle component properties using intuitive checkboxes
- **Usage Tracking**: Control which properties are "used" through checkbox interactions
- **Dependency Visualization**: Visual indicators showing property dependencies (✏️, 🔁)
- **State Management**: Persistent property states across component selections
- **Type Safety**: Full TypeScript support with proper interfaces
- **API-Ready Names**: CamelCase property names for Figma plugin API integration

### Planned Features
- **Canvas Rendering**: Generate actual Figma components based on selections
- **Property Application**: Apply configured values to generated components using dependency mapping
- **Variant Support**: Handle component variants and states
- **Batch Generation**: Create multiple component instances

## Architecture

Built with modern web technologies:
- **Framework**: [Preact](https://preactjs.com/) for lightweight UI components
- **State Management**: [Jotai](https://jotai.org/) for atomic state management
- **Build System**: [Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/)
- **Language**: TypeScript for type safety
- **UI Components**: Figma's official UI library

### Project Structure
```
src/
├── main.ts              # Plugin main thread (Figma API)
├── ui.tsx              # UI thread entry point
├── types.ts            # TypeScript interfaces
├── componentData.ts    # Component registry
├── state/
│   └── atoms.ts        # Jotai state atoms
├── componentData/
│   └── checkboxData.ts # Checkbox component definition
└── ui components/
    ├── Button.tsx      # Build button component
    ├── Checkbox.tsx    # Property checkbox component
    └── Dropdown.tsx    # Component selector dropdown
```

## Development Guide

*This plugin is built with [Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/).*

### Prerequisites

- [Node.js](https://nodejs.org) – v18 or higher
- [Figma desktop app](https://figma.com/downloads/)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Workflow

**Build the plugin:**
```bash
npm run build
```

**Watch for changes during development:**
```bash
npm run watch
```

This generates:
- `manifest.json` - Plugin manifest file
- `build/` - Compiled JavaScript bundles

### Install in Figma

1. Open Figma desktop app
2. Open any Figma document
3. Search for "Import plugin from manifest…" in Quick Actions
4. Select the generated `manifest.json` file

### Debugging

- Use `console.log` statements in your code
- Open developer console: Search "Open Console" in Quick Actions
- Check both main thread and UI thread consoles

## Usage

1. **Select Component**: Choose a component type from the dropdown
2. **Configure Properties**: Toggle checkboxes to mark properties as "used" or "unused"
3. **Build Component**: Click "Build on canvas" (currently logs configuration to console)

### Currently Supported Components

- **Checkbox**: Configurable size, label, count, description, icon, and indeterminate state

## Contributing

### Adding New Components

1. Create component data in `src/componentData/` following the pattern in `checkboxData.ts`
2. Register component in `src/componentData.ts`
3. Component will automatically appear in the dropdown

### Component Data Structure
```typescript
interface ComponentProperty {
  name: string              // camelCase API name (e.g., "isIndeterminate")
  displayName: string       // UI display name (e.g., "Is Indeterminate")
  value: string | boolean   // Default value
  used: boolean            // Whether property is used by default
  dependentProperty?: string // Dependency indicator (e.g., "✏️ isIndeterminate")
  variants?: string[]      // Available variants
}
```

### Property Types
- **name**: CamelCase identifier used for Figma API calls
- **displayName**: Human-readable label shown in UI
- **used**: Boolean indicating if property should be applied to component
- **dependentProperty**: Visual indicator showing dependency relationships:
  - `✏️ propertyName` - Editable/configurable property
  - `🔁 propertyName` - Reactive/dependent property

## Roadmap

### Phase 1: UI Foundation ✅
- [x] Component selection interface
- [x] Property configuration system
- [x] Usage tracking with checkboxes
- [x] Dependency mapping system
- [x] State management optimization
- [x] Type safety improvements

### Phase 2: Canvas Integration (Next)
- [ ] Implement canvas component generation using Figma API
- [ ] Apply property values to generated components using camelCase names
- [ ] Handle component variants and states
- [ ] Utilize dependency mapping for property relationships
- [ ] Add positioning and layout logic

### Phase 3: Enhanced Features (Future)
- [ ] Custom component templates
- [ ] Batch component generation
- [ ] Export/import configurations
- [ ] Advanced styling options
- [ ] Property validation and constraints

## Technical Details

### State Management
Uses Jotai atoms for efficient state management:
- `selectedComponentAtom`: Currently selected component
- `selectedComponentPropertiesAtom`: Properties of selected component
- `propertyUsedStatesAtom`: Current checkbox (used) states
- `updatedComponentPropertiesAtom`: Computed final component data with applied states

### Property System
- **Dual Naming**: Each property has both `name` (API) and `displayName` (UI)
- **Usage Tracking**: `used` boolean controls whether property is applied
- **Dependency Mapping**: `dependentProperty` shows relationships between properties
- **Type Safety**: Full TypeScript interfaces prevent runtime errors

### Performance Optimizations
- Atomic state updates prevent unnecessary re-renders
- Efficient object spread operations instead of deep cloning
- Optimized dependency arrays in React hooks
- Conditional rendering for unused properties

## Resources

- [Create Figma Plugin Documentation](https://yuanqing.github.io/create-figma-plugin/)
- [Figma Plugin API Documentation](https://figma.com/plugin-docs/)
- [Figma Plugin Samples](https://github.com/figma/plugin-samples)
- [Jotai Documentation](https://jotai.org/)
- [Preact Documentation](https://preactjs.com/)