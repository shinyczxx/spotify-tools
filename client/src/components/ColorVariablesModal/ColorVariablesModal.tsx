/**
 * @file ColorVariablesModal.tsx
 * @description Modal for editing individual color variables with descriptive names
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-15
 */

import React from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import './ColorVariablesModal.css'

export interface ColorVariable {
  key: string
  value: string
  description: string
  category: 'primary' | 'background' | 'accent' | 'status'
}

interface ColorVariablesModalProps {
  isOpen: boolean
  onClose: () => void
  colorSettings: Record<string, string>
  onColorChange: (variable: string, color: string) => void
  onApplyColors: () => void
}

// Map color variables to descriptive names and categories
const COLOR_VARIABLE_MAP: ColorVariable[] = [
  {
    key: '--grid-color',
    value: '',
    description: 'Grid Line Color (background grid)',
    category: 'background',
  },
  {
    key: '--terminal-cyan',
    value: '',
    description: 'Primary UI Color (borders, text)',
    category: 'primary',
  },
  {
    key: '--terminal-cyan-bright',
    value: '',
    description: 'Primary Hover Color',
    category: 'primary',
  },
  {
    key: '--terminal-cyan-dim',
    value: '',
    description: 'Primary Disabled Color',
    category: 'primary',
  },
  {
    key: '--terminal-cyan-dark',
    value: '',
    description: 'Primary Shadow Color',
    category: 'primary',
  },
  { key: '--terminal-bg', value: '', description: 'Main Background Color', category: 'background' },
  {
    key: '--terminal-dark',
    value: '',
    description: 'Dark Background Sections',
    category: 'background',
  },
  {
    key: '--terminal-medium',
    value: '',
    description: 'Medium Background Elements',
    category: 'background',
  },
  {
    key: '--terminal-gray-dim',
    value: '',
    description: 'Subtle Background Elements',
    category: 'background',
  },
  {
    key: '--terminal-orange',
    value: '',
    description: 'Warning/Refresh Button Color',
    category: 'accent',
  },
  { key: '--terminal-green', value: '', description: 'Success Color', category: 'status' },
  { key: '--terminal-error', value: '', description: 'Error Text Color', category: 'status' },
  {
    key: '--terminal-error-border',
    value: '',
    description: 'Error Border Color',
    category: 'status',
  },
  {
    key: '--terminal-error-bg',
    value: '',
    description: 'Error Background Color',
    category: 'status',
  },
  { key: '--terminal-red', value: '', description: 'Danger Color', category: 'status' },
  {
    key: '--terminal-red-bright',
    value: '',
    description: 'Danger Hover Color',
    category: 'status',
  },
  {
    key: '--terminal-red-dim',
    value: '',
    description: 'Danger Disabled Color',
    category: 'status',
  },
]

export const ColorVariablesModal: React.FC<ColorVariablesModalProps> = ({
  isOpen,
  onClose,
  colorSettings,
  onColorChange,
  onApplyColors,
}) => {
  const colorVariables = COLOR_VARIABLE_MAP.map((variable) => ({
    ...variable,
    value: colorSettings[variable.key] || '#000000',
  }))

  const categoryGroups = {
    primary: colorVariables.filter((v) => v.category === 'primary'),
    background: colorVariables.filter((v) => v.category === 'background'),
    accent: colorVariables.filter((v) => v.category === 'accent'),
    status: colorVariables.filter((v) => v.category === 'status'),
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <WireframePanel className="modal-content-panel">
          <div className="modal-header">
            <h2 className="modal-title">Color Variable Editor</h2>
            <WireframeButton onClick={onClose} className="close-button">
              ×
            </WireframeButton>
          </div>

          <div className="color-variables-modal">
            <p className="modal-description">
              Customize individual color variables used throughout the application. Changes will be
              applied immediately to preview the effects.
            </p>

            {Object.entries(categoryGroups).map(([category, variables]) => (
              <div key={category} className="color-category">
                <h4 className="category-title">{category} colors</h4>
                <div className="color-grid">
                  {variables.map((variable) => (
                    <div key={variable.key} className="color-variable-item">
                      <div className="color-input-group">
                        <label className="color-label">{variable.description}</label>
                        <div className="color-input-wrapper">
                          <input
                            type="color"
                            value={variable.value}
                            onChange={(e) => onColorChange(variable.key, e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={variable.value}
                            onChange={(e) => onColorChange(variable.key, e.target.value)}
                            className="color-text-input"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      <div
                        className="color-preview"
                        style={{ backgroundColor: variable.value }}
                        title={`Preview of ${variable.description}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="modal-actions">
              <WireframeButton onClick={onApplyColors}>apply changes</WireframeButton>
              <WireframeButton onClick={onClose}>close</WireframeButton>
            </div>
          </div>
        </WireframePanel>
      </div>
    </div>
  )
}
