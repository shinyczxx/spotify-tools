/**
 * @file ShuffleAlgorithmPanel.tsx
 * @description Panel for selecting shuffle algorithm with descriptions
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframePanel } from '@components/wireframe'
import { WireframeSelect } from '@components/wireframe/WireframeSelect'
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
          <WireframeSelect
            value={shuffleConfig.algorithm}
            onChange={(value) =>
              onShuffleConfigChange({
                algorithm: value as ShuffleAlgorithm,
              })
            }
            options={[
              { value: 'random', label: 'random shuffle' },
              { value: 'weighted-newer', label: 'weighted (newer albums preferred)' },
              { value: 'weighted-older', label: 'weighted (older albums preferred)' },
              { value: 'chronological', label: 'chronological (with randomness)' },
              { value: 'spiral-dance', label: 'spiral dance (alphabetical + chronological weave)' },
            ]}
            disabled={disabled}
            className="algorithm-select"
            size="medium"
            labelPosition="none"
          />
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