# Component Builder v2

A Figma plugin for dynamically building component variants from a component set based on a selected subset of its properties.

## Features

-   **Inspect Component Sets**: Select a component set in Figma to view all its properties.
-   **Dynamic Variant Creation**: Choose which properties to include in a new component variant.
-   **Property Management**:
    -   Handles various property types including `VARIANT`, `TEXT`, and `INSTANCE_SWAP`.
    -   Intelligently manages dependent properties.
    -   Filters out internal or hidden properties from the UI.
-   **Robust Error Handling**: Graceful error handling and recovery for common Figma API issues.
-   **Input Validation**: Ensures data passed between the UI and the plugin backend is valid.

## How It Works

The plugin consists of a UI (likely built with Preact, as inferred from `vitest.config.ts`) and a backend that runs in Figma's main thread.

1.  **Selection**: The user selects a component set in Figma.
2.  **Property Fetching**: The UI sends a `GET_COMPONENT_SET_PROPERTIES` event with the component set key to the backend.
3.  **Backend Processing**:
    -   The `main.ts` file receives the event.
    -   It uses `figma.importComponentSetByKeyAsync` to get the component set node.
    -   `getComponentPropertyInfo` is called to extract and process all component properties.
    -   The properties are sent back to the UI via a `COMPONENT_SET_PROPERTIES` event.
4.  **User Interaction**:
    -   The UI displays the properties, allowing the user to enable or disable them.
    -   Helper functions in `ui_utils.ts` are used to determine property visibility and clean up names for display.
5.  **Building the Component**:
    -   The user clicks a "Build" button, which triggers a `BUILD` event with the state of all properties.
    -   `buildUpdatedComponent` function is invoked with the user's selection.
    -   This function constructs a new component variant with only the selected properties.

## Project Structure

-   `src/main.ts`: The main plugin entry point. Handles communication with the UI and orchestrates the main logic.
-   `src/buildComponent.ts`: Entry point for the component building logic.
-   `src/figma_functions/coreUtils.ts`: Contains core logic for interacting with the Figma API, like `getComponentPropertyInfo`.
-   `src/ui_utils.ts`: Utility functions for processing property data for the UI.
-   `src/types.ts`: Contains all TypeScript type definitions for the project.
-   `src/constants.ts`: Defines shared constants like property prefixes and UI dimensions.
-   `src/errors.ts`: A dedicated service for error handling and recovery.
-   `src/validation.ts`: Implements input validation logic.

## Development

### Setup

Install dependencies:

```bash
npm install
```

### Building the plugin

Run the build command:

```bash
npm run build
```

Then, load the `manifest.json` in Figma's desktop app to install the plugin locally.

### Testing

This project uses Vitest for unit testing.

-   **Environment**: `jsdom`
-   **Setup**: Test setup is configured in `src/test/setup.ts`.
-   **Framework**: Uses Preact for component testing, with aliases for `react` and `react-dom` to `preact/compat`.

To run tests:

```bash
npm test
```