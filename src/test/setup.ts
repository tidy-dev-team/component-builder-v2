import '@testing-library/jest-dom';
import { h } from 'preact';

// Mock Figma API
global.figma = {
  notify: vi.fn(),
  currentPage: {
    appendChild: vi.fn(),
  },
  viewport: {
    scrollAndZoomIntoView: vi.fn(),
  },
  importComponentSetByKeyAsync: vi.fn(),
  importComponentByKeyAsync: vi.fn(),
  variables: {
    getLocalVariableCollectionsAsync: vi.fn(),
    getVariableByIdAsync: vi.fn(),
    createVariableCollection: vi.fn(),
    createVariable: vi.fn(),
  },
  mixed: Symbol('mixed'),
} as any;

// Mock create-figma-plugin utilities
vi.mock('@create-figma-plugin/utilities', () => ({
  on: vi.fn(),
  emit: vi.fn(),
  showUI: vi.fn(),
}));

// Mock create-figma-plugin UI components
vi.mock('@create-figma-plugin/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => 
    h('button', { onClick, ...props }, children),
  Container: ({ children, ...props }: any) => 
    h('div', { ...props }, children),
  Dropdown: ({ children, ...props }: any) => 
    h('select', { ...props }, children),
  Checkbox: ({ children, ...props }: any) => 
    h('input', { type: 'checkbox', ...props }, children),
  VerticalSpace: () => h('div', { style: { height: '8px' } }),
  render: (component: any) => component,
}));