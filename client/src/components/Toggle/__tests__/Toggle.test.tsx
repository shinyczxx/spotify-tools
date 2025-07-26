/**
 * @file Toggle.test.tsx
 * @description Tests for Toggle component functionality and styling
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-24
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Toggle } from '../Toggle'
import '../Toggle.css'

describe('Toggle Component', () => {
  const defaultProps = {
    leftLabel: 'left option',
    rightLabel: 'right option',
    selected: 'left' as const,
    onToggle: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders with correct labels', () => {
    render(<Toggle {...defaultProps} />)
    
    expect(screen.getByText('left option')).toBeInTheDocument()
    expect(screen.getByText('right option')).toBeInTheDocument()
  })

  test('shows correct selected state', () => {
    render(<Toggle {...defaultProps} selected="left" />)
    
    const leftButton = screen.getByText('left option').closest('button')
    const rightButton = screen.getByText('right option').closest('button')
    
    expect(leftButton).toHaveClass('selected')
    expect(rightButton).not.toHaveClass('selected')
  })

  test('calls onToggle when clicked', () => {
    const mockOnToggle = jest.fn()
    render(<Toggle {...defaultProps} onToggle={mockOnToggle} />)
    
    const rightButton = screen.getByText('right option').closest('button')
    fireEvent.click(rightButton!)
    
    expect(mockOnToggle).toHaveBeenCalledWith('right')
  })

  test('selected button has correct color styling', () => {
    render(<Toggle {...defaultProps} selected="right" />)
    
    const rightButton = screen.getByText('right option').closest('button')
    expect(rightButton).toHaveClass('selected')
    
    // Check computed styles
    const computedStyle = window.getComputedStyle(rightButton!)
    expect(computedStyle.backgroundColor).toBe('rgb(0, 255, 255)') // --terminal-cyan
    expect(computedStyle.color).toBe('rgb(0, 0, 0)') // --terminal-bg
  })

  test('non-selected button has correct color styling', () => {
    render(<Toggle {...defaultProps} selected="right" />)
    
    const leftButton = screen.getByText('left option').closest('button')
    expect(leftButton).not.toHaveClass('selected')
    
    // Check computed styles
    const computedStyle = window.getComputedStyle(leftButton!)
    expect(computedStyle.backgroundColor).toBe('rgb(0, 0, 0)') // --terminal-bg
    expect(computedStyle.color).toBe('rgb(0, 255, 255)') // --terminal-cyan
  })

  test('text contrast is visible in both states', () => {
    render(<Toggle {...defaultProps} selected="left" />)
    
    const leftButton = screen.getByText('left option').closest('button')
    const rightButton = screen.getByText('right option').closest('button')
    
    // Selected button: cyan background, black text
    const selectedStyle = window.getComputedStyle(leftButton!)
    expect(selectedStyle.backgroundColor).toBe('rgb(0, 255, 255)')
    expect(selectedStyle.color).toBe('rgb(0, 0, 0)')
    
    // Non-selected button: black background, cyan text  
    const nonSelectedStyle = window.getComputedStyle(rightButton!)
    expect(nonSelectedStyle.backgroundColor).toBe('rgb(0, 0, 0)')
    expect(nonSelectedStyle.color).toBe('rgb(0, 255, 255)')
  })
})