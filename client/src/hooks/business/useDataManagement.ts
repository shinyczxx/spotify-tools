/**
 * @file useDataManagement.ts
 * @description Custom hook for data import/export functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useRef, useCallback } from 'react'
import { ColorSettings } from './useColorSettings'

export interface ExportData {
  colorSettings: ColorSettings
  user?: string
  exportDate: string
}

export interface UseDataManagementProps {
  colorSettings: ColorSettings
  onColorImport: (settings: Partial<ColorSettings>) => void
  userId?: string
}

/**
 * Custom hook for managing data import/export functionality
 */
export const useDataManagement = ({
  colorSettings,
  onColorImport,
  userId,
}: UseDataManagementProps) => {
  const importFileRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExportData = useCallback(() => {
    const settings: ExportData = {
      colorSettings,
      user: userId,
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
  }, [colorSettings, userId])

  const triggerImport = useCallback(() => {
    if (importFileRef.current) {
      importFileRef.current.click()
    }
  }, [])

  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsImporting(true)
      setImportError(null)

      try {
        const text = await file.text()
        const importedData: Partial<ExportData> = JSON.parse(text)

        // Validate and import color settings
        if (importedData.colorSettings && typeof importedData.colorSettings === 'object') {
          onColorImport(importedData.colorSettings)
          console.log('Settings imported successfully')
        } else {
          setImportError('No valid color settings found in imported file')
        }
      } catch (error) {
        console.error('Failed to import settings:', error)
        setImportError('Failed to import settings. Please check the file format.')
      } finally {
        setIsImporting(false)
        
        // Reset file input
        if (importFileRef.current) {
          importFileRef.current.value = ''
        }
      }
    },
    [onColorImport],
  )

  const clearLocalData = useCallback(() => {
    // Clear localStorage, sessionStorage, or other local data
    localStorage.removeItem('album-shuffle-settings')
    localStorage.removeItem('spotify-auth')
    console.log('Local data cleared')
  }, [])

  return {
    importFileRef,
    isImporting,
    importError,
    handleExportData,
    triggerImport,
    handleFileImport,
    clearLocalData,
  }
}