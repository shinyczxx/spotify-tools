/**
 * @file AboutSection.tsx
 * @description About section for Settings page
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

/**
 * Displays application information and version details
 */
export const AboutSection: React.FC = () => {
  return (
    <div className="about-section">
      <p className="app-version">album shuffle v1.0.0</p>
      <p className="app-description">
        terminal-inspired spotify playlist tools
      </p>
      <p className="tech-stack">
        built with react, typescript, and the spotify web api
      </p>
    </div>
  )
}