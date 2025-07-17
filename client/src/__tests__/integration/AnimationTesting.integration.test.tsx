/**
 * @file AnimationTesting.integration.test.tsx
 * @description Integration tests for Animation Testing page
 * @author GitHub Copilot
 * @version 2.0.0
 * @date 2025-07-12
 */

import { render, screen, fireEvent } from '@testing-library/react'
import AnimationTesting from '@pages/AnimationTesting'

// Mock the FlowLayout component directly
jest.mock('../../components/CircuitBoardComponents/FlowLayout', () => {
  return function MockFlowLayout({ panels, onPanelClick }: any) {
    return (
      <div data-testid="flow-layout">
        <div data-testid="panel-config">
          {panels?.map((panel: any, index: number) => (
            <div
              key={panel.id || index}
              data-testid={`panel-${panel.id || index}`}
              onClick={() => onPanelClick?.(panel.id)}
              role="button"
              tabIndex={0}
            >
              {panel.title || `Panel ${index}`}
            </div>
          ))}
        </div>
      </div>
    )
  }
})

// Also mock the components index
jest.mock('../../components/CircuitBoardComponents', () => {
  return {
    FlowLayout: function MockFlowLayout({ panels, onPanelClick }: any) {
      return (
        <div data-testid="flow-layout">
          <div data-testid="panel-config">
            {panels?.map((panel: any, index: number) => (
              <div
                key={panel.id || index}
                data-testid={`panel-${panel.id || index}`}
                onClick={() => onPanelClick?.(panel.id)}
                role="button"
                tabIndex={0}
              >
                {panel.title || `Panel ${index}`}
              </div>
            ))}
          </div>
        </div>
      )
    },
  }
})

describe('AnimationTesting Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the animation testing interface', () => {
    render(<AnimationTesting />)

    expect(screen.getByTestId('flow-layout')).toBeInTheDocument()
    expect(screen.getByTestId('panel-config')).toBeInTheDocument()
  })

  it('should render animation test panels', () => {
    render(<AnimationTesting />)

    const panelConfig = screen.getByTestId('panel-config')
    expect(panelConfig).toBeInTheDocument()

    // Should have some test panels
    const panels = screen.getAllByTestId(/^panel-/)
    expect(panels.length).toBeGreaterThan(0)
  })

  it('should handle panel clicks', () => {
    render(<AnimationTesting />)

    const firstPanel = screen.getAllByTestId(/^panel-/)[0]
    expect(firstPanel).toBeInTheDocument()

    // Should not throw when clicking
    fireEvent.click(firstPanel)
  })
})
