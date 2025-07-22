/**
 * @file ProgressSection.tsx
 * @description Progress bar section for auth status
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface ProgressSectionProps {
  progressBar: string
  statusColor: string
}

/**
 * Displays progress bar with label
 */
export const ProgressSection: React.FC<ProgressSectionProps> = ({
  progressBar,
  statusColor,
}) => {
  return (
    <div className="progress-section">
      <div className="progress-label">PROGRESS:</div>
      <div className="progress-bar" style={{ color: statusColor }}>
        {progressBar}
      </div>
    </div>
  )
}