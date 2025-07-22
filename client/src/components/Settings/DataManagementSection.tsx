/**
 * @file DataManagementSection.tsx
 * @description Data management section for Settings page
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeButton } from '../wireframe'

interface DataManagementSectionProps {
  onExportData: () => void
  onImportData: () => void
  onClearData: () => void
  importFileRef: React.RefObject<HTMLInputElement>
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  isImporting?: boolean
  importError?: string | null
}

/**
 * Data management controls for import/export/clear operations
 */
export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  onExportData,
  onImportData,
  onClearData,
  importFileRef,
  onFileImport,
  isImporting = false,
  importError,
}) => {
  return (
    <div className="data-management-section">
      <p className="section-description">
        export or import your settings. all spotify data remains on spotify's servers.
      </p>

      {importError && (
        <div className="import-error">
          {importError}
        </div>
      )}

      <div className="data-actions">
        <WireframeButton onClick={onExportData} disabled={isImporting}>
          export settings
        </WireframeButton>
        <WireframeButton onClick={onClearData} disabled={isImporting}>
          clear local data
        </WireframeButton>
        <WireframeButton onClick={onImportData} disabled={isImporting}>
          {isImporting ? 'importing...' : 'import settings'}
        </WireframeButton>
      </div>

      <input
        ref={importFileRef}
        type="file"
        accept=".json"
        onChange={onFileImport}
        className="hidden-file-input"
      />
    </div>
  )
}