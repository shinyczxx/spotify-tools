/**
 * @file Settings.tsx
 * @description Settings page with modular section components
 * @author Caleb Price
 * @version 6.0.0
 * @date 2025-07-22
 *
 * @ChangeLog
 * - 6.0.0: Modularized into section components and custom hooks
 * - 5.0.0: Converted to wireframe theme
 * - 4.0.0: Converted to basic layout (removed circuit board components)
 * - 3.0.0: Settings page with ControlledFlowLayout and theme configuration
 */

import React, { useState } from 'react'
import { WireframePanel } from '@components/wireframe'
import ColorVariablesModal from '@components/ColorVariablesModal'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { useGridBackground } from '@hooks/ui/useGridBackground'
import { useCRTEffect } from '@hooks/ui/useCRTEffect'
import { useColorSettings } from '@hooks/business/useColorSettings'
import { useDataManagement } from '@hooks/business/useDataManagement'
import { UserProfileSection } from '@components/Settings/UserProfileSection'
import { GridBackgroundSection } from '@components/Settings/GridBackgroundSection'
import { CRTEffectsSection } from '@components/Settings/CRTEffectsSection'
import { ColorConfigSection } from '@components/Settings/ColorConfigSection'
import { DataManagementSection } from '@components/Settings/DataManagementSection'
import { AboutSection } from '@components/Settings/AboutSection'
import './Settings.css'

const Settings: React.FC = () => {
  const { user, handleLogout } = useSpotifyAuth()
  const [isColorModalOpen, setIsColorModalOpen] = useState(false)

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

  // Color settings management
  const {
    colorSettings,
    handleColorChange,
    importColorSettings,
    resetToDefaults: resetColorDefaults,
  } = useColorSettings()

  // Data management
  const {
    importFileRef,
    isImporting,
    importError,
    handleExportData,
    triggerImport,
    handleFileImport,
    clearLocalData,
  } = useDataManagement({
    colorSettings,
    onColorImport: importColorSettings,
    userId: user?.id,
  })

  return (
    <div className="wireframe-container">
      <WireframePanel title="settings" variant="header">
        <UserProfileSection user={user} onLogout={handleLogout} />
      </WireframePanel>

      <div className="settings-grid">
        {/* Grid Background Configuration */}
        <WireframePanel title="grid background">
          <GridBackgroundSection
            gridSettings={gridSettings}
            onToggleGrid={toggleGrid}
            onToggleGlitches={toggleGlitches}
            onSetGridSize={setGridSize}
            onToggleHighContrast={toggleHighContrast}
            onResetToDefaults={resetToDefaults}
          />
        </WireframePanel>

        {/* CRT Effects Configuration */}
        <WireframePanel title="crt effects">
          <CRTEffectsSection
            crtSettings={crtSettings}
            onToggleCRT={toggleCRT}
            onSetIntensity={setIntensity}
            onSetScanlineSize={setScanlineSize}
            onToggleFlicker={toggleFlicker}
            onToggleMovingScanline={toggleMovingScanline}
            onResetCRTSettings={resetCRTSettings}
          />
        </WireframePanel>

        {/* Color Configuration */}
        <WireframePanel title="color configuration">
          <ColorConfigSection onOpenColorEditor={() => setIsColorModalOpen(true)} />
        </WireframePanel>

        {/* Data Management */}
        <WireframePanel title="data management">
          <DataManagementSection
            onExportData={handleExportData}
            onImportData={triggerImport}
            onClearData={clearLocalData}
            importFileRef={importFileRef}
            onFileImport={handleFileImport}
            isImporting={isImporting}
            importError={importError}
          />
        </WireframePanel>

        {/* About */}
        <WireframePanel title="about">
          <AboutSection />
        </WireframePanel>
      </div>

      <ColorVariablesModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        colorSettings={colorSettings}
        onColorChange={handleColorChange}
        onApplyColors={() => {
          setIsColorModalOpen(false)
        }}
      />
    </div>
  )
}

export default Settings
