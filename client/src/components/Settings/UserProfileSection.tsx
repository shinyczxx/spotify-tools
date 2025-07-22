/**
 * @file UserProfileSection.tsx
 * @description User profile section for Settings page
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeButton } from '../wireframe'

interface UserProfileSectionProps {
  user: {
    id: string
    display_name: string
    product?: string
  } | null
  onLogout: () => void
}

/**
 * Displays user profile information and logout functionality
 */
export const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  user,
  onLogout,
}) => {
  if (!user) return null

  return (
    <div className="user-profile-section">
      <p className="user-display-name">
        logged in as: {user.display_name}
      </p>
      <p className="user-details">
        account: {user.id} • plan: {user.product || 'unknown'}
      </p>
      <WireframeButton onClick={onLogout}>logout</WireframeButton>
    </div>
  )
}