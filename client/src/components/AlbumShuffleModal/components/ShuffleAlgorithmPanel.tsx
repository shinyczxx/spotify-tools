/**
 * @file ShuffleAlgorithmPanel.tsx
 * @description Panel for selecting shuffle algorithm with descriptions
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframePanel } from '@components/wireframe'
import { TooltipIcon } from '@components/wireframe/TooltipIcon'
import { ShuffleConfig } from 'types/albumShuffle'
import { ShuffleAlgorithm } from 'types/playlist'
import './ShuffleAlgorithmPanel.css'

interface ShuffleAlgorithmPanelProps {
  shuffleConfig: ShuffleConfig
  onShuffleConfigChange: (config: Partial<ShuffleConfig>) => void
  disabled?: boolean
}

export const ShuffleAlgorithmPanel: React.FC<ShuffleAlgorithmPanelProps> = ({
  shuffleConfig,
  onShuffleConfigChange,
  disabled = false,
}) => {
  const getAlgorithmDescription = (algorithm: ShuffleAlgorithm): string => {
    switch (algorithm) {
      case 'random':
        return 'Pure random shuffle of all albums'
      case 'weighted-newer':
        return 'Prefers recently released albums with randomness'
      case 'weighted-older':
        return 'Prefers classic/vintage albums with randomness'
      case 'chronological':
        return 'Orders by release date with 30% randomness'
      case 'spiral-dance':
        return 'Creates a spiral pattern alternating between alphabetical and chronological order'
      default:
        return ''
    }
  }

  return (
    <WireframePanel title="shuffle algorithm" className="shuffle-algorithm-panel">
      <div className="shuffle-algorithm-content">
        <div className="algorithm-selector">
          <select
            value={shuffleConfig.algorithm}
            onChange={(e) =>
              onShuffleConfigChange({
                algorithm: e.target.value as ShuffleAlgorithm,
              })
            }
            disabled={disabled}
            className="algorithm-select"
          >
            <option value="random">random shuffle</option>
            <option value="weighted-newer">weighted (newer albums preferred)</option>
            <option value="weighted-older">weighted (older albums preferred)</option>
            <option value="chronological">chronological (with randomness)</option>
            <option value="spiral-dance">
              spiral dance (alphabetical + chronological weave)
            </option>
          </select>
          <TooltipIcon
            contents={
              <div className="algorithm-tooltip">
                <div>
                  <strong>Random:</strong> Pure random shuffle
                </div>
                <div>
                  <strong>Weighted Newer:</strong> Prefers recent releases
                </div>
                <div>
                  <strong>Weighted Older:</strong> Prefers classic albums
                </div>
                <div>
                  <strong>Chronological:</strong> Release date order with 30% randomness
                </div>
                <div>
                  <strong>Spiral Dance:</strong> Weaves between alphabetical and chronological
                  order
                </div>
              </div>
            }
            size={16}
            direction="left"
            ariaLabel="Shuffle algorithm help"
          />
        </div>
        <div className="algorithm-description">
          {getAlgorithmDescription(shuffleConfig.algorithm)}
        </div>
      </div>
    </WireframePanel>
  )
}