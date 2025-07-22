/**
 * @file ColorConfigSection.tsx
 * @description Color configuration section for Settings page
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeButton } from '../wireframe'

interface ColorConfigSectionProps {
  onOpenColorEditor: () => void
}

/**
 * Color configuration controls
 */
export const ColorConfigSection: React.FC<ColorConfigSectionProps> = ({
  onOpenColorEditor,
}) => {
  return (
    <div className="color-config-section">
      <h4 className="section-title">
        color customization
      </h4>

      <p className="section-description">
        Customize individual color variables used throughout the application.
      </p>

      <WireframeButton onClick={onOpenColorEditor}>
        open color editor
      </WireframeButton>
    </div>
  )
}