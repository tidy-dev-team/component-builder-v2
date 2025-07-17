# PropGate Plugin - LLM Context File

## Project Overview

**PropGate** is a Figma plugin that generates UI components on the canvas based on user configuration. It uses a **pure generic component system** that works with any Figma component through dynamic property discovery.

### Key Architecture Principles
- **Generic-First**: Single generator handles ALL components
- **Dynamic Discovery**: Properties auto-discovered from Figma components
- **Minimal Configuration**: Only need component name, key, and type
- **Universal Compatibility**: Works with any standard Figma component

## Tech Stack

- **Framework**: Preact for lightweight UI
- **Build System**: Create Figma Plugin (@create-figma-plugin/build)
- **State Management**: Jotai with atomic state pattern
- **Language**: TypeScript with strict typing
- **Testing**: Vitest framework
- **Validation**: Comprehensive input validation and sanitization system

## Architecture

### Dual-Thread Architecture
- `src/main.ts` - Main thread (Figma API operations)
- `src/ui.tsx` - UI thread (interface)
- Communication via EventHandlers (`BuildHandler`, `CloseHandler`)

### Core Systems

#### 1. Generic Component System
- **Location**: `src/figma_components/genericGenerator.ts`
- **Purpose**: Single generator that handles ALL component types
- **Key Function**: `generateGenericComponent(options)`
- **Auto-Discovery**: `getComponentProperties(componentSet)` discovers properties from Figma

#### 2. Component Registry
- **Location**: `src/component_data/index.ts`
- **Purpose**: Simple registry with component keys and basic info
- **Structure**: Just name, key, and type - properties discovered dynamically
- **Functions**: `registerComponent()`, `getComponentData()`, `isKnownComponent()`

#### 3. Build System
- **Location**: `src/buildComponent/`
- **Orchestrator**: `buildOrchestrator.ts` - Main build coordination
- **Validator**: `componentValidator.ts` - Component validation and cloning
- **Processors**: `propertyProcessor.ts`, `variantProcessor.ts`
- **Renderer**: Canvas rendering delegated to `figma_components/`

#### 4. Validation System
- **Location**: `src/validation/`
- **Input Validator**: `inputValidator.ts` - Comprehensive input validation
- **Sanitizer**: `inputSanitizer.ts` - Input sanitization and normalization
- **Schemas**: `schemas.ts` - Validation rules and security patterns
- **Error Handling**: `validationErrors.ts` - Structured error types

#### 5. Error Handling
- **Location**: `src/errors/`
- **Service**: `errorService.ts` - Centralized error handling
- **Recovery**: `errorRecovery.ts` - Error recovery strategies
- **Types**: `types.ts` - Error type definitions

#### 6. State Management (Jotai)
- **Location**: `src/state/atoms.ts`
- **Key Atoms**:
  - `selectedComponentAtom` - Currently selected component
  - `selectedComponentPropertiesAtom` - Properties of selected component
  - `propertyUsedStatesAtom` - Checkbox states for property usage
  - `updatedComponentPropertiesAtom` - Computed final component data

#### 7. UI System
- **Main UI**: `src/ui.tsx` - Main interface with modern gradient styling
- **Components**: `src/ui_components/` - Button, Checkbox, Dropdown
- **Elements**: `src/ui_elements.tsx` - Property rendering with grouped sections
- **Utils**: `src/ui_utils.ts` - UI utility functions

## Project Structure

```
src/
├── main.ts                    # Plugin main thread
├── ui.tsx                     # UI entry point with sleek styling
├── types.ts                   # TypeScript interfaces
├── componentData.ts           # Re-exports component registry
├── state/atoms.ts             # Jotai state atoms
├── component_data/            # Component registry (minimal)
│   ├── index.ts               # Simple component registry
│   └── README.md              # Component system documentation
├── figma_components/          # Generic component generation
│   ├── genericGenerator.ts    # Universal component generator
│   └── index.ts               # Exports and registry
├── buildComponent/            # Build orchestration
│   ├── buildOrchestrator.ts   # Main build coordination
│   ├── canvasRenderer.ts      # Canvas rendering utilities
│   ├── componentValidator.ts  # Component validation
│   ├── propertyProcessor.ts   # Property processing
│   └── variantProcessor.ts    # Variant processing
├── validation/                # Input validation system
│   ├── inputValidator.ts      # Main validation logic
│   ├── inputSanitizer.ts      # Input sanitization
│   ├── schemas.ts             # Validation schemas
│   └── validationErrors.ts    # Error types
├── errors/                    # Error handling system
│   ├── errorService.ts        # Centralized error handling
│   ├── errorRecovery.ts       # Recovery strategies
│   └── types.ts               # Error type definitions
├── ui_components/             # UI components
│   ├── Button.tsx             # Enhanced button with gradients
│   ├── Checkbox.tsx           # Checkbox component
│   └── Dropdown.tsx           # Dropdown component
├── ui_elements.tsx            # Property rendering logic
├── ui_utils.ts                # UI utility functions
├── figma_functions/           # Figma API utilities
└── test/                      # Test files (Vitest)
```

## Key Interfaces

### ComponentProperty
```typescript
interface ComponentProperty {
  name: string;           // camelCase API name
  displayName: string;    // UI display name  
  value: string | boolean; // default value
  used: boolean;          // whether property is applied
  dependentProperty?: DependentProperty; // dependency relationships
}
```

### ComponentData
```typescript
interface ComponentData {
  [componentName: string]: {
    name: string;
    key: string;
    type: "componentSet" | "component";
    properties?: ComponentProperty[]; // Optional, auto-discovered
  };
}
```

### BuildEventData
```typescript
interface BuildEventData {
  [propertyName: string]: boolean;
}
```

## Current Component Registry

```typescript
const componentRegistry: ComponentData = {
  Avatar: {
    name: "Avatar",
    key: "e978573d54b4b61133aaa9fb1287eef36df0e1ed",
    type: "componentSet",
  },
  IconButton: {
    name: "IconButton", 
    key: "37a61a1f231653e5fe0d8fb5afeb561f1dfe3807",
    type: "componentSet",
  },
  Badge: {
    name: "Badge",
    key: "383eda2f42660613057a870cde686c7e8b076904",
    type: "componentSet",
  },
  CheckboxTest: {
    name: "Checkbox for test",
    key: "d921cc1b6daeca95638113d222cca11a2f117273",
    type: "componentSet",
  },
};
```

## Supported Property Types

The generic generator automatically supports all standard Figma property types:

- **Variant Properties**: `buttonType#primary`, `size#large`, `state#hover`
- **Boolean Properties**: `disabled`, `selected`, `hasIcon`, `isVisible`
- **Text Properties**: `label`, `placeholder`, `description`
- **Instance Swap**: `icon`, `avatar`, `illustration`

## Development Commands

```bash
npm run build          # Build with typecheck and minification
npm run watch          # Watch mode for development
npm test              # Run Vitest tests
npm run typecheck     # TypeScript checking only
```

## Installation in Figma

After building, import the generated `manifest.json` file into Figma desktop app via "Import plugin from manifest..." in Quick Actions.

## Key Development Patterns

### Adding New Components
```typescript
// Method 1: Add to componentRegistry
"MyNewComponent": {
  name: "My New Component",
  key: "abcdef1234567890abcdef1234567890abcdef12",
  type: "componentSet"
}

// Method 2: Dynamic registration
registerComponent("MyNewComponent", {
  name: "My New Component", 
  key: "abcdef1234567890abcdef1234567890abcdef12",
  type: "componentSet"
});
```

### Component Property Dependencies
Use `dependentProperty` field for relationships:
- `{kind: "text", name: "propertyName", value: "✏️ propertyName"}` - Editable dependency
- `{kind: "instance swap", name: "propertyName", value: "🔁 propertyName"}` - Reactive dependency

### Error Handling Pattern
```typescript
try {
  // Operation
} catch (error) {
  errorService.handleError(error, {
    operation: 'OPERATION_NAME',
    context: additionalContext,
  });
  throw error;
}
```

### Validation Pattern
```typescript
const validationResult = InputValidator.validateComponentName(name);
if (!validationResult.valid) {
  throw errorService.createValidationError(
    ErrorCode.INVALID_INPUT,
    formatValidationErrors(validationResult.errors),
    { input: name }
  );
}
```

## Important Notes

- All component properties use camelCase naming for Figma API compatibility
- Property `used` boolean controls whether property is applied to generated component
- State management is atomic - avoid deep cloning, use object spread
- The plugin UI is sized to 320x360 pixels
- Console debugging available via Figma's "Open Console" Quick Action
- Security validation happens before sanitization in the validation pipeline
- Generic generator discovers properties automatically - no manual configuration needed

## Recent Major Changes

1. **Simplified to Generic-Only System**: Removed all specialized generators, now uses single generic generator for all components
2. **Cleaned Component Data**: Removed individual component data files, simplified to basic registry
3. **Enhanced Validation**: Comprehensive input validation and sanitization system
4. **Modern UI**: Sleek gradient-based UI with improved visual hierarchy
5. **Modular Architecture**: Separated concerns into distinct modules with clear responsibilities

## Testing

- **Framework**: Vitest
- **Location**: `src/test/`
- **Coverage**: Validation system, error handling, build components, UI components
- **Run Tests**: `npm test`

## Plugin Manifest

```json
{
  "api": "1.0.0",
  "editorType": ["figma"],
  "id": "component-builder-test-v2", 
  "name": "PropGate",
  "main": "build/main.js",
  "ui": "build/ui.js"
}
```

## Future LLM Instructions

When working with this project:

1. **Use Generic System**: Always use `generateGenericComponent()` - no specialized generators needed
2. **Component Addition**: Only need name, key, and type - properties auto-discovered
3. **Follow Validation**: Use validation system for all user inputs
4. **Error Handling**: Use centralized error service with structured error types
5. **State Management**: Use Jotai atoms, avoid deep mutations
6. **Testing**: Add tests for new functionality using Vitest
7. **Build Verification**: Always run `npm run build` to verify TypeScript compatibility

This system is designed to scale infinitely with minimal configuration - perfect for handling tens or hundreds of components with the same property types.