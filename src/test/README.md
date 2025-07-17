# Testing Setup

This project uses Vitest for testing with the following configuration:

## Test Scripts
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI dashboard

## Test Structure
- `src/test/setup.ts` - Test setup with mocks for Figma API and create-figma-plugin
- `src/test/utils.test.ts` - Tests for utility functions
- `src/test/atoms.test.ts` - Tests for Jotai atoms
- `src/test/components/` - UI component tests

## Mocked Dependencies
- Figma API (`global.figma`)
- `@create-figma-plugin/utilities` (on, emit, showUI)
- `@create-figma-plugin/ui` (Button, Container, Dropdown, etc.)

## Writing Tests
For UI components, use the JSX pragma:
```tsx
/** @jsx h */
import { h } from 'preact';
```

The setup file automatically mocks create-figma-plugin components as simple HTML elements for testing.