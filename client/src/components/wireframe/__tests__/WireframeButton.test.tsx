/**
 * @file WireframeButton.test.tsx
 * @description Unit tests for WireframeButton component
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-10
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { WireframeButton } from '../WireframeButton'

describe('WireframeButton', () => {
  it('should render button with text', () => {
    render(<WireframeButton>Test Button</WireframeButton>)

    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<WireframeButton onClick={handleClick}>Clickable Button</WireframeButton>)

    const button = screen.getByRole('button', { name: 'Clickable Button' })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<WireframeButton disabled>Disabled Button</WireframeButton>)

    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(
      <WireframeButton disabled onClick={handleClick}>
        Disabled Button
      </WireframeButton>,
    )

    const button = screen.getByRole('button', { name: 'Disabled Button' })
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply variant styles', () => {
    render(<WireframeButton variant="panel">Panel Button</WireframeButton>)

    const button = screen.getByRole('button', { name: 'Panel Button' })
    expect(button).toHaveClass('wireframe-panel-button')
  })

  it('should apply full width styles', () => {
    render(<WireframeButton fullWidth>Full Width Button</WireframeButton>)

    const button = screen.getByRole('button', { name: 'Full Width Button' })
    expect(button).toHaveClass('wireframe-button-full-width')
  })

  it('should apply custom className', () => {
    render(<WireframeButton className="custom-class">Custom Button</WireframeButton>)

    const button = screen.getByRole('button', { name: 'Custom Button' })
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('wireframe-button')
  })

  it('should pass through other props', () => {
    render(
      <WireframeButton data-testid="test-button" type="submit">
        Submit Button
      </WireframeButton>,
    )

    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
