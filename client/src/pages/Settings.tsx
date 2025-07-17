/**
 * @file Settings.tsx
 * @description Wireframe settings page for album shuffle app
 * @author GitHub Copilot
 * @version 5.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 5.0.0: Converted to wireframe theme
 * - 4.0.0: Converted to basic layout (removed circuit board components)
 * - 3.0.0: Settings page with ControlledFlowLayout and theme configuration
 */

import React, { useState } from 'react'
import {
  WireframePanel,
  WireframeButton,
  WireframeToggle,
  WireframeSelect,
} from '@components/wireframe'
import ColorVariablesModal from '@components/ColorVariablesModal'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { useGridBackground } from '@hooks/ui/useGridBackground'
import { useCRTEffect } from '@hooks/ui/useCRTEffect'
import '@styles/wireframe.css'

const Settings: React.FC = () => {
  const { user, handleLogout } = useSpotifyAuth()
  const [isColorModalOpen, setIsColorModalOpen] = useState(false)
  const [importFileRef] = useState(React.createRef<HTMLInputElement>())

  // Grid background controls
  const {
    gridSettings,
    toggleGrid,
    toggleGlitches,
    setGridSize,
    toggleHighContrast,
    resetToDefaults,
  } = useGridBackground()

  // CRT effect controls
  const {
    crtSettings,
    toggleCRT,
    setIntensity,
    setScanlineSize,
    toggleFlicker,
    toggleMovingScanline,
    resetCRTSettings,
  } = useCRTEffect()

  // Color variable state for all CSS variables
  const [colorSettings, setColorSettings] = useState({
    '--grid-color': '#e0e0e0', // Light gray grid color
    '--terminal-cyan': '#00ffff',
    '--terminal-cyan-bright': '#66ffff',
    '--terminal-cyan-dim': '#009999',
    '--terminal-cyan-dark': '#006666',
    '--terminal-bg': '#000000',
    '--terminal-dark': '#001122',
    '--terminal-medium': '#002244',
    '--terminal-gray-dim': '#333333',
    '--text-cyan': '#00ffff',
    '--terminal-error': '#ff4444',
    '--terminal-error-border': '#ff6666',
    '--terminal-error-bg': '#220000',
    '--terminal-orange': '#ff8800',
    '--terminal-green': '#00ff00',
    '--terminal-red': '#ff0000',
    '--terminal-red-bright': '#ff6666',
    '--terminal-red-dim': '#cc0000',
  })

  const handleColorChange = (variable: string, color: string) => {
    setColorSettings((prev) => ({ ...prev, [variable]: color }))
    // Apply the change immediately
    document.documentElement.style.setProperty(variable, color)
  }

  const handleExportData = () => {
    const settings = {
      colorSettings,
      user: user?.id,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'album-shuffle-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = async () => {
    if (importFileRef.current) {
      importFileRef.current.click()
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedData = JSON.parse(text)

      // Validate and merge imported color settings with defaults
      if (importedData.colorSettings && typeof importedData.colorSettings === 'object') {
        const newColorSettings = { ...colorSettings }

        // Only import valid color values
        Object.entries(importedData.colorSettings).forEach(([key, value]) => {
          if (typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)) {
            if (key in colorSettings) {
              ;(newColorSettings as any)[key] = value
            }
          }
        })

        // Apply the imported colors
        setColorSettings(newColorSettings)
        Object.entries(newColorSettings).forEach(([variable, color]) => {
          document.documentElement.style.setProperty(variable, color)
        })

        console.log('Settings imported successfully')
      } else {
        console.warn('No valid color settings found in imported file')
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
    }

    // Reset file input
    if (importFileRef.current) {
      importFileRef.current.value = ''
    }
  }

  return (
    <div className="wireframe-container">
      <WireframePanel title="settings" variant="header">
        {user && (
          <div
            style={{
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: '1px solid var(--terminal-cyan-dim)',
            }}
          >
            <p style={{ margin: '0 0 5px 0', color: 'var(--terminal-cyan-bright)' }}>
              logged in as: {user.display_name}
            </p>
            <p style={{ margin: '0 0 10px 0', opacity: 0.7, fontSize: '12px' }}>
              account: {user.id} • plan: {user.product || 'unknown'}
            </p>
            <WireframeButton onClick={handleLogout}>logout</WireframeButton>
          </div>
        )}
      </WireframePanel>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {/* Grid Background Configuration */}
        <WireframePanel title="grid background">
          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                color: 'var(--terminal-cyan-bright)',
                margin: '0 0 15px 0',
                fontSize: '14px',
              }}
            >
              background settings
            </h4>

            <p style={{ opacity: 0.8, margin: '0 0 20px 0', fontSize: '13px' }}>
              configure the global grid background and subtle glitch effects.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <WireframeToggle
                checked={gridSettings.enabled}
                onChange={toggleGrid}
                label="enable grid background"
                size="medium"
              />

              <WireframeToggle
                checked={gridSettings.glitchEnabled}
                onChange={toggleGlitches}
                label="enable glitch effects"
                size="medium"
                disabled={!gridSettings.enabled}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  style={{
                    color: 'var(--terminal-cyan)',
                    fontSize: '12px',
                    textTransform: 'lowercase',
                    letterSpacing: '1px',
                  }}
                >
                  grid size
                </label>
                <WireframeSelect
                  options={[
                    { value: 'small', label: 'small (20px)' },
                    { value: 'medium', label: 'medium (40px)' },
                    { value: 'large', label: 'large (60px)' },
                  ]}
                  value={gridSettings.size}
                  onChange={(value) => setGridSize(value as 'small' | 'medium' | 'large')}
                  disabled={!gridSettings.enabled}
                  size="medium"
                />
              </div>

              <WireframeToggle
                checked={gridSettings.highContrast}
                onChange={toggleHighContrast}
                label="high contrast mode"
                size="medium"
                disabled={!gridSettings.enabled}
              />

              <div style={{ marginTop: '10px' }}>
                <WireframeButton onClick={resetToDefaults}>reset to defaults</WireframeButton>
              </div>
            </div>
          </div>
        </WireframePanel>

        {/* CRT Effects Configuration */}
        <WireframePanel title="crt effects">
          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                color: 'var(--terminal-cyan-bright)',
                margin: '0 0 15px 0',
                fontSize: '14px',
              }}
            >
              retro monitor effects
            </h4>

            <p style={{ opacity: 0.8, margin: '0 0 20px 0', fontSize: '13px' }}>
              add authentic crt monitor scan lines, flicker, and color separation effects.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <WireframeToggle
                checked={crtSettings.enabled}
                onChange={toggleCRT}
                label="enable crt effects"
                size="medium"
              />

              <div style={{ opacity: crtSettings.enabled ? 1 : 0.5 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: 'var(--terminal-cyan)',
                    fontSize: '12px',
                    textTransform: 'lowercase',
                    letterSpacing: '1px',
                  }}
                >
                  effect intensity
                </label>
                <WireframeSelect
                  options={[
                    { value: 'low', label: 'low (30%)' },
                    { value: 'medium', label: 'medium (60%)' },
                    { value: 'high', label: 'high (100%)' },
                  ]}
                  value={crtSettings.intensity}
                  onChange={(value) => setIntensity(value as 'low' | 'medium' | 'high')}
                  disabled={!crtSettings.enabled}
                  size="medium"
                />
              </div>

              <div style={{ opacity: crtSettings.enabled ? 1 : 0.5 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: 'var(--terminal-cyan)',
                    fontSize: '12px',
                    textTransform: 'lowercase',
                    letterSpacing: '1px',
                  }}
                >
                  scanline thickness
                </label>
                <WireframeSelect
                  options={[
                    { value: 'fine', label: 'fine (1px)' },
                    { value: 'normal', label: 'normal (2px)' },
                    { value: 'thick', label: 'thick (4px)' },
                  ]}
                  value={crtSettings.scanlineSize}
                  onChange={(value) => setScanlineSize(value as 'fine' | 'normal' | 'thick')}
                  disabled={!crtSettings.enabled}
                  size="medium"
                />
              </div>

              <WireframeToggle
                checked={crtSettings.flickerEnabled}
                onChange={toggleFlicker}
                label="screen flicker"
                size="medium"
                disabled={!crtSettings.enabled}
              />

              <WireframeToggle
                checked={crtSettings.movingScanline}
                onChange={toggleMovingScanline}
                label="moving scanline"
                size="medium"
                disabled={!crtSettings.enabled}
              />

              <div style={{ marginTop: '10px' }}>
                <WireframeButton onClick={resetCRTSettings}>reset crt defaults</WireframeButton>
              </div>
            </div>
          </div>
        </WireframePanel>

        {/* Theme Configuration */}
        <WireframePanel title="color configuration">
          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                color: 'var(--terminal-cyan-bright)',
                margin: '0 0 15px 0',
                fontSize: '14px',
              }}
            >
              color customization
            </h4>

            <p style={{ opacity: 0.8, margin: '0 0 15px 0', fontSize: '13px' }}>
              Customize individual color variables used throughout the application.
            </p>

            <WireframeButton onClick={() => setIsColorModalOpen(true)}>
              open color editor
            </WireframeButton>
          </div>
        </WireframePanel>

        {/* Data Management */}
        <WireframePanel title="data management">
          <div style={{ marginBottom: '15px' }}>
            <p style={{ opacity: 0.8, margin: '0 0 15px 0', fontSize: '13px' }}>
              export or import your settings. all spotify data remains on spotify's servers.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <WireframeButton onClick={handleExportData}>export settings</WireframeButton>
              <WireframeButton onClick={() => console.log('Clear data')}>
                clear local data
              </WireframeButton>
              <WireframeButton onClick={handleImportData}>import settings</WireframeButton>
            </div>

            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </div>
        </WireframePanel>

        {/* About */}
        <WireframePanel title="about">
          <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
            <p style={{ margin: '0 0 10px 0', opacity: 0.8 }}>album shuffle v1.0.0</p>
            <p style={{ margin: '0 0 10px 0', opacity: 0.7 }}>
              terminal-inspired spotify playlist tools
            </p>
            <p style={{ margin: '0', opacity: 0.6 }}>
              built with react, typescript, and the spotify web api
            </p>
          </div>
        </WireframePanel>
      </div>

      <ColorVariablesModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        colorSettings={colorSettings}
        onColorChange={handleColorChange}
        onApplyColors={() => {
          // Colors are applied immediately via handleColorChange
          setIsColorModalOpen(false)
        }}
      />

      {/* Hidden file input for importing settings */}
      <input
        type="file"
        accept=".json"
        ref={importFileRef}
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />
    </div>
  )
}

export default Settings
