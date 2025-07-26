/**
 * @file ColorConfigSection.tsx
 * @description Color configuration section for Settings page
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-24
 */

import React from 'react'
import { WireframeButton, WireframeSelect } from '../wireframe'
import { useThemeManager } from '@hooks/business/useThemeManager'

interface ColorConfigSectionProps {
  onOpenColorEditor: () => void
}

/**
 * Color configuration controls with theme selector
 */
export const ColorConfigSection: React.FC<ColorConfigSectionProps> = ({
  onOpenColorEditor,
}) => {
  const { currentTheme, availableThemes, loading, changeTheme } = useThemeManager()

  const themeOptions = availableThemes.map(theme => ({
    value: theme.name.toLowerCase(),
    label: theme.name,
    description: theme.description,
  }))

  return (
    <div className="color-config-section">
      <h4 className="section-title">
        theme & color customization
      </h4>

      <div className="theme-selector-section">
        <p className="section-description">
          Choose a predefined theme or customize individual colors manually.
        </p>

        <div className="theme-selector">
          <WireframeSelect
            label="theme"
            options={themeOptions}
            value={currentTheme}
            onChange={changeTheme}
            disabled={loading}
            placeholder={loading ? "Loading themes..." : "Select theme"}
            labelPosition="left"
            variant="dropdown"
          />
        </div>
      </div>

      <div className="manual-color-section">
        <p className="section-description">
          For advanced customization, you can manually adjust individual color variables.
        </p>

        <WireframeButton onClick={onOpenColorEditor}>
          open manual color editor
        </WireframeButton>
      </div>
    </div>
  )
}