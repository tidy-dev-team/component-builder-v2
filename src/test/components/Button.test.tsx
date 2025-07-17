/** @jsx h */
import { h } from 'preact';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { ButtonComponent } from '../../ui_components/Button';

describe('ButtonComponent', () => {
  it('should render with correct text', () => {
    const mockCallback = vi.fn();
    render(<ButtonComponent callback={mockCallback} />);
    
    expect(screen.getByText('Build on canvas')).toBeInTheDocument();
  });

  it('should call callback when clicked', async () => {
    const mockCallback = vi.fn();
    render(<ButtonComponent callback={mockCallback} />);
    
    const button = screen.getByText('Build on canvas');
    fireEvent.click(button);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});