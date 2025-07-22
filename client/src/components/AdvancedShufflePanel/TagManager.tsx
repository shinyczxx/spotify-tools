/**
 * @file TagManager.tsx
 * @description Tag blacklist management component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface TagManagerProps {
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  accentColor: string
}

/**
 * Manages tag blacklist with add/remove functionality
 */
export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
  accentColor,
}) => {
  const [newTag, setNewTag] = React.useState('')

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim())
      setNewTag('')
    }
  }

  return (
    <div>
      <label className="tag-manager-label">
        Blacklisted Tags (avoid these):
      </label>
      <div className="tag-container">
        {tags.map((tag, index) => (
          <div key={index} className="tag">
            {tag}
            <span 
              className="tag-remove" 
              onClick={() => onRemoveTag(tag)}
            >
              ×
            </span>
          </div>
        ))}
      </div>
      <div className="tag-input">
        <input
          className="tag-input-field"
          placeholder="Add tag to blacklist..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          style={{
            borderColor: `${accentColor}40`,
          }}
        />
        <button 
          className="tag-input-button"
          onClick={handleAddTag}
          style={{
            borderColor: accentColor,
            color: accentColor,
          }}
        >
          Add
        </button>
      </div>
    </div>
  )
}