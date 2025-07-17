/**
 * @file FontSizeChanger.tsx
 * @description Font size control component within circuit board panel.
 * Integrates with accessibility settings and terminal theme styling.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-09
 */

import React, { useState, useEffect } from 'react'
import './FontSizeChanger.css'

interface FontSizeChangerProps {
  fontSize: number
  onFontSizeChange: (size: number) => void
  className?: string
  variant?: 'default' | 'panel' | 'header'
}

const FontSizeChanger: React.FC<FontSizeChangerProps> = ({
  fontSize,
  onFontSizeChange,
  className = '',
  variant = 'panel',
}) => {
  const [localFontSize, setLocalFontSize] = useState(fontSize)
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Predefined font size options
  const fontSizePresets = [
    { label: 'xs', value: 12 },
    { label: 's', value: 14 },
    { label: 'm', value: 16 },
    { label: 'l', value: 18 },
    { label: 'xl', value: 20 },
    { label: 'xxl', value: 24 },
  ]

  const minFontSize = 10
  const maxFontSize = 32

  useEffect(() => {
    setLocalFontSize(fontSize)

    // Check if current size matches any preset
    const isPreset = fontSizePresets.some((preset) => preset.value === fontSize)
    setIsCustomMode(!isPreset)
  }, [fontSize])

  const handlePresetChange = (newSize: number) => {
    setLocalFontSize(newSize)
    setIsCustomMode(false)
    onFontSizeChange(newSize)

    // Persist to localStorage
    try {
      localStorage.setItem('spotify-app-font-size', newSize.toString())
    } catch (error) {
      console.warn('Failed to save font size preference:', error)
    }
  }

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10)
    setLocalFontSize(newSize)
    setIsCustomMode(true)
    onFontSizeChange(newSize)

    // Persist to localStorage
    try {
      localStorage.setItem('spotify-app-font-size', newSize.toString())
    } catch (error) {
      console.warn('Failed to save font size preference:', error)
    }
  }

  const handleReset = () => {
    const defaultSize = 14
    setLocalFontSize(defaultSize)
    setIsCustomMode(false)
    onFontSizeChange(defaultSize)

    try {
      localStorage.removeItem('spotify-app-font-size')
    } catch (error) {
      console.warn('Failed to clear font size preference:', error)
    }
  }

  const increaseSize = () => {
    const newSize = Math.min(localFontSize + 2, maxFontSize)
    if (newSize !== localFontSize) {
      setLocalFontSize(newSize)
      setIsCustomMode(true)
      onFontSizeChange(newSize)
    }
  }

  const decreaseSize = () => {
    const newSize = Math.max(localFontSize - 2, minFontSize)
    if (newSize !== localFontSize) {
      setLocalFontSize(newSize)
      setIsCustomMode(true)
      onFontSizeChange(newSize)
    }
  }

  return (
    <div
      className={`font-size-changer wireframe-box ${
        variant === 'panel' ? 'wireframe-panel' : ''
      } ${className}`}
    >
      <div className="wireframe-panel-title">font size control</div>

      <div className="font-size-content">
        {/* Current size display */}
        <div className="current-size-display">
          <span className="size-label">current size:</span>
          <span className="size-value">{localFontSize}px</span>
          {isCustomMode && <span className="custom-indicator">(custom)</span>}
        </div>

        {/* Quick adjust buttons */}
        <div className="quick-adjust">
          <button
            className="wireframe-button size-adjust-btn"
            onClick={decreaseSize}
            disabled={localFontSize <= minFontSize}
            aria-label="Decrease font size"
          >
            a-
          </button>
          <button
            className="wireframe-button size-adjust-btn"
            onClick={increaseSize}
            disabled={localFontSize >= maxFontSize}
            aria-label="Increase font size"
          >
            a+
          </button>
        </div>

        {/* Preset buttons */}
        <div className="preset-buttons">
          <div className="preset-label">presets:</div>
          <div className="preset-grid">
            {fontSizePresets.map((preset) => (
              <button
                key={preset.label}
                className={`wireframe-button preset-btn ${
                  !isCustomMode && localFontSize === preset.value ? 'active' : ''
                }`}
                onClick={() => handlePresetChange(preset.value)}
                aria-label={`Set font size to ${preset.value}px`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom size slider */}
        <div className="custom-control">
          <label htmlFor="font-size-slider" className="slider-label">
            custom size:
          </label>
          <div className="slider-container">
            <span className="slider-min">{minFontSize}</span>
            <input
              type="range"
              id="font-size-slider"
              min={minFontSize}
              max={maxFontSize}
              value={localFontSize}
              onChange={handleCustomChange}
              className="font-size-slider"
              aria-label="Custom font size slider"
            />
            <span className="slider-max">{maxFontSize}</span>
          </div>
        </div>

        {/* Reset button */}
        <div className="reset-control">
          <button
            className="wireframe-button reset-btn"
            onClick={handleReset}
            aria-label="Reset font size to default"
          >
            reset to default
          </button>
        </div>

        {/* Preview text */}
        <div className="preview-text" style={{ fontSize: `${localFontSize}px` }}>
          <span>preview: terminal font at {localFontSize}px</span>
        </div>
      </div>
    </div>
  )
}

export default FontSizeChanger
