/**
 * @file AdvancedShufflePanel.tsx
 * @description Advanced shuffle settings panel with Last.fm integration
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-12
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with Last.fm settings and tag controls
 */

import React, { useState, useEffect } from 'react'
import {
  AdvancedShuffleSettings,
  defaultAdvancedSettings,
} from '../../utils/advancedShuffleSettings'

interface AdvancedShufflePanelProps {
  settings: AdvancedShuffleSettings
  onSettingsChange: (settings: AdvancedShuffleSettings) => void
  isLastFmAuthenticated: boolean
  accentColor?: string
}

const AdvancedShufflePanel: React.FC<AdvancedShufflePanelProps> = ({
  settings,
  onSettingsChange,
  isLastFmAuthenticated,
  accentColor = 'var(--circuit-color)',
}) => {
  const [localSettings, setLocalSettings] = useState<AdvancedShuffleSettings>(settings)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    onSettingsChange(localSettings)
  }, [localSettings, onSettingsChange])

  const updateSetting = (key: keyof AdvancedShuffleSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateNestedSetting = (
    parentKey: keyof AdvancedShuffleSettings,
    childKey: string,
    value: any,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value,
      },
    }))
  }

  const addBlacklistTag = () => {
    if (newTag.trim() && !localSettings.blacklistTags.includes(newTag.trim())) {
      updateSetting('blacklistTags', [...localSettings.blacklistTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeBlacklistTag = (tag: string) => {
    updateSetting(
      'blacklistTags',
      localSettings.blacklistTags.filter((t) => t !== tag),
    )
  }

  const SliderInput: React.FC<{
    label: string
    value: number
    onChange: (value: number) => void
    disabled?: boolean
    min?: number
    max?: number
  }> = ({ label, value, onChange, disabled = false, min = 0, max = 100 }) => (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          marginBottom: '4px',
          color: disabled ? '#666' : '#fff',
        }}
      >
        {label}: {value}%
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        style={{
          width: '100%',
          accentColor: disabled ? '#666' : accentColor,
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  )

  const CheckboxInput: React.FC<{
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
  }> = ({ label, checked, onChange, disabled = false }) => (
    <div style={{ marginBottom: '8px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '12px',
          color: disabled ? '#666' : '#fff',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            marginRight: '8px',
            accentColor: disabled ? '#666' : accentColor,
            opacity: disabled ? 0.5 : 1,
          }}
        />
        {label}
      </label>
    </div>
  )

  const styles = {
    section: {
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: 'rgba(0, 20, 40, 0.3)',
      borderRadius: '4px',
      border: `1px solid ${accentColor}20`,
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '8px',
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '4px',
      marginBottom: '8px',
    },
    tag: {
      padding: '2px 6px',
      backgroundColor: `${accentColor}20`,
      border: `1px solid ${accentColor}40`,
      borderRadius: '2px',
      fontSize: '10px',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    tagRemove: {
      cursor: 'pointer',
      color: '#ff4444',
      fontWeight: 'bold',
    },
    tagInput: {
      display: 'flex',
      gap: '4px',
      marginTop: '8px',
    },
    input: {
      flex: 1,
      padding: '4px 6px',
      backgroundColor: 'rgba(0, 20, 40, 0.8)',
      border: `1px solid ${accentColor}40`,
      borderRadius: '2px',
      color: '#fff',
      fontSize: '12px',
    },
    button: {
      padding: '4px 8px',
      backgroundColor: 'transparent',
      border: `1px solid ${accentColor}`,
      color: accentColor,
      borderRadius: '2px',
      cursor: 'pointer',
      fontSize: '12px',
    },
  }

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {/* Last.fm Integration */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Last.fm Integration</div>
        <CheckboxInput
          label="Use Last.fm data for enhanced recommendations"
          checked={localSettings.useLastFmData}
          onChange={(checked) => updateSetting('useLastFmData', checked)}
          disabled={!isLastFmAuthenticated}
        />
        {!isLastFmAuthenticated && (
          <p style={{ fontSize: '10px', color: '#ff8800', margin: '4px 0' }}>
            Sign in to Last.fm in Settings to enable this feature
          </p>
        )}
        <SliderInput
          label="Last.fm Tags Weight"
          value={localSettings.lastFmTagsWeight}
          onChange={(value) => updateSetting('lastFmTagsWeight', value)}
          disabled={!isLastFmAuthenticated || !localSettings.useLastFmData}
        />
        <SliderInput
          label="Similar Albums Weight"
          value={localSettings.lastFmSimilarAlbumsWeight}
          onChange={(value) => updateSetting('lastFmSimilarAlbumsWeight', value)}
          disabled={!isLastFmAuthenticated || !localSettings.useLastFmData}
        />
      </div>

      {/* Tag Filtering */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Tag Filtering</div>
        <div>
          <label style={{ fontSize: '12px', color: '#fff', marginBottom: '4px', display: 'block' }}>
            Blacklisted Tags (avoid these):
          </label>
          <div style={styles.tagContainer}>
            {localSettings.blacklistTags.map((tag, index) => (
              <div key={index} style={styles.tag}>
                {tag}
                <span style={styles.tagRemove} onClick={() => removeBlacklistTag(tag)}>
                  ×
                </span>
              </div>
            ))}
          </div>
          <div style={styles.tagInput}>
            <input
              style={styles.input}
              placeholder="Add tag to blacklist..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBlacklistTag()}
            />
            <button style={styles.button} onClick={addBlacklistTag}>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Album Type Preferences */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Album Types</div>
        <SliderInput
          label="Albums"
          value={localSettings.albumTypeWeights.album}
          onChange={(value) => updateNestedSetting('albumTypeWeights', 'album', value)}
        />
        <SliderInput
          label="Singles"
          value={localSettings.albumTypeWeights.single}
          onChange={(value) => updateNestedSetting('albumTypeWeights', 'single', value)}
        />
        <SliderInput
          label="Compilations"
          value={localSettings.albumTypeWeights.compilation}
          onChange={(value) => updateNestedSetting('albumTypeWeights', 'compilation', value)}
        />
      </div>

      {/* Release Date & Popularity */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Discovery Preferences</div>
        <SliderInput
          label="Release Date Weight (0=older, 100=newer)"
          value={localSettings.releaseDateWeight}
          onChange={(value) => updateSetting('releaseDateWeight', value)}
        />
        <SliderInput
          label="Popularity Weight"
          value={localSettings.popularityWeight}
          onChange={(value) => updateSetting('popularityWeight', value)}
        />
        <CheckboxInput
          label="Prefer obscure albums"
          checked={localSettings.preferObscure}
          onChange={(checked) => updateSetting('preferObscure', checked)}
        />
      </div>

      {/* Diversity Settings */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Diversity</div>
        <SliderInput
          label="Artist Diversification"
          value={localSettings.artistDiversification}
          onChange={(value) => updateSetting('artistDiversification', value)}
        />
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#fff' }}>
            Max albums per artist: {localSettings.maxAlbumsPerArtist}
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={localSettings.maxAlbumsPerArtist}
            onChange={(e) => updateSetting('maxAlbumsPerArtist', parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor,
            }}
          />
        </div>
      </div>

      {/* Smart Features */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Smart Features</div>
        <CheckboxInput
          label="Adaptive selection (learn from listening history)"
          checked={localSettings.adaptiveSelection}
          onChange={(checked) => updateSetting('adaptiveSelection', checked)}
        />
        <CheckboxInput
          label="Seasonal adjustment"
          checked={localSettings.seasonalAdjustment}
          onChange={(checked) => updateSetting('seasonalAdjustment', checked)}
        />
      </div>
    </div>
  )
}

export default AdvancedShufflePanel
